const express = require('express');
const fs = require('fs');
const rateLimit = require('express-rate-limit');
const bcrypt = require('bcrypt');
const { pool } = require('../db');

const router = express.Router();

const downloadLimiter = rateLimit({
  windowMs: 60_000, // 1 minute
  max: 30,          // 30 requests/min per IP
});

router.get('/d/:token', downloadLimiter, async (req, res) => {
  try {
    const { token } = req.params;
    const providedPassword = (req.query.password || '').toString();

    const q = await pool.query(
      `SELECT sl.*, f.disk_path, f.original_name, f.mime_type
       FROM share_links sl
       JOIN files f ON f.id = sl.file_id
       WHERE sl.token = $1`,
      [token]
    );
    const link = q.rows[0];
    if (!link) return res.status(404).json({ error: 'link not found' });

    if (new Date() > new Date(link.expires_at)) {
      return res.status(410).json({ error: 'link expired' });
    }

    if (link.max_downloads > 0 && link.downloads_count >= link.max_downloads) {
      return res.status(429).json({ error: 'download limit reached' });
    }

    if (link.password_hash) {
      if (!providedPassword) return res.status(401).json({ error: 'password required' });
      const ok = await bcrypt.compare(providedPassword, link.password_hash);
      if (!ok) return res.status(401).json({ error: 'invalid password' });
    }

    if (!fs.existsSync(link.disk_path)) {
      return res.status(404).json({ error: 'file missing on server' });
    }

    await pool.query('UPDATE share_links SET downloads_count = downloads_count + 1 WHERE id = $1', [link.id]);

    res.setHeader('Content-Type', link.mime_type || 'application/octet-stream');
    res.setHeader('Content-Disposition', `attachment; filename="${link.original_name}"`);
    fs.createReadStream(link.disk_path).pipe(res);
  } catch (e) {
    console.error(e);
    if (!res.headersSent) res.status(500).json({ error: 'server error' });
  }
});

module.exports = router;

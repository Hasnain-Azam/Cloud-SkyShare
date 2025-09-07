const express = require('express');
const bcrypt = require('bcrypt');
const dayjs = require('dayjs');
const { nanoid } = require('nanoid');
const { pool } = require('../db');
const { authRequired } = require('../middleware/auth');

const router = express.Router();

// Create a share link for a file the user owns
router.post('/:fileId', authRequired, async (req, res) => {
  try {
    const fileId = Number(req.params.fileId);
    const { expiresInHours = 24, maxDownloads = 0, password = '' } = req.body;

    const f = await pool.query(
      'SELECT id FROM files WHERE id = $1 AND user_id = $2',
      [fileId, req.user.id]
    );
    if (!f.rows[0]) return res.status(404).json({ error: 'file not found' });

    const token = nanoid(32);
    const expiresAt = dayjs().add(Number(expiresInHours) || 24, 'hour').toDate();
    const passwordHash = password ? await bcrypt.hash(password, 10) : null;

    const { rows } = await pool.query(
      `INSERT INTO share_links (file_id, token, expires_at, max_downloads, password_hash)
       VALUES ($1,$2,$3,$4,$5)
       RETURNING id, token, expires_at, max_downloads, downloads_count, created_at`,
      [fileId, token, expiresAt, maxDownloads, passwordHash]
    );

    res.status(201).json({ link: `/d/${rows[0].token}`, ...rows[0] });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'server error' });
  }
});

module.exports = router;

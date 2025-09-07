const express = require('express');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const { nanoid } = require('nanoid');
const { pool } = require('../db');
const { authRequired } = require('../middleware/auth');

const router = express.Router();

const UPLOAD_DIR = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_DIR),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, nanoid() + ext);
  },
});
const upload = multer({ storage });

router.use(authRequired);

router.post('/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file provided' });
    const { originalname, filename, mimetype, size, path: diskPath } = req.file;
    const { rows } = await pool.query(
      `INSERT INTO files (user_id, original_name, stored_name, mime_type, size_bytes, disk_path)
       VALUES ($1,$2,$3,$4,$5,$6)
       RETURNING id, original_name, stored_name, mime_type, size_bytes, created_at`,
      [req.user.id, originalname, filename, mimetype, size, diskPath]
    );
    res.status(201).json(rows[0]);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'server error' });
  }
});

router.get('/', async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT id, original_name, stored_name, mime_type, size_bytes, created_at
       FROM files WHERE user_id = $1 ORDER BY created_at DESC`,
      [req.user.id]
    );
    res.json(rows);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'server error' });
  }
});

module.exports = router;

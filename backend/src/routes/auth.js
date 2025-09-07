const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { pool } = require('../db');

const router = express.Router();
const SALT_ROUNDS = 10;

router.post('/register', async (req, res) => {
  try {
    const { email, password, name = '' } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'email and password required' });
    if (password.length < 6) return res.status(400).json({ error: 'password too short (min 6)' });

    const pwHash = await bcrypt.hash(password, SALT_ROUNDS);
    const { rows } = await pool.query(
      `INSERT INTO users (email, password_hash, name) VALUES ($1,$2,$3)
       RETURNING id, email, name, created_at`,
      [email.toLowerCase(), pwHash, name]
    );

    const user = rows[0];
    const token = jwt.sign({}, process.env.JWT_SECRET, { subject: String(user.id), expiresIn: '7d' });
    res.status(201).json({ token, user });
  } catch (err) {
    if (String(err?.message || '').includes('duplicate key')) {
      return res.status(409).json({ error: 'email already registered' });
    }
    console.error(err);
    res.status(500).json({ error: 'server error' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'email and password required' });

    const { rows } = await pool.query('SELECT * FROM users WHERE email = $1', [email.toLowerCase()]);
    const user = rows[0];
    if (!user) return res.status(401).json({ error: 'invalid credentials' });

    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok) return res.status(401).json({ error: 'invalid credentials' });

    const token = jwt.sign({}, process.env.JWT_SECRET, { subject: String(user.id), expiresIn: '7d' });
    res.json({ token, user: { id: user.id, email: user.email, name: user.name, created_at: user.created_at } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'server error' });
  }
});

module.exports = router;

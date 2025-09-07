const express = require('express');
const { pool } = require('../db');
const { authRequired } = require('../middleware/auth');

const router = express.Router();
router.use(authRequired);

router.get('/', async (req, res) => {
  try {
    const { rows } = await pool.query(
      'SELECT id, title, description, created_at, updated_at FROM items WHERE user_id = $1 ORDER BY created_at DESC',
      [req.user.id]
    );
    res.json(rows);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'server error' });
  }
});

router.post('/', async (req, res) => {
  try {
    const { title, description = '' } = req.body;
    if (!title) return res.status(400).json({ error: 'title required' });
    const { rows } = await pool.query(
      `INSERT INTO items (user_id, title, description)
       VALUES ($1,$2,$3)
       RETURNING id, title, description, created_at, updated_at`,
      [req.user.id, title, description]
    );
    res.status(201).json(rows[0]);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'server error' });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { title, description } = req.body;
    if (!id || Number.isNaN(id)) return res.status(400).json({ error: 'invalid id' });
    const { rows } = await pool.query(
      `UPDATE items SET
         title = COALESCE($1,title),
         description = COALESCE($2,description),
         updated_at = NOW()
       WHERE id = $3 AND user_id = $4
       RETURNING id, title, description, created_at, updated_at`,
      [title ?? null, description ?? null, id, req.user.id]
    );
    const item = rows[0];
    if (!item) return res.status(404).json({ error: 'not found' });
    res.json(item);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'server error' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!id || Number.isNaN(id)) return res.status(400).json({ error: 'invalid id' });
    const { rowCount } = await pool.query('DELETE FROM items WHERE id = $1 AND user_id = $2', [id, req.user.id]);
    if (rowCount === 0) return res.status(404).json({ error: 'not found' });
    res.status(204).send();
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'server error' });
  }
});

module.exports = router;

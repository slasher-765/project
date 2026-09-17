const express = require('express');
const db = require('../config/database');
const { requireUuid, requiredString } = require('../middleware/validateRequest');

const router = express.Router();

router.get('/', async (req, res, next) => {
  try {
    const result = await db.query('SELECT id, name, email, created_at, updated_at FROM users ORDER BY name');
    res.json({ data: result.rows });
  } catch (error) { next(error); }
});

router.post('/', async (req, res, next) => {
  try {
    const name = requiredString(req.body.name, 'name', 120);
    const email = requiredString(req.body.email, 'email', 255).toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw Object.assign(new Error('email must be valid'), { status: 400, code: 'VALIDATION_ERROR' });
    const result = await db.query(
      'INSERT INTO users (name, email) VALUES ($1, $2) RETURNING id, name, email, created_at, updated_at',
      [name, email]
    );
    res.status(201).json({ data: result.rows[0] });
  } catch (error) { next(error); }
});

router.get('/:userId', async (req, res, next) => {
  try {
    const userId = requireUuid(req.params.userId, 'userId');
    const result = await db.query('SELECT id, name, email, created_at, updated_at FROM users WHERE id = $1', [userId]);
    if (!result.rowCount) return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'User not found' } });
    res.json({ data: result.rows[0] });
  } catch (error) { next(error); }
});

router.patch('/:userId', async (req, res, next) => {
  try {
    const userId = requireUuid(req.params.userId, 'userId');
    const values = [];
    const fields = [];
    if (req.body.name !== undefined) { fields.push(`name = $${values.length + 1}`); values.push(requiredString(req.body.name, 'name', 120)); }
    if (req.body.email !== undefined) { const email = requiredString(req.body.email, 'email', 255).toLowerCase(); if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw Object.assign(new Error('email must be valid'), { status: 400, code: 'VALIDATION_ERROR' }); fields.push(`email = $${values.length + 1}`); values.push(email); }
    if (!fields.length) throw Object.assign(new Error('At least one field is required'), { status: 400, code: 'VALIDATION_ERROR' });
    values.push(userId);
    const result = await db.query(`UPDATE users SET ${fields.join(', ')}, updated_at = NOW() WHERE id = $${values.length} RETURNING id, name, email, created_at, updated_at`, values);
    if (!result.rowCount) return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'User not found' } });
    res.json({ data: result.rows[0] });
  } catch (error) { next(error); }
});

router.delete('/:userId', async (req, res, next) => {
  try {
    const userId = requireUuid(req.params.userId, 'userId');
    const result = await db.query('DELETE FROM users WHERE id = $1', [userId]);
    if (!result.rowCount) return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'User not found' } });
    res.status(204).send();
  } catch (error) { next(error); }
});

module.exports = router;

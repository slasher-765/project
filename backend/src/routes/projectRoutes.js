const express = require('express');
const db = require('../config/database');
const { requireUuid, optionalString, requiredString, enumValue } = require('../middleware/validateRequest');

const router = express.Router();
const roles = ['owner', 'admin', 'member'];

router.get('/', async (req, res, next) => {
  try {
    const result = await db.query('SELECT id, name, description, created_at, updated_at FROM projects ORDER BY created_at DESC');
    res.json({ data: result.rows });
  } catch (error) { next(error); }
});

router.post('/', async (req, res, next) => {
  try {
    const name = requiredString(req.body.name, 'name', 160);
    const description = optionalString(req.body.description, 'description', 5000);
    const ownerId = req.body.owner_id === undefined ? null : requireUuid(req.body.owner_id, 'owner_id');
    const client = await db.pool.connect();
    try {
      await client.query('BEGIN');
      if (ownerId) {
        const userResult = await client.query('SELECT 1 FROM users WHERE id = $1', [ownerId]);
        if (!userResult.rowCount) {
          const error = Object.assign(new Error('owner_id must reference an existing user'), { status: 400, code: 'VALIDATION_ERROR' });
          throw error;
        }
      }
      const result = await client.query(
        'INSERT INTO projects (name, description) VALUES ($1, $2) RETURNING id, name, description, created_at, updated_at',
        [name, description]
      );
      if (ownerId) {
        await client.query(
          'INSERT INTO project_users (project_id, user_id, role) VALUES ($1, $2, $3)',
          [result.rows[0].id, ownerId, 'owner']
        );
      }
      await client.query('COMMIT');
      res.status(201).json({ data: result.rows[0] });
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } catch (error) { next(error); }
});

router.get('/:projectId', async (req, res, next) => {
  try {
    const projectId = requireUuid(req.params.projectId, 'projectId');
    const result = await db.query('SELECT id, name, description, created_at, updated_at FROM projects WHERE id = $1', [projectId]);
    if (!result.rowCount) return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Project not found' } });
    res.json({ data: result.rows[0] });
  } catch (error) { next(error); }
});

router.patch('/:projectId', async (req, res, next) => {
  try {
    const projectId = requireUuid(req.params.projectId, 'projectId');
    const fields = [];
    const values = [];
    if (req.body.name !== undefined) { fields.push(`name = $${values.length + 1}`); values.push(requiredString(req.body.name, 'name', 160)); }
    if (req.body.description !== undefined) { fields.push(`description = $${values.length + 1}`); values.push(optionalString(req.body.description, 'description', 5000)); }
    if (!fields.length) throw Object.assign(new Error('At least one field is required'), { status: 400, code: 'VALIDATION_ERROR' });
    values.push(projectId);
    const result = await db.query(`UPDATE projects SET ${fields.join(', ')}, updated_at = NOW() WHERE id = $${values.length} RETURNING id, name, description, created_at, updated_at`, values);
    if (!result.rowCount) return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Project not found' } });
    res.json({ data: result.rows[0] });
  } catch (error) { next(error); }
});

router.delete('/:projectId', async (req, res, next) => {
  try {
    const projectId = requireUuid(req.params.projectId, 'projectId');
    const result = await db.query('DELETE FROM projects WHERE id = $1', [projectId]);
    if (!result.rowCount) return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Project not found' } });
    res.status(204).send();
  } catch (error) { next(error); }
});

router.get('/:projectId/users', async (req, res, next) => {
  try {
    const projectId = requireUuid(req.params.projectId, 'projectId');
    const result = await db.query(
      `SELECT u.id AS user_id, u.name, u.email, pu.role, pu.created_at
       FROM project_users pu JOIN users u ON u.id = pu.user_id
       WHERE pu.project_id = $1 ORDER BY u.name`,
      [projectId]
    );
    res.json({ data: result.rows });
  } catch (error) { next(error); }
});

router.post('/:projectId/users', async (req, res, next) => {
  try {
    const projectId = requireUuid(req.params.projectId, 'projectId');
    const userId = requireUuid(req.body.user_id, 'user_id');
    const role = enumValue(req.body.role || 'member', 'role', roles);
    const result = await db.query(
      `INSERT INTO project_users (project_id, user_id, role)
       SELECT $1, $2, $3 WHERE EXISTS (SELECT 1 FROM projects WHERE id = $1)
       RETURNING project_id, user_id, role, created_at`,
      [projectId, userId, role]
    );
    if (!result.rowCount) return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Project not found' } });
    res.status(201).json({ data: result.rows[0] });
  } catch (error) { next(error); }
});

router.delete('/:projectId/users/:userId', async (req, res, next) => {
  try {
    const projectId = requireUuid(req.params.projectId, 'projectId');
    const userId = requireUuid(req.params.userId, 'userId');
    const result = await db.query('DELETE FROM project_users WHERE project_id = $1 AND user_id = $2', [projectId, userId]);
    if (!result.rowCount) return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Project membership not found' } });
    res.status(204).send();
  } catch (error) { next(error); }
});

router.get('/:projectId/workload', async (req, res, next) => {
  try {
    const projectId = requireUuid(req.params.projectId, 'projectId');
    const result = await db.query(
      `SELECT u.id AS user_id, u.name,
              COUNT(t.id) FILTER (WHERE t.status = 'In Progress')::int AS in_progress_count,
              (COUNT(t.id) FILTER (WHERE t.status = 'In Progress') > 5) AS overloaded
       FROM project_users pu
       JOIN users u ON u.id = pu.user_id
       LEFT JOIN tasks t ON t.project_id = pu.project_id AND t.assigned_to = pu.user_id
       WHERE pu.project_id = $1
       GROUP BY u.id, u.name
       ORDER BY u.name`,
      [projectId]
    );
    res.json({ data: result.rows });
  } catch (error) { next(error); }
});

module.exports = router;

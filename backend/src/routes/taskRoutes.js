const express = require('express');
const db = require('../config/database');
const {
  requireUuid, optionalUuid, requiredString, optionalString,
  enumValue, optionalDate
} = require('../middleware/validateRequest');

const router = express.Router();
const priorities = ['Low', 'Medium', 'High'];
const statuses = ['To-Do', 'In Progress', 'Done'];
const taskFields = 'id, project_id, parent_task_id, title, description, priority, status, due_date, assigned_to, created_at, updated_at';

async function validateTaskReferences(projectId, assignedTo, parentTaskId) {
  const result = await db.query(
    `SELECT
       EXISTS (SELECT 1 FROM projects WHERE id = $1) AS project_exists,
       ($2::uuid IS NULL OR EXISTS (SELECT 1 FROM project_users WHERE project_id = $1 AND user_id = $2)) AS assignee_valid,
       ($3::uuid IS NULL OR EXISTS (SELECT 1 FROM tasks WHERE id = $3 AND project_id = $1)) AS parent_valid`,
    [projectId, assignedTo, parentTaskId]
  );
  const row = result.rows[0];
  if (!row.project_exists) throw Object.assign(new Error('Project not found'), { status: 404, code: 'NOT_FOUND' });
  if (!row.assignee_valid) throw Object.assign(new Error('assigned_to must be a member of the project'), { status: 400, code: 'VALIDATION_ERROR' });
  if (!row.parent_valid) throw Object.assign(new Error('parent_task_id must reference a task in the same project'), { status: 400, code: 'VALIDATION_ERROR' });
}

router.get('/', async (req, res, next) => {
  try {
    const conditions = [];
    const values = [];
    const filters = [
      ['project_id', req.query.project_id, requireUuid],
      ['status', req.query.status, (value, field) => enumValue(value, field, statuses)],
      ['priority', req.query.priority, (value, field) => enumValue(value, field, priorities)],
      ['assigned_to', req.query.assigned_to, requireUuid]
    ];
    for (const [column, value, validator] of filters) {
      if (value !== undefined) { conditions.push(`${column} = $${values.length + 1}`); values.push(validator(value, column)); }
    }
    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
    const result = await db.query(`SELECT ${taskFields} FROM tasks ${where} ORDER BY created_at DESC`, values);
    res.json({ data: result.rows });
  } catch (error) { next(error); }
});

router.post('/', async (req, res, next) => {
  try {
    const projectId = requireUuid(req.body.project_id, 'project_id');
    const parentTaskId = optionalUuid(req.body.parent_task_id, 'parent_task_id');
    const assignedTo = optionalUuid(req.body.assigned_to, 'assigned_to');
    const title = requiredString(req.body.title, 'title', 200);
    const description = optionalString(req.body.description, 'description', 10000);
    const priority = enumValue(req.body.priority || 'Medium', 'priority', priorities);
    const status = enumValue(req.body.status || 'To-Do', 'status', statuses);
    const dueDate = optionalDate(req.body.due_date, 'due_date');
    await validateTaskReferences(projectId, assignedTo, parentTaskId);
    const result = await db.query(
      `INSERT INTO tasks (project_id, parent_task_id, title, description, priority, status, due_date, assigned_to)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING ${taskFields}`,
      [projectId, parentTaskId, title, description, priority, status, dueDate, assignedTo]
    );
    res.status(201).json({ data: result.rows[0] });
  } catch (error) { next(error); }
});

router.get('/:taskId', async (req, res, next) => {
  try {
    const taskId = requireUuid(req.params.taskId, 'taskId');
    const result = await db.query(`SELECT ${taskFields} FROM tasks WHERE id = $1`, [taskId]);
    if (!result.rowCount) return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Task not found' } });
    res.json({ data: result.rows[0] });
  } catch (error) { next(error); }
});

router.patch('/:taskId', async (req, res, next) => {
  try {
    const taskId = requireUuid(req.params.taskId, 'taskId');
    const current = await db.query(`SELECT ${taskFields} FROM tasks WHERE id = $1`, [taskId]);
    if (!current.rowCount) return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Task not found' } });
    const existing = current.rows[0];
    const projectId = existing.project_id;
    const parentTaskId = req.body.parent_task_id === undefined ? existing.parent_task_id : optionalUuid(req.body.parent_task_id, 'parent_task_id');
    const assignedTo = req.body.assigned_to === undefined ? existing.assigned_to : optionalUuid(req.body.assigned_to, 'assigned_to');
    const values = [];
    const updates = [];
    const add = (column, value) => { updates.push(`${column} = $${values.length + 1}`); values.push(value); };
    if (req.body.title !== undefined) add('title', requiredString(req.body.title, 'title', 200));
    if (req.body.description !== undefined) add('description', optionalString(req.body.description, 'description', 10000));
    if (req.body.priority !== undefined) add('priority', enumValue(req.body.priority, 'priority', priorities));
    if (req.body.status !== undefined) add('status', enumValue(req.body.status, 'status', statuses));
    if (req.body.due_date !== undefined) add('due_date', optionalDate(req.body.due_date, 'due_date'));
    if (req.body.assigned_to !== undefined) add('assigned_to', assignedTo);
    if (req.body.parent_task_id !== undefined) add('parent_task_id', parentTaskId);
    if (!updates.length) throw Object.assign(new Error('At least one field is required'), { status: 400, code: 'VALIDATION_ERROR' });
    await validateTaskReferences(projectId, assignedTo, parentTaskId);
    values.push(taskId);
    const result = await db.query(`UPDATE tasks SET ${updates.join(', ')}, updated_at = NOW() WHERE id = $${values.length} RETURNING ${taskFields}`, values);
    res.json({ data: result.rows[0] });
  } catch (error) { next(error); }
});

router.delete('/:taskId', async (req, res, next) => {
  try {
    const taskId = requireUuid(req.params.taskId, 'taskId');
    const result = await db.query('DELETE FROM tasks WHERE id = $1', [taskId]);
    if (!result.rowCount) return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Task not found' } });
    res.status(204).send();
  } catch (error) { next(error); }
});

module.exports = router;

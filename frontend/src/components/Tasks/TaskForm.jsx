import { useState } from 'react';
import { PRIORITIES, STATUSES } from '../../utils/constants';

const emptyTask = { title: '', description: '', priority: 'Medium', status: 'To-Do', due_date: '', assigned_to: '' };

export default function TaskForm({ task, users, onSubmit, onCancel, submitting }) {
  const [form, setForm] = useState(task ? { ...emptyTask, ...task, assigned_to: task.assigned_to || '' } : emptyTask);
  const setField = (field, value) => setForm((current) => ({ ...current, [field]: value }));
  const submit = (event) => {
    event.preventDefault();
    onSubmit({ ...form, assigned_to: form.assigned_to || null, due_date: form.due_date || null });
  };

  return (
    <form className="task-form" onSubmit={submit}>
      <label>Title<input required maxLength="200" value={form.title} onChange={(e) => setField('title', e.target.value)} placeholder="What needs to be done?" /></label>
      <label>Description<textarea maxLength="10000" rows="4" value={form.description || ''} onChange={(e) => setField('description', e.target.value)} placeholder="Add details..." /></label>
      <div className="form-grid">
        <label>Priority<select value={form.priority} onChange={(e) => setField('priority', e.target.value)}>{PRIORITIES.map((item) => <option key={item}>{item}</option>)}</select></label>
        <label>Status<select value={form.status} onChange={(e) => setField('status', e.target.value)}>{STATUSES.map((item) => <option key={item}>{item}</option>)}</select></label>
      </div>
      <div className="form-grid">
        <label>Due date<input type="date" value={form.due_date || ''} onChange={(e) => setField('due_date', e.target.value)} /></label>
        <label>Assigned user<select value={form.assigned_to || ''} onChange={(e) => setField('assigned_to', e.target.value)}><option value="">Unassigned</option>{users.map((user) => <option value={user.id} key={user.id}>{user.name}</option>)}</select></label>
      </div>
      <div className="form-actions"><button type="button" className="button button-muted" onClick={onCancel}>Cancel</button><button className="button button-primary" disabled={submitting}>{submitting ? 'Saving...' : task ? 'Save changes' : 'Create task'}</button></div>
    </form>
  );
}

import { useState } from 'react';
import { Modal } from '../../components';

export default function AddMemberForm({ users, members, onSubmit, onCancel, submitting }) {
  const [userId, setUserId] = useState('');
  const [role, setRole] = useState('member');
  const existing = new Set(members.map((member) => member.user_id));
  const available = users.filter((user) => !existing.has(user.id));
  const submit = (event) => { event.preventDefault(); onSubmit({ user_id: userId, role }); };
  return <Modal title="Add team member" onClose={onCancel}><form className="task-form" onSubmit={submit}><label>User<select required value={userId} onChange={(event) => setUserId(event.target.value)}><option value="">Select a user</option>{available.map((user) => <option key={user.id} value={user.id}>{user.name} · {user.email}</option>)}</select></label><label>Role<select value={role} onChange={(event) => setRole(event.target.value)}><option value="member">Member</option><option value="admin">Admin</option><option value="owner">Owner</option></select></label><div className="form-actions"><button type="button" className="button button-muted" onClick={onCancel}>Cancel</button><button className="button button-primary" disabled={submitting || !available.length}>{submitting ? 'Adding...' : 'Add member'}</button></div></form></Modal>;
}

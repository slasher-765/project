import { useState } from 'react';
import { addProjectUser } from './api/projects';
import { createTask, deleteTask, updateTask } from './api/tasks';
import { useProjectData } from './hooks/useProjectData';
import { STATUSES, PRIORITIES } from './utils/constants';
import KanbanBoard from './components/Board/KanbanBoard';
import TaskForm from './components/Tasks/TaskForm';
import TeamMembers from './components/Team/TeamMembers';
import AddMemberForm from './components/Team/AddMemberForm';
import { Modal } from './components';

export default function App() {
  const { project, tasks, members, users, workload, loading, error, refresh, setError } = useProjectData();
  const [filter, setFilter] = useState('All');
  const [taskModal, setTaskModal] = useState(null);
  const [memberModal, setMemberModal] = useState(false);
  const [saving, setSaving] = useState(false);

  if (loading) return <div className="screen-center"><div className="loader" />Loading your workspace...</div>;
  if (error && !project) return <div className="screen-center error-screen"><h1>Unable to load workspace</h1><p>{error}</p></div>;

  const saveTask = async (form) => {
    setSaving(true); setError('');
    try { if (taskModal.task) await updateTask(taskModal.task.id, form); else await createTask({ ...form, project_id: project.id }); setTaskModal(null); await refresh(); } catch (saveError) { setError(saveError.message); } finally { setSaving(false); }
  };
  const removeTask = async (task) => {
    if (!window.confirm(`Delete "${task.title}"?`)) return;
    try { await deleteTask(task.id); await refresh(); } catch (deleteError) { setError(deleteError.message); }
  };
  const moveTask = async (event, status) => {
    const taskId = event.dataTransfer.getData('text/task-id');
    if (!taskId) return;
    const task = tasks.find((item) => item.id === taskId);
    if (!task || task.status === status) return;
    try { await updateTask(taskId, { status }); await refresh(); } catch (moveError) { setError(moveError.message); }
  };
  const addMember = async (data) => {
    setSaving(true); setError('');
    try { await addProjectUser(project.id, data); setMemberModal(false); await refresh(); } catch (memberError) { setError(memberError.message); } finally { setSaving(false); }
  };
  const count = tasks.length;
  return <div className="app-shell">
    <header className="topbar"><div className="brand"><span className="brand-mark">✓</span><span>task<span>flow</span></span></div><div className="topbar-right"><span className="online-dot" />Workspace live <div className="user-chip">AP</div></div></header>
    <main className="dashboard">
      <div className="hero"><div><span className="eyebrow">YOUR WORKSPACE</span><h1>{project.name}</h1><p>{project.description || 'Keep your team aligned and moving forward.'}</p></div><button className="button button-primary create-button" onClick={() => setTaskModal({ task: null })}>+ <span>New task</span></button></div>
      {error && <div className="notice">{error}<button onClick={() => setError('')}>×</button></div>}
      <div className="content-grid"><div className="board-area"><div className="toolbar"><div className="filter-tabs"><span className="toolbar-label">FILTER BY</span>{['All', ...PRIORITIES].map((item) => <button className={filter === item ? 'active' : ''} key={item} onClick={() => setFilter(item)}>{item}</button>)}</div><span className="task-summary">{count} total tasks</span></div><KanbanBoard tasks={tasks} users={users} filter={filter} onDrop={moveTask} onDragStart={(event, id) => event.dataTransfer.setData('text/task-id', id)} onEdit={(task) => setTaskModal({ task })} onDelete={removeTask} /></div><TeamMembers members={members} workload={workload} onAddUser={() => setMemberModal(true)} /></div>
    </main>
    {taskModal && <Modal title={taskModal.task ? 'Edit task' : 'Create a task'} onClose={() => setTaskModal(null)}><TaskForm task={taskModal.task} users={members.map((member) => ({ id: member.user_id, name: member.name }))} onSubmit={saveTask} onCancel={() => setTaskModal(null)} submitting={saving} /></Modal>}
    {memberModal && <AddMemberForm users={users} members={members} onSubmit={addMember} onCancel={() => setMemberModal(false)} submitting={saving} />}
  </div>;
}

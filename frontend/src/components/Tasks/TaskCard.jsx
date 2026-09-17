import Avatar from '../common/Avatar';
import { formatDueDate, priorityClass } from '../../utils/constants';

export default function TaskCard({ task, users, onEdit, onDelete, onDragStart }) {
  const assignee = users.find((user) => user.id === task.assigned_to);
  return (
    <article className="task-card" draggable onDragStart={(event) => onDragStart(event, task.id)}>
      <div className="task-card-top"><span className={`priority priority-${priorityClass(task.priority)}`}>{task.priority}</span><button className="card-menu" onClick={() => onEdit(task)} aria-label={`Edit ${task.title}`}>•••</button></div>
      <h3>{task.title}</h3>
      {task.description && <p>{task.description}</p>}
      <div className="task-meta"><span className="due-date">◷ {formatDueDate(task.due_date)}</span>{assignee ? <span className="assignee"><Avatar name={assignee.name} small />{assignee.name}</span> : <span className="unassigned">Unassigned</span>}</div>
      <div className="card-actions"><button onClick={() => onEdit(task)}>Edit</button><button className="delete-link" onClick={() => onDelete(task)}>Delete</button></div>
    </article>
  );
}

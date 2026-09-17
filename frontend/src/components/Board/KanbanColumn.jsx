import TaskCard from '../Tasks/TaskCard';

export default function KanbanColumn({ status, tasks, users, onDrop, onDragStart, onEdit, onDelete }) {
  return (
    <section className="kanban-column" onDragOver={(event) => event.preventDefault()} onDrop={(event) => onDrop(event, status)}>
      <div className="column-heading"><div><span className={`column-dot dot-${status.toLowerCase().replace(' ', '-')}`} /><h2>{status}</h2></div><span className="task-count">{tasks.length}</span></div>
      <div className="column-tasks">{tasks.map((task) => <TaskCard key={task.id} task={task} users={users} onDragStart={onDragStart} onEdit={onEdit} onDelete={onDelete} />)}{!tasks.length && <div className="empty-column">Drop tasks here</div>}</div>
    </section>
  );
}

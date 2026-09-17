import KanbanColumn from './KanbanColumn';
import { STATUSES } from '../../utils/constants';

export default function KanbanBoard({ tasks, users, filter, onDrop, onDragStart, onEdit, onDelete }) {
  return <div className="board">{STATUSES.map((status) => <KanbanColumn key={status} status={status} users={users} tasks={tasks.filter((task) => task.status === status && (filter === 'All' || task.priority === filter))} onDrop={onDrop} onDragStart={onDragStart} onEdit={onEdit} onDelete={onDelete} />)}</div>;
}

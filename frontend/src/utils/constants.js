export const STATUSES = ['To-Do', 'In Progress', 'Done'];
export const PRIORITIES = ['High', 'Medium', 'Low'];

export const priorityClass = (priority) => priority.toLowerCase();

export function formatDueDate(date) {
  if (!date) return 'No due date';
  const parsedDate = new Date(date.includes('T') ? date : `${date}T00:00:00`);
  if (Number.isNaN(parsedDate.getTime())) return 'Invalid due date';
  return new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric', year: 'numeric' }).format(parsedDate);
}

export function initials(name = '?') {
  return name.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]).join('').toUpperCase();
}

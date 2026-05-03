import type { Task } from '../types';
import './Calendar.css';

interface Props {
  task: Task;
  ghost?: boolean;
  isDragOverlay?: boolean;
}

export default function TaskChip({ task, ghost = false, isDragOverlay = false }: Props) {
  return (
    <div
      className="task-chip"
      style={{
        opacity: ghost ? 0.3 : 1,
        cursor: isDragOverlay ? 'grabbing' : 'grab',
      }}
    >
      <span className="task-chip-name">{task.name}</span>
      <span className="task-chip-time">{task.base_time}h</span>
    </div>
  );
}

import type { Task } from './types';
import './Calendar.css';

interface Props {
  task: Task;
}

export default function TaskChip({ task }: Props) {
  return (
    <div className="task-chip">
      <span className="task-chip-name">{task.name}</span>
      <span className="task-chip-time">{task.base_time}h</span>
    </div>
  );
}

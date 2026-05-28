import type { Task } from '../../types';
import '../Calendar.css';

interface Props {
  task: Task;
  ghost?: boolean;
  isDragOverlay?: boolean;
  scheduled?: boolean;
  dimmed?: boolean;
  highlighted?: boolean;
}

export default function TaskChip({ task, ghost = false, isDragOverlay = false, scheduled = false, dimmed = false, highlighted = false }: Props) {
  return (
    <div
      className={`task-chip${scheduled ? ' task-chip--scheduled' : ''}${dimmed ? ' task-chip--dimmed' : ''}${highlighted ? ' task-chip--highlighted' : ''}`}
      style={{
        opacity: ghost ? 0.3 : 1,
        cursor: scheduled ? 'default' : isDragOverlay ? 'grabbing' : 'grab',
      }}
    >
      <span className="task-chip-name">{task.name}</span>
      <span className="task-chip-time">{task.base_time}h</span>
    </div>
  );
}

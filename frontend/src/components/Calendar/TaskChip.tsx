import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { Task } from './types';
import './Calendar.css';

interface Props {
  task: Task;
  isDragOverlay?: boolean;
}

export default function TaskChip({ task, isDragOverlay = false }: Props) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: task.id,
    disabled: isDragOverlay,
  });

  return (
    <div
      className="task-chip"
      ref={isDragOverlay ? undefined : setNodeRef}
      {...(isDragOverlay ? {} : listeners)}
      {...(isDragOverlay ? {} : attributes)}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging && !isDragOverlay ? 0.3 : 1,
        cursor: isDragOverlay ? 'grabbing' : 'grab',
      }}
    >
      <span className="task-chip-name">{task.name}</span>
      <span className="task-chip-time">{task.base_time}h</span>
    </div>
  );
}

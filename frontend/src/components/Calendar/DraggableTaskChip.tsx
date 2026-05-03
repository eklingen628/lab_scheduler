import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import type { Task } from '../types';
import TaskChip from './TaskChip';

interface Props {
  task: Task;
}

export default function DraggableTaskChip({ task }: Props) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `sidebar-${task.id}`,
    data: { source: 'sidebar', task },
  });

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      style={{ transform: CSS.Translate.toString(transform), opacity: isDragging ? 0.3 : 1 }}
    >
      <TaskChip task={task} />
    </div>
  );
}

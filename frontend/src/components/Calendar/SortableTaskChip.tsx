import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { Task } from '../types';
import TaskChip from './TaskChip';

interface Props {
  task: Task;
}

export default function SortableTaskChip({ task }: Props) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: task.id,
    data: { source: 'calendar' },
  });

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      style={{ transform: CSS.Transform.toString(transform), transition }}
    >
      <TaskChip task={task} ghost={isDragging} />
    </div>
  );
}

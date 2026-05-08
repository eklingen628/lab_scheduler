import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { Task } from '../types';
import DayViewTask from './DayViewTask';

interface Props {
  task: Task;
}

export default function SortableDayViewTask({ task }: Props) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: `dayview-task-${task.id}`,
    data: { source: 'dayview', taskId: task.id },
  });

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      style={{ transform: CSS.Transform.toString(transform), transition }}
    >
      <DayViewTask task={task} ghost={isDragging} />
    </div>
  );
}

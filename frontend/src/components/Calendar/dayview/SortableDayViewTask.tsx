import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { Task, SampleTest } from '../../types';
import DayViewTask from './DayViewTask';
import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuTrigger } from '@/components/ui/context-menu';

interface Props {
  task: Task;
  sampleTests: SampleTest[];
  onEdit: () => void;
}

export default function SortableDayViewTask({ task, sampleTests, onEdit }: Props) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: `dayview-task-${task.id}`,
    data: { source: 'dayview', taskId: task.id },
  });

  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>
        <div
          ref={setNodeRef}
          {...listeners}
          {...attributes}
          style={{ transform: CSS.Transform.toString(transform), transition }}
        >
          <DayViewTask task={task} sampleTests={sampleTests} ghost={isDragging} />
        </div>
      </ContextMenuTrigger>
      <ContextMenuContent>
        <ContextMenuItem onClick={onEdit}>Edit</ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
}

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { Task } from '../types';
import TaskChip from './TaskChip';
import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuTrigger } from '@/components/ui/context-menu';

interface Props {
  task: Task;
  onEdit: () => void;
}

export default function SortableTaskChip({ task, onEdit }: Props) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: task.id,
    data: { source: 'calendar' },
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
          <TaskChip task={task} ghost={isDragging} />
        </div>
      </ContextMenuTrigger>
      <ContextMenuContent>
        <ContextMenuItem onClick={onEdit}>Edit</ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
}

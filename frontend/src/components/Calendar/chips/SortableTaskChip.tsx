import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useContext } from 'react';
import type { Task } from '../../types';
import TaskChip from './TaskChip';
import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuTrigger } from '@/components/ui/context-menu';
import { CalendarContext } from '../context/CalendarContext';



interface Props {
  task: Task;
}

export default function SortableTaskChip({ task }: Props) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: task.id,
    data: { source: 'calendar' },
  });
  const { onEditTask, selectedGroupId } = useContext(CalendarContext);
  const dimmed = selectedGroupId !== null && task.sample_test_group_id !== selectedGroupId;
  const highlighted = selectedGroupId !== null && task.sample_test_group_id === selectedGroupId;

  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>
        <div
          ref={setNodeRef}
          {...listeners}
          {...attributes}
          style={{ transform: CSS.Transform.toString(transform), transition }}
          onContextMenu={e => e.stopPropagation()}
        >
          <TaskChip task={task} ghost={isDragging} dimmed={dimmed} highlighted={highlighted} />
        </div>
      </ContextMenuTrigger>
      <ContextMenuContent>
        <ContextMenuItem onClick={() => onEditTask(task)}>Edit</ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
}

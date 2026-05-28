import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { useContext } from 'react';
import type { Task } from '../../types';
import TaskChip from './TaskChip';
import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuTrigger } from '@/components/ui/context-menu';
import { CalendarContext } from '../context/CalendarContext';


interface Props {
  task: Task;
}

export default function DraggableTaskChip({ task }: Props) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `sidebar-${task.id}`,
    data: { source: 'sidebar', task },
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
          style={{ transform: CSS.Translate.toString(transform), opacity: isDragging ? 0.3 : 1 }}
        >
          <TaskChip task={task} dimmed={dimmed} highlighted={highlighted} />
        </div>
      </ContextMenuTrigger>
      <ContextMenuContent>
        <ContextMenuItem onClick={() => onEditTask(task)}>Edit</ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
}

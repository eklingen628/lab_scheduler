import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useContext, useEffect, useRef } from 'react';
import type { Task } from '../types';
import TaskChip from './TaskChip';
import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuTrigger } from '@/components/ui/context-menu';
import { CalendarContext } from './CalendarContext';

interface Props {
  task: Task;
}

export default function SortableTaskChip({ task }: Props) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: task.id,
    data: { source: 'calendar' },
  });
  const { goToPersonDate, onEditTask } = useContext(CalendarContext);
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const stop = (e: MouseEvent) => e.stopPropagation();
    el.addEventListener('contextmenu', stop);
    return () => el.removeEventListener('contextmenu', stop);
  }, []);

  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>
        <div
          ref={(el) => { setNodeRef(el); ref.current = el; }}
          {...listeners}
          {...attributes}
          style={{ transform: CSS.Transform.toString(transform), transition }}
        >
          <TaskChip task={task} ghost={isDragging} />
        </div>
      </ContextMenuTrigger>
      <ContextMenuContent>
        <ContextMenuItem onClick={() => onEditTask(task)}>Edit</ContextMenuItem>
        {task.person_id && task.scheduled_date && (
          <ContextMenuItem onClick={() => goToPersonDate(task.person_id!, task.scheduled_date!)}>Go To Current</ContextMenuItem>
        )}
      </ContextMenuContent>
    </ContextMenu>
  );
}

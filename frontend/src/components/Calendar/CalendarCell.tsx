import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import type { Person, Task } from '../types';
import SortableTaskChip from './SortableTaskChip';
import { memo } from 'react';
import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuTrigger } from '@/components/ui/context-menu';

interface Props {
  person: Person;
  date: string;
  cellTasks: Task[];
  isToday: boolean;
  isSelected: boolean;
  setPerson: (value: React.SetStateAction<Person | null>) => void;
  setCurrentDate: (value: React.SetStateAction<string | null>) => void;
}

function CalendarCell({ person, date, cellTasks, isToday, isSelected, setCurrentDate, setPerson }: Props) {
  const { setNodeRef, isOver } = useDroppable({
    id: `cell|${person.id}|${date}`,
  });

  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>
        <div
          className={`calendar-cell${isToday ? ' calendar-cell--today' : ''}${isSelected ? ' calendar-cell--selected' : ''}${isOver ? ' calendar-cell--over' : ''}`}
          ref={setNodeRef}
          onDoubleClick={() => { setCurrentDate(date); setPerson(person); }}
        >
          <SortableContext items={cellTasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
            {cellTasks.map(task => (
              <SortableTaskChip key={task.id} task={task} />
            ))}
          </SortableContext>
        </div>
      </ContextMenuTrigger>
      <ContextMenuContent>
        <ContextMenuItem onClick={() => { setCurrentDate(date); setPerson(person); }}>
          Go To Current
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
}

export default memo(CalendarCell);

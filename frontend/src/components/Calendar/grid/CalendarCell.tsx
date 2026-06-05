import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import type { Person, Task } from '../../types';
import SortableTaskChip from '../chips/SortableTaskChip';
import { memo, useContext } from 'react';
import { CalendarContext } from '../context/CalendarContext';
import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuTrigger } from '@/components/ui/context-menu';



interface Props {
  person: Person;
  date: string;
  cellTasks: Task[];
  isToday: boolean;
  isSelected: boolean;
  isWeekend: boolean;
}

function CalendarCell({ person, date, cellTasks, isSelected, isWeekend }: Props) {
  const { setDayViewPerson, setDayViewDate, viewMode, openCreateModal } = useContext(CalendarContext)



  const { setNodeRef, isOver } = useDroppable({
    id: `cell|${person.id}|${date}`,
  });

  return (


<ContextMenu>
  <ContextMenuTrigger asChild>


    <div
      className={`calendar-cell${viewMode === 'compact' ? ' calendar-cell--compact' : ''}${viewMode === 'expanded' ? ' calendar-cell--expanded' : ''}${isWeekend ? ' calendar-cell--weekend' : ''}${isSelected ? ' calendar-cell--selected' : ''}${isOver ? ' calendar-cell--over' : ''}`}
      ref={setNodeRef}
      data-cell={`${person.id}|${date}`}
      onDoubleClick={() => { setDayViewDate(date); setDayViewPerson(person); }}
    >
      <SortableContext items={cellTasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
        {cellTasks.map(task => (
          <SortableTaskChip key={task.id} task={task} />
        ))}
      </SortableContext>
    </div>

  </ContextMenuTrigger>
  <ContextMenuContent>
    <ContextMenuItem onClick={() => { setDayViewDate(null); setDayViewPerson(null); }}>Clear Selection</ContextMenuItem>
    <ContextMenuItem onClick={() => { setDayViewDate(date); setDayViewPerson(person); }}>Select Cell</ContextMenuItem>
    <ContextMenuItem onClick={() => { setDayViewDate(date); setDayViewPerson(person); openCreateModal(); }}>Create New Task Here</ContextMenuItem>
  </ContextMenuContent>
</ContextMenu>
  );
}

export default memo(CalendarCell);

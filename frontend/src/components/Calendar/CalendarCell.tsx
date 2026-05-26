import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import type { Person, Task } from '../types';
import SortableTaskChip from './SortableTaskChip';
import { memo, useContext } from 'react';
import { CalendarContext } from './CalendarContext';

interface Props {
  person: Person;
  date: string;
  cellTasks: Task[];
  isToday: boolean;
  isSelected: boolean;
  isWeekend: boolean;
}

function CalendarCell({ person, date, cellTasks, isToday, isSelected, isWeekend }: Props) {
  const { setDayViewPerson, setDayViewDate } = useContext(CalendarContext)



  const { setNodeRef, isOver } = useDroppable({
    id: `cell|${person.id}|${date}`,
  });

  return (
    <div
      className={`calendar-cell${isWeekend ? ' calendar-cell--weekend' : ''}${isToday ? ' calendar-cell--today' : ''}${isSelected ? ' calendar-cell--selected' : ''}${isOver ? ' calendar-cell--over' : ''}`}
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
  );
}

export default memo(CalendarCell);

import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import type { Person, Task } from './types';
import TaskChip from './TaskChip';

interface Props {
  person: Person;
  date: string;
  tasks: Task[];
}

export default function CalendarCell({ person, date, tasks }: Props) {
  const { setNodeRef, isOver } = useDroppable({
    id: `cell|${person.id}|${date}`,
  });

  return (
    <div
      className={`calendar-cell${isOver ? ' calendar-cell--over' : ''}`}
      ref={setNodeRef}
    >
      <SortableContext items={tasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
        {tasks.map(task => (
          <TaskChip key={task.id} task={task} />
        ))}
      </SortableContext>
    </div>
  );
}

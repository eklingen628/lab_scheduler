import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import type { Person, Task } from '../types';
import SortableTaskChip from './SortableTaskChip';

import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu"


interface Props {
  person: Person;
  date: string;
  tasks: Task[];
  isToday: boolean;
  isSelected: boolean;
  onEditTask: (task: Task) => void;
  setPerson: (value: React.SetStateAction<Person | null>) => void;
  setCurrentDate: (value: React.SetStateAction<string | null>) => void;
}

export default function CalendarCell({ person, date, tasks, isToday, isSelected, onEditTask, setCurrentDate, setPerson }: Props) {
  const { setNodeRef, isOver } = useDroppable({
    id: `cell|${person.id}|${date}`,
  });

  return (

<ContextMenu>
  <ContextMenuTrigger asChild>
    <div
      className={`calendar-cell${isToday ? ' calendar-cell--today' : ''}${isSelected ? ' calendar-cell--selected' : ''}${isOver ? ' calendar-cell--over' : ''}`}
      ref={setNodeRef}
      onDoubleClick={() => {setCurrentDate(date); setPerson(person);}}
    >
      <SortableContext items={tasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
        {tasks.map(task => (
          <SortableTaskChip
            key={task.id}
            task={task}
            onEdit={() => onEditTask(task)}
          />
        ))}
      </SortableContext>
    </div>
  </ContextMenuTrigger>
  <ContextMenuContent>
    <ContextMenuItem 
      onClick={() => {setCurrentDate(date); setPerson(person);}}
      
    >
        Go To Current
    </ContextMenuItem>

  </ContextMenuContent>
</ContextMenu>
  );
}

import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import type { Person, Task } from '../types';
import SortableDayViewTask from './SortableDayViewTask';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

interface Props {
  person: Person | null;
  date: string | null;
  tasks: Task[];
  setPerson: (value: React.SetStateAction<Person | null>) => void;
  setCurrentDate: (value: React.SetStateAction<string | null>) => void;
}

export default function DayView({ person, date, tasks, setPerson, setCurrentDate }: Props) {
  const active = person !== null && date !== null;

  const { setNodeRef } = useDroppable({
    id: active ? `dayview|${person.id}|${date}` : 'dayview|empty',
    disabled: !active,
  });

  const personDateTasks = active
    ? tasks.filter(task => task.person_id === person.id && task.scheduled_date === date)
    : [];

  return (
    <Card className="day-view-panel" ref={setNodeRef}>
      <CardHeader>
        {active && (
          <button onClick={() => { setCurrentDate(null); setPerson(null); }}>Exit</button>
        )}
        <CardTitle>{date ?? 'No day selected'}</CardTitle>
        {active && <CardDescription>{person.first_name}</CardDescription>}
      </CardHeader>
      <CardContent>
        {active ? (
          <SortableContext items={personDateTasks.map(t => `dayview-task-${t.id}`)} strategy={verticalListSortingStrategy}>
            {personDateTasks.map(task => (
              <SortableDayViewTask key={task.id} task={task} />
            ))}
          </SortableContext>
        ) : (
          <p className="day-view-empty">Double-click a cell to view the day.</p>
        )}
      </CardContent>
    </Card>
  );
}

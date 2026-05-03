import type { Person, Task } from '../types';
import CalendarGrid from './CalendarGrid';
import './Calendar.css';

interface Props {
  people: Person[];
  tasks: Task[];
  dates: string[];
}

export default function CalendarView({ people, tasks, dates }: Props) {
  return (
    <div className="calendar-view">
      <h2>Week of {dates[0]}</h2>
      <CalendarGrid people={people} dates={dates} tasks={tasks} />
    </div>
  );
}

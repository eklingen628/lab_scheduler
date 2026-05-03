import type { Person, Task } from './types';
import CalendarGrid from './CalendarGrid';
import './Calendar.css';

const PEOPLE: Person[] = [
  { id: 1, first_name: 'Alice', last_name: 'Johnson' },
  { id: 2, first_name: 'Bob', last_name: 'Martinez' },
  { id: 3, first_name: 'Carol', last_name: 'Kim' },
];

function getWeekDates(): string[] {
  const today = new Date();
  const day = today.getDay();
  const monday = new Date(today);
  monday.setDate(today.getDate() - (day === 0 ? 6 : day - 1));
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return d.toISOString().slice(0, 10);
  });
}

const DATES = getWeekDates();

const TASKS: Task[] = [
  { id: 1,  name: 'Tensile Strength',  base_time: 2.5, scheduled_date: DATES[0], person_id: 1 },
  { id: 2,  name: 'Viscosity Test',    base_time: 1.0, scheduled_date: DATES[0], person_id: 2 },
  { id: 3,  name: 'pH Analysis',       base_time: 0.5, scheduled_date: DATES[1], person_id: 1 },
  { id: 4,  name: 'Thermal Cycling',   base_time: 4.0, scheduled_date: DATES[1], person_id: 3 },
  { id: 5,  name: 'Particle Size',     base_time: 1.5, scheduled_date: DATES[2], person_id: 2 },
  { id: 6,  name: 'Density Check',     base_time: 0.75,scheduled_date: DATES[2], person_id: 3 },
  { id: 7,  name: 'Moisture Content',  base_time: 2.0, scheduled_date: DATES[3], person_id: 1 },
  { id: 8,  name: 'Color Measurement', base_time: 1.0, scheduled_date: DATES[3], person_id: 2 },
  { id: 9,  name: 'Hardness Test',     base_time: 3.0, scheduled_date: DATES[4], person_id: 3 },
  { id: 10, name: 'Conductivity',      base_time: 1.5, scheduled_date: DATES[4], person_id: 1 },
];

export default function CalendarView() {
  return (
    <div className="calendar-view">
      <h2>Week of {DATES[0]}</h2>
      <CalendarGrid people={PEOPLE} dates={DATES} tasks={TASKS} />
    </div>
  );
}

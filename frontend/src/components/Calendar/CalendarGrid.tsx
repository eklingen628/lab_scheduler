import { Fragment } from 'react';
import type { Person, Task } from '../types';
import CalendarCell from './CalendarCell';

interface Props {
  people: Person[];
  dates: string[];
  taskMap: Record<number, Record<string, Task[]>>
  selectedPersonId: number | null;
  selectedDate: string | null;
  setPerson: (value: React.SetStateAction<Person | null>) => void;
  setCurrentDate: (value: React.SetStateAction<string | null>) => void;
}

function formatHeader(iso: string): string {
  const d = new Date(iso + 'T00:00:00');
  const labels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  return `${labels[d.getDay()]} ${d.getMonth() + 1}/${d.getDate()}`;
}

function isWeekend(iso: string): boolean {
  const day = new Date(iso + 'T00:00:00').getDay();
  return day === 0 || day === 6;
}

function localToday(): string {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

const TODAY = localToday();

export default function CalendarGrid({ people, dates, taskMap, selectedPersonId, selectedDate, setPerson, setCurrentDate }: Props) {
  return (
    <div
      className="calendar-grid"
      style={{ gridTemplateColumns: `140px repeat(${dates.length}, minmax(100px, 1fr))` }}
    >
      <div className="calendar-header-cell" />
      {dates.map(date => (
        <div key={date} className={`calendar-header-cell${date === TODAY ? ' calendar-header-cell--today' : ''}${isWeekend(date) ? ' calendar-header-cell--weekend' : ''}`}>
          {formatHeader(date)}
        </div>
      ))}

      {people.map(person => (
        <Fragment key={person.id}>
          <div className="calendar-person-label">
            {person.first_name} {person.last_name}
          </div>
          {dates.map(date => (
            <CalendarCell
              key={`${person.id}-${date}`}
              person={person}
              date={date}
              isToday={date === TODAY}
              isSelected={person.id === selectedPersonId && date === selectedDate}
              isWeekend={isWeekend(date)}
              cellTasks={taskMap[person.id]?.[date] ?? []}
              setPerson={setPerson}
              setCurrentDate={setCurrentDate}
            />
          ))}
        </Fragment>
      ))}
    </div>
  );
}

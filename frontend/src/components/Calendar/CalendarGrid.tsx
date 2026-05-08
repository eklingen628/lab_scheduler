import { Fragment } from 'react';
import type { Person, Task } from '../types';
import CalendarCell from './CalendarCell';

interface Props {
  people: Person[];
  dates: string[];
  tasks: Task[];
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

function localToday(): string {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

const TODAY = localToday();

export default function CalendarGrid({ people, dates, tasks, selectedPersonId, selectedDate, setPerson, setCurrentDate }: Props) {
  return (
    <div
      className="calendar-grid"
      style={{ gridTemplateColumns: `140px repeat(${dates.length}, minmax(100px, 1fr))` }}
    >
      <div className="calendar-header-cell" />
      {dates.map(date => (
        <div key={date} className={`calendar-header-cell${date === TODAY ? ' calendar-header-cell--today' : ''}`}>
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
              tasks={tasks.filter(t => t.person_id === person.id && t.scheduled_date === date)}
              setPerson={setPerson}
              setCurrentDate={setCurrentDate}
            />
          ))}
        </Fragment>
      ))}
    </div>
  );
}

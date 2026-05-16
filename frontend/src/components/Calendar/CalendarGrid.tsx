import { Fragment, useContext, useMemo, useState } from 'react';
import type { Person, Task } from '../types';
import CalendarCell from './CalendarCell';
import { ListFilter } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarContext } from './CalendarContext';

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
  const { personFilter, setPersonFilter, personSort, setPersonSort } = useContext(CalendarContext)
  const [popoverOpen, setPopoverOpen] = useState(false)
  const [draft, setDraft] = useState<Set<number> | null>(null)

  const visiblePeople = useMemo(() => {
    let result = personFilter
      ? people.filter(p => personFilter.has(p.id))
      : [...people];
    if (personSort === 'asc') result.sort((a, b) => a.first_name.localeCompare(b.first_name));
    if (personSort === 'desc') result.sort((a, b) => b.first_name.localeCompare(a.first_name));
    return result;
  }, [people, personFilter, personSort]);

  function openPopover() {
    setDraft(personFilter ? new Set(personFilter) : null);
    setPopoverOpen(true);
  }

  function applyFilter() {
    setPersonFilter(draft);
    setPopoverOpen(false);
  }

  function toggleDraft(id: number, checked: boolean) {
    setDraft(prev => {
      const next = new Set(prev ?? people.map(p => p.id));
      checked ? next.add(id) : next.delete(id);
      return next.size === people.length ? null : next;
    });
  }

  return (
    <div
      className="calendar-grid"
      style={{ gridTemplateColumns: `140px repeat(${dates.length}, minmax(100px, 1fr))` }}
    >
      <div className="calendar-header-cell calendar-header-cell--person">
        <span>Person</span>
        <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
          <PopoverTrigger asChild>
            <button className="calendar-filter-btn" onClick={openPopover}>
              <ListFilter size={13} />
            </button>
          </PopoverTrigger>
          <PopoverContent className="calendar-filter-popover">
            <p className="calendar-filter-section-label">Sort</p>
            <div className="calendar-filter-sort-row">
              <button
                className={`calendar-filter-sort-btn${personSort === 'asc' ? ' calendar-filter-sort-btn--active' : ''}`}
                onClick={() => setPersonSort(s => s === 'asc' ? null : 'asc')}
              >A → Z</button>
              <button
                className={`calendar-filter-sort-btn${personSort === 'desc' ? ' calendar-filter-sort-btn--active' : ''}`}
                onClick={() => setPersonSort(s => s === 'desc' ? null : 'desc')}
              >Z → A</button>
            </div>

            <p className="calendar-filter-section-label">Filter</p>
            <ul className="calendar-filter-list">
              <li className="calendar-filter-item calendar-filter-item--all">
                <label>
                  <input
                    type="checkbox"
                    checked={draft === null}
                    onChange={e => setDraft(e.target.checked ? null : new Set())}
                  />
                  {draft === null ? 'Deselect All' : 'Select All'}
                </label>
              </li>
              {[...people]
                .sort((a, b) => a.first_name.localeCompare(b.first_name))
                .map(p => (
                  <li key={p.id} className="calendar-filter-item">
                    <label>
                      <input
                        type="checkbox"
                        checked={draft === null || draft.has(p.id)}
                        onChange={e => toggleDraft(p.id, e.target.checked)}
                      />
                      {p.first_name} {p.last_name}
                    </label>
                  </li>
                ))
              }
            </ul>
            <button className="calendar-filter-apply-btn" onClick={applyFilter}>Apply</button>
          </PopoverContent>
        </Popover>
      </div>

      {dates.map(date => (
        <div key={date} className={`calendar-header-cell${date === TODAY ? ' calendar-header-cell--today' : ''}${isWeekend(date) ? ' calendar-header-cell--weekend' : ''}`}>
          {formatHeader(date)}
        </div>
      ))}

      {visiblePeople.map(person => (
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

import { useEffect, useState } from 'react';
import type { Person, Task } from '../types';
import CalendarGrid from './CalendarGrid';
import './Calendar.css';

interface Props {
  people: Person[];
  taskMap: Record<number, Record<string, Task[]>>
  dates: string[];
  loading: boolean;
  error: boolean;
  isCurrentWeek: boolean;
  selectedPersonId: number | null;
  selectedDate: string | null;
  onPrev: () => void;
  onNext: () => void;
  onToday: () => void;
  setPerson: (value: React.SetStateAction<Person | null>) => void;
  setCurrentDate: (value: React.SetStateAction<string | null>) => void;
}

export default function CalendarView({ people, taskMap, dates, loading, error, isCurrentWeek, selectedPersonId, selectedDate, onPrev, onNext, onToday, setPerson, setCurrentDate }: Props) {
  const [showLoading, setShowLoading] = useState(false);

  useEffect(() => {
    if (!loading) {
      setShowLoading(false);
      return;
    }
    const timer = setTimeout(() => setShowLoading(true), 3000);
    return () => clearTimeout(timer);
  }, [loading]);

  return (
    <div className="calendar-view">
      <div className="calendar-week-nav">
        <button onClick={onPrev}>&#8592;</button>
        <h2>Week of {dates[0]}</h2>
        <button onClick={onNext}>&#8594;</button>
        <button onClick={onToday} disabled={isCurrentWeek} className="calendar-today-btn">This Week</button>
      </div>
      {showLoading && <div style={{ padding: '1rem', color: '#888' }}>Loading...</div>}
      {error && <div style={{ padding: '1rem', color: '#c00' }}>Failed to load data.</div>}
      {!loading && !error && 
        <CalendarGrid 
          people={people} 
          dates={dates} 
          taskMap={taskMap} 
          selectedPersonId={selectedPersonId} 
          selectedDate={selectedDate} 
          setPerson={setPerson} 
          setCurrentDate={setCurrentDate} 
        />
      }
    </div>
  );
}

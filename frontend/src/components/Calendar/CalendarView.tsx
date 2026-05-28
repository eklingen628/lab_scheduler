import { useContext, useEffect, useState } from 'react';
import CalendarGrid from './grid/CalendarGrid';
import { CalendarContext } from './context/CalendarContext';
import './Calendar.css';

interface Props {
  loading: boolean;
  error: boolean;
  isCurrentWeek: boolean;
  onPrev: () => void;
  onNext: () => void;
  onToday: () => void;
}

export default function CalendarView({ loading, error, isCurrentWeek, onPrev, onNext, onToday }: Props) {
  const { dates } = useContext(CalendarContext);
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
        <div className="calendar-grid-wrapper">
          <CalendarGrid />
        </div>
      }
    </div>
  );
}

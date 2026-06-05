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
  const { dates, viewMode, setViewMode, } = useContext(CalendarContext);
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
        <button className="calendar-nav-btn" onClick={onPrev}>&#8592;</button>
        <h2>Week of {dates[0]}</h2>
        <button className="calendar-nav-btn" onClick={onNext}>&#8594;</button>
        <button onClick={onToday} disabled={isCurrentWeek} className="calendar-nav-btn calendar-today-btn">This Week</button>
        <div className="staging-view-switcher">
          <button
            className={`view-btn${viewMode === 'expanded' ? ' view-btn--active' : ''}`}
            onClick={() => {setViewMode('expanded') }}
          >
            Expanded
          </button>
          <button
            className={`view-btn${viewMode === 'compact' ? ' view-btn--active' : ''}`}
            onClick={() => setViewMode('compact')}
          >
            Compact
          </button>
        </div>
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

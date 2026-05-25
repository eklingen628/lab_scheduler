import { useState, useRef, useEffect } from 'react';

interface Props {
  label: string;
  activeCount?: number;
  children: React.ReactNode;
}

export default function FilterDropdown({ label, activeCount, children }: Props) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener('mousedown', onOutside);
    return () => document.removeEventListener('mousedown', onOutside);
  }, [open]);

  const isActive = !!activeCount && activeCount > 0;

  return (
    <div className="filter-dropdown" ref={ref}>
      <button
        className={`filter-dropdown-btn${isActive ? ' filter-dropdown-btn--active' : ''}`}
        onClick={() => setOpen(v => !v)}
      >
        {label}
        {isActive && <span className="filter-dropdown-badge">{activeCount}</span>}
        {' ▾'}
      </button>
      {open && <div className="filter-dropdown-panel">{children}</div>}
    </div>
  );
}

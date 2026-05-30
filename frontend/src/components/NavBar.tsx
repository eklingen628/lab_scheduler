import { useEffect, useRef, useState } from 'react';
import { NavLink } from 'react-router';
import './NavBar.css';

export default function NavBar() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <nav className="navbar" ref={ref}>
      <button className="navbar-toggle" onClick={() => setOpen(o => !o)} aria-expanded={open}>
        <span className="navbar-toggle-icon" />
        Menu
      </button>
      {open && (
        <ul className="navbar-dropdown">
          <li><NavLink to="/calendar" onClick={() => setOpen(false)}>Calendar</NavLink></li>
          <li><NavLink to="/staging" onClick={() => setOpen(false)}>Staging Area</NavLink></li>
          <li><NavLink to="/templates" onClick={() => setOpen(false)}>Templates</NavLink></li>
          <li><NavLink to="/timereport" onClick={() => setOpen(false)}>Time Report</NavLink></li>
        </ul>
      )}
    </nav>
  );
}

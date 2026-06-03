import { useState, useContext, useMemo } from 'react';
import { StagingAreaContext } from './StangingAreaContext';
import type { SampleTest } from '../types';

type SortField = 'sample_id' | 'test_name' | 'project' | 'status' | 'actual_start_date' | 'days_in_progress' | 'group_id';
type SortDir = 'asc' | 'desc';

const COLS: { label: string; field: SortField }[] = [
  { label: 'Sample ID',        field: 'sample_id'          },
  { label: 'Test Name',        field: 'test_name'          },
  { label: 'Project',          field: 'project'            },
  { label: 'Group',            field: 'group_id'           },
  { label: 'Status',           field: 'status'             },
  { label: 'Start Date',       field: 'actual_start_date'  },
  { label: 'Days in Progress', field: 'days_in_progress'   },
];

function daysInProgress(startDate: string | null, status: string | null): number | null {
  if (!startDate || status === 'Complete') return null;
  const start = new Date(startDate + 'T00:00:00');
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Math.floor((today.getTime() - start.getTime()) / 86400000);
}

export default function FlatTestsPane() {
  const { tests } = useContext(StagingAreaContext);

  const [search, setSearch] = useState('');
  const [sortField, setSortField] = useState<SortField | null>(null);
  const [sortDir, setSortDir] = useState<SortDir>('asc');

  function toggleSort(field: SortField) {
    if (sortField === field) {
      if (sortDir === 'asc') {
        setSortDir('desc');
      } else {
        setSortField(null);
        setSortDir('asc');
      }
    } else {
      setSortField(field);
      setSortDir('asc');
    }
  }

  const grouped = useMemo(() => tests.filter(t => t.group_id !== null), [tests]);

  const searchLower = search.toLowerCase();

  const processed = useMemo(() => {
    let result = grouped.filter(t =>
      !searchLower ||
      (t.sample_id ?? '').toLowerCase().includes(searchLower) ||
      (t.test_name ?? '').toLowerCase().includes(searchLower) ||
      (t.project ?? '').toLowerCase().includes(searchLower) ||
      (t.status ?? '').toLowerCase().includes(searchLower) ||
      String(t.group_id).includes(searchLower)
    );

    if (sortField) {
      result = [...result].sort((a, b) => {
        let av: string | number | null;
        let bv: string | number | null;
        if (sortField === 'days_in_progress') {
          av = daysInProgress(a.actual_start_date, a.status);
          bv = daysInProgress(b.actual_start_date, b.status);
        } else {
          av = a[sortField as keyof SampleTest] as string | null;
          bv = b[sortField as keyof SampleTest] as string | null;
        }
        if (av === null && bv === null) return 0;
        if (av === null) return sortDir === 'asc' ? 1 : -1;
        if (bv === null) return sortDir === 'asc' ? -1 : 1;
        const cmp = typeof av === 'number' && typeof bv === 'number'
          ? av - bv
          : String(av).localeCompare(String(bv));
        return sortDir === 'asc' ? cmp : -cmp;
      });
    }

    return result;
  }, [grouped, searchLower, sortField, sortDir]);

  return (
    <div className="pane">
      <div className="pane-header">
        <span className="pane-title">All Tests</span>
        <span className="pane-count">{grouped.length} tests in groups</span>
        <div className="pane-controls">
          <input
            className="pane-search"
            type="text"
            placeholder="Search tests…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>
      <div className="pane-body">
        <table className="flat-tests-table">
          <thead>
            <tr>
              {COLS.map(({ label, field }) => (
                <th
                  key={field}
                  className={`sortable-th${sortField === field ? ' sortable-th--active' : ''}`}
                  onClick={() => toggleSort(field)}
                >
                  {label}
                  {sortField === field && <span className="sort-indicator">{sortDir === 'asc' ? ' ↑' : ' ↓'}</span>}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {processed.map(t => {
              const days = daysInProgress(t.actual_start_date, t.status);
              return (
                <tr key={t.id}>
                  <td>{t.sample_id ?? '—'}</td>
                  <td>{t.test_name ?? '—'}</td>
                  <td>{t.project ?? '—'}</td>
                  <td>Group {t.group_id}</td>
                  <td>{t.status ?? '—'}</td>
                  <td>{t.actual_start_date ?? '—'}</td>
                  <td>{days !== null ? days : '—'}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

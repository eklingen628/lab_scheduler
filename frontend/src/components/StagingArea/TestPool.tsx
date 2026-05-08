import { useEffect, useState } from 'react';
import type { SampleTest } from '../types';

interface Props {
  allTests: SampleTest[];
  onNew: () => void;
  onToggle: (id: number) => void;
  selectedTestsToAdd: Set<number>;
  onMount: () => void;
}

type SortField = 'test_key' | 'sample_id' | 'test_name' | 'project' | 'due_date' | 'status';
type SortDir = 'asc' | 'desc';
interface Sort { field: SortField; dir: SortDir; }

const COLS: { label: string; field: SortField }[] = [
  { label: 'Test Key',  field: 'test_key'  },
  { label: 'Sample ID', field: 'sample_id' },
  { label: 'Test Name', field: 'test_name' },
  { label: 'Project',   field: 'project'   },
  { label: 'Due Date',  field: 'due_date'  },
  { label: 'Status',    field: 'status'    },
];

function applySorts(tests: SampleTest[], sorts: Sort[]): SampleTest[] {
  if (sorts.length === 0) return tests;
  return [...tests].sort((a, b) => {
    for (const { field, dir } of sorts) {
      const av = a[field];
      const bv = b[field];
      if (av === null && bv === null) continue;
      if (av === null) return dir === 'asc' ? 1 : -1;
      if (bv === null) return dir === 'asc' ? -1 : 1;
      const cmp = typeof av === 'number' && typeof bv === 'number'
        ? av - bv
        : String(av).localeCompare(String(bv));
      if (cmp !== 0) return dir === 'asc' ? cmp : -cmp;
    }
    return 0;
  });
}

export default function TestPool({ allTests, onNew, onToggle, selectedTestsToAdd, onMount }: Props) {
  const [collapsed, setCollapsed] = useState(false);
  const [sorts, setSorts] = useState<Sort[]>([]);

  useEffect(() => {
    onMount();
  }, []);

  function toggleSort(field: SortField) {
    setSorts(prev => {
      const existing = prev.find(s => s.field === field);
      if (!existing) return [...prev, { field, dir: 'asc' }];
      if (existing.dir === 'asc') return prev.map(s => s.field === field ? { ...s, dir: 'desc' } : s);
      return prev.filter(s => s.field !== field);
    });
  }

  const available = applySorts(allTests.filter(t => t.group_id === null), sorts);
  const count = selectedTestsToAdd.size;

  if (collapsed) {
    return (
      <div className="staging-pool staging-pool--collapsed">
        <button className="pool-toggle" onClick={() => setCollapsed(false)}>▶</button>
      </div>
    );
  }

  return (
    <div className="staging-pool">
      <div className="pool-header">
        <span className="pool-title">Test Pool</span>
        {sorts.length > 0 && (
          <button className="control-clear-btn" onClick={() => setSorts([])}>Clear Sort</button>
        )}
        <button className="staging-new-btn" onClick={onNew} disabled={count === 0}>
          + New Group{count > 0 ? ` (${count})` : ''}
        </button>
        <button className="pool-toggle" onClick={() => setCollapsed(true)}>◀</button>
      </div>
      <div className="pool-table-wrapper">
        {available.length === 0 ? (
          <p className="staging-empty" style={{ padding: '12px' }}>No ungrouped tests.</p>
        ) : (
          <table className="staging-table">
            <thead>
              <tr>
                <th></th>
                {COLS.map(({ label, field }) => {
                  const idx = sorts.findIndex(s => s.field === field);
                  const sort = idx >= 0 ? sorts[idx] : null;
                  return (
                    <th key={field} className="sortable-th" onClick={() => toggleSort(field)}>
                      {label}
                      {sort && (
                        <span className="sort-indicator">
                          {sort.dir === 'asc' ? ' ↑' : ' ↓'}
                          {sorts.length > 1 && <sup>{idx + 1}</sup>}
                        </span>
                      )}
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {available.map(test => (
                <tr
                  key={test.id}
                  className={selectedTestsToAdd.has(test.id) ? 'staging-row--selected' : ''}
                  onClick={() => onToggle(test.id)}
                >
                  <td>
                    <input
                      type="checkbox"
                      checked={selectedTestsToAdd.has(test.id)}
                      onChange={() => onToggle(test.id)}
                      onClick={e => e.stopPropagation()}
                    />
                  </td>
                  <td>{test.test_key}</td>
                  <td>{test.sample_id ?? '—'}</td>
                  <td>{test.test_name ?? '—'}</td>
                  <td>{test.project ?? '—'}</td>
                  <td>{test.due_date ?? '—'}</td>
                  <td>{test.status ?? '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

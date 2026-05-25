import { useState, useContext, useMemo } from 'react';
import { StagingAreaContext } from './StangingAreaContext';
import FilterDropdown from './FilterDropdown';

type SortField = 'test_key' | 'sample_id' | 'test_name' | 'project' | 'due_date' | 'status';
type SortDir = 'asc' | 'desc';
type Sort = { field: SortField; dir: SortDir };

const COLS: { label: string; field: SortField }[] = [
  { label: 'Test Key',  field: 'test_key'  },
  { label: 'Sample ID', field: 'sample_id' },
  { label: 'Test Name', field: 'test_name' },
  { label: 'Project',   field: 'project'   },
  { label: 'Due Date',  field: 'due_date'  },
  { label: 'Status',    field: 'status'    },
];

const STATUS_BADGE: Record<string, string> = {
  'Complete':    'badge--success',
  'In progress': 'badge--info',
  'Pending':     'badge--warning',
  'Cancelled':   'badge--secondary',
  'On hold':     'badge--secondary',
};

export default function UnassignedPane() {
  const {
    tests, selectedTestsToAdd, toggleSelect, setSelectedTestsToAdd, setShowModal,
  } = useContext(StagingAreaContext);

  const [sorts, setSorts]             = useState<Sort[]>([{ field: 'due_date', dir: 'asc' }]);
  const [search, setSearch]           = useState('');
  const [filterStatuses, setFilterStatuses] = useState<Set<string>>(new Set());
  const [filterProjects, setFilterProjects] = useState<Set<string>>(new Set());
  const [dueDateFrom, setDueDateFrom] = useState('');
  const [dueDateTo,   setDueDateTo]   = useState('');
  const [moveError, setMoveError] = useState<string | null>(null);

  const unassigned = useMemo(() => tests.filter(t => t.group_id === null), [tests]);

  const allStatuses = useMemo(() => {
    const set = new Set<string>();
    unassigned.forEach(t => { if (t.status) set.add(t.status); });
    return [...set].sort();
  }, [unassigned]);

  const allProjects = useMemo(() => {
    const set = new Set<string>();
    unassigned.forEach(t => { if (t.project) set.add(t.project); });
    return [...set].sort();
  }, [unassigned]);

  function toggleSortField(field: SortField) {
    setSorts(prev => {
      const idx = prev.findIndex(s => s.field === field);
      if (idx === -1) {
        return [...prev, { field, dir: 'asc' }];
      }
      if (prev[idx].dir === 'asc') {
        const next = [...prev];
        next[idx] = { field, dir: 'desc' };
        return next;
      }
      return prev.filter(s => s.field !== field);
    });
  }

  function toggleStatus(s: string) {
    setFilterStatuses(prev => {
      const next = new Set(prev);
      if (next.has(s)) next.delete(s); else next.add(s);
      return next;
    });
  }

  function toggleProject(p: string) {
    setFilterProjects(prev => {
      const next = new Set(prev);
      if (next.has(p)) next.delete(p); else next.add(p);
      return next;
    });
  }

  const visible = useMemo(() => {
    let result = unassigned;

    if (search) {
      const q = search.toLowerCase();
      result = result.filter(t =>
        String(t.test_key).includes(q) ||
        (t.sample_id ?? '').toLowerCase().includes(q) ||
        (t.test_name ?? '').toLowerCase().includes(q) ||
        (t.project ?? '').toLowerCase().includes(q) ||
        (t.status ?? '').toLowerCase().includes(q) ||
        (t.client ?? '').toLowerCase().includes(q) ||
        (t.method ?? '').toLowerCase().includes(q) ||
        (t.due_date ?? '').includes(q) ||
        (t.spec_sheet ?? '').toLowerCase().includes(q) ||
        (t.other_testing_documents ?? '').toLowerCase().includes(q)
      );
    }
    if (filterStatuses.size > 0) {
      result = result.filter(t => t.status !== null && filterStatuses.has(t.status));
    }
    if (filterProjects.size > 0) {
      result = result.filter(t => t.project !== null && filterProjects.has(t.project));
    }
    if (dueDateFrom) result = result.filter(t => t.due_date !== null && t.due_date >= dueDateFrom);
    if (dueDateTo)   result = result.filter(t => t.due_date !== null && t.due_date <= dueDateTo);

    if (sorts.length === 0) return [...result];

    return [...result].sort((a, b) => {
      for (const { field, dir } of sorts) {
        const av = a[field];
        const bv = b[field];
        if (av === null && bv === null) continue;
        if (av === null) return dir === 'asc' ? 1 : -1;
        if (bv === null) return dir === 'asc' ? -1 : 1;
        const cmp =
          typeof av === 'number' && typeof bv === 'number'
            ? av - bv
            : String(av).localeCompare(String(bv));
        if (cmp !== 0) return dir === 'asc' ? cmp : -cmp;
      }
      return 0;
    });
  }, [unassigned, search, filterStatuses, filterProjects, dueDateFrom, dueDateTo, sorts]);

  const selectedCount = selectedTestsToAdd.size;
  const allVisibleSelected =
    visible.length > 0 && visible.every(t => selectedTestsToAdd.has(t.id));

  function toggleAll() {
    if (selectedCount === 0) {
      setSelectedTestsToAdd(new Set(visible.map(t => t.id)));
    } else {
      setSelectedTestsToAdd(new Set());
    }
  }

  const dueDateActive = !!(dueDateFrom || dueDateTo);
  const activeFilterCount = filterStatuses.size + filterProjects.size + (dueDateActive ? 1 : 0);

  return (
    <div className="pane">
      <div className="pane-header">
        <span className="pane-title">Unassigned</span>
        <span className="pane-count">{unassigned.length} tests</span>
        <span className="pane-selection-count">Selected: {selectedCount}</span>
        <div className="pane-controls">
          <button
            className="staging-new-btn"
            disabled={selectedCount === 0}
            onClick={() => setShowModal(true)}
          >
            + New group{selectedCount > 0 ? ` (${selectedCount})` : ''}
          </button>

          {allStatuses.length > 0 && (
            <FilterDropdown label="Status" activeCount={filterStatuses.size}>
              {allStatuses.map(s => (
                <label key={s} className="filter-dropdown-option">
                  <input
                    type="checkbox"
                    checked={filterStatuses.has(s)}
                    onChange={() => toggleStatus(s)}
                  />
                  {s}
                </label>
              ))}
              {filterStatuses.size > 0 && (
                <button
                  className="filter-dropdown-clear"
                  onClick={() => setFilterStatuses(new Set())}
                >
                  Clear
                </button>
              )}
            </FilterDropdown>
          )}

          {allProjects.length > 0 && (
            <FilterDropdown label="Project" activeCount={filterProjects.size}>
              {allProjects.map(p => (
                <label key={p} className="filter-dropdown-option">
                  <input
                    type="checkbox"
                    checked={filterProjects.has(p)}
                    onChange={() => toggleProject(p)}
                  />
                  {p}
                </label>
              ))}
              {filterProjects.size > 0 && (
                <button
                  className="filter-dropdown-clear"
                  onClick={() => setFilterProjects(new Set())}
                >
                  Clear
                </button>
              )}
            </FilterDropdown>
          )}

          <FilterDropdown label="Due date" activeCount={dueDateActive ? 1 : 0}>
            <div className="filter-dropdown-date-row">
              <span className="pane-filter-label">From</span>
              <input
                type="date"
                className="filter-dropdown-date-input"
                value={dueDateFrom}
                onChange={e => setDueDateFrom(e.target.value)}
              />
            </div>
            <div className="filter-dropdown-date-row">
              <span className="pane-filter-label">To</span>
              <input
                type="date"
                className="filter-dropdown-date-input"
                value={dueDateTo}
                onChange={e => setDueDateTo(e.target.value)}
              />
            </div>
            {dueDateActive && (
              <button
                className="filter-dropdown-clear"
                onClick={() => { setDueDateFrom(''); setDueDateTo(''); }}
              >
                Clear
              </button>
            )}
          </FilterDropdown>

          <button
            className="control-clear-btn"
            style={{ visibility: activeFilterCount > 0 ? 'visible' : 'hidden' }}
            onClick={() => {
              setFilterStatuses(new Set());
              setFilterProjects(new Set());
              setDueDateFrom('');
              setDueDateTo('');
            }}
          >
            Clear all
          </button>

          <button
            className="control-clear-btn"
            style={{ visibility: sorts.length > 0 ? 'visible' : 'hidden' }}
            onClick={() => setSorts([])}
          >
            Clear sort
          </button>

          <input
            className="pane-search"
            type="text"
            placeholder="Search tests…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>

      {moveError && <div className="pane-error">{moveError}</div>}

      <div className="pane-body">
        {unassigned.length === 0 ? (
          <div className="staging-placeholder"><p>No unassigned tests.</p></div>
        ) : visible.length === 0 ? (
          <div className="staging-placeholder"><p>No tests match the current filters.</p></div>
        ) : (
          <div className="staging-table-wrapper pane-table-wrapper">
            <table className="staging-table">
              <thead>
                <tr>
                  <th>
                    <input
                      type="checkbox"
                      checked={allVisibleSelected}
                      onChange={toggleAll}
                    />
                  </th>
                  {COLS.map(({ label, field }) => {
                    const sortIdx = sorts.findIndex(s => s.field === field);
                    const sort = sortIdx !== -1 ? sorts[sortIdx] : null;
                    return (
                      <th
                        key={field}
                        className="sortable-th"
                        onClick={() => toggleSortField(field)}
                      >
                        {label}
                        {sort && (
                          <span className="sort-indicator">
                            {sort.dir === 'asc' ? ' ↑' : ' ↓'}
                            {sorts.length > 1 && (
                              <sup className="sort-priority">{sortIdx + 1}</sup>
                            )}
                          </span>
                        )}
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody>
                {visible.map(test => (
                  <tr
                    key={test.id}
                    className={selectedTestsToAdd.has(test.id) ? 'staging-row--selected' : ''}
                    onClick={() => toggleSelect(test.id)}
                  >
                    <td>
                      <input
                        type="checkbox"
                        checked={selectedTestsToAdd.has(test.id)}
                        onChange={() => toggleSelect(test.id)}
                        onClick={e => e.stopPropagation()}
                      />
                    </td>
                    <td className="cell--mono">{test.test_key}</td>
                    <td className="cell--mono cell--secondary">{test.sample_id ?? '—'}</td>
                    <td>{test.test_name ?? '—'}</td>
                    <td className="cell--secondary cell--small">{test.project ?? '—'}</td>
                    <td>{test.due_date ?? '—'}</td>
                    <td>
                      {test.status ? (
                        <span className={`status-badge ${STATUS_BADGE[test.status] ?? 'badge--secondary'}`}>
                          {test.status}
                        </span>
                      ) : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

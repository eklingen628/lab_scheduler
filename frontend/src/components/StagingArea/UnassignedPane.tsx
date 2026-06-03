import { useState, useContext, useMemo } from 'react';
import { StagingAreaContext } from './StangingAreaContext';

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import type { SampleTest } from '../types';

type SortField = 'sample_id' | 'test_name' | 'project' | 'available_date' | 'due_date' | 'status';
type SortDir = 'asc' | 'desc';
type Sort = { field: SortField; dir: SortDir };

const COLS: { label: string; field: SortField }[] = [
  { label: 'Project',        field: 'project'        },
  { label: 'Sample ID',      field: 'sample_id'      },
  { label: 'Test Name',      field: 'test_name'      },
  { label: 'Available Date', field: 'available_date' },
  { label: 'Due Date',       field: 'due_date'       },
  { label: 'Status',         field: 'status'         },
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

  const [sorts, setSorts] = useState<Sort[]>([{ field: 'due_date', dir: 'asc' }]);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState<Record<string, Set<string>>>({});
  const [dueDateFrom, setDueDateFrom] = useState('');
  const [dueDateTo,   setDueDateTo]   = useState('');




  const unassigned = useMemo(() => tests.filter(t => t.group_id === null), [tests]);





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



  function toggleFilter(val: string, field: string) {
    setFilters(prev => {
      const next = {...prev}
      next[field] = new Set(next[field])
      if (!next[field])
        next[field] = new Set()
      if (next[field].has(val)) next[field].delete(val); 
      else next[field].add(val);
      console.log(next)
      return next;
    });
  }

  function clearFiltersForField(field: string) {
    setFilters(prev => {
      const next = {...prev}
      next[field] = new Set()
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

    if (Object.values(filters).reduce((prev, curr) => prev + curr.size, 0) > 0) {
      Object.entries(filters).forEach(([field, filterSet])  => {
        result = result.filter(t => {
          const val = t[field as keyof SampleTest]
          return val !== null && filterSet.has(String(val))
        }) 
      })

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
  }, [unassigned, search, filters, dueDateFrom, dueDateTo, sorts]);


  const allUniqueVals = useMemo(() => {
    const uniqueMap: Record<string, Set<string>> = {}
    COLS.forEach(col => {
      unassigned.forEach(t => {
        const cf = col.field
        const cv = t[cf]
        if (!uniqueMap[cf])
          uniqueMap[cf] = new Set<string>();
        if (cv !== null)
          uniqueMap[cf].add(cv)
        })
    })
    return Object.fromEntries(Object.entries(uniqueMap).map(([key, val]) => [key, [...val].sort()]))
  }, [unassigned]);



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
  const activeFilterCount = Object.values(filters).reduce((prev, curr) => prev + curr.size, 0) + (dueDateActive ? 1 : 0);

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


          <button
            className="control-clear-btn"
            style={{ visibility: activeFilterCount > 0 ? 'visible' : 'hidden' }}
            onClick={() => {
              setFilters({});
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

      <div className="pane-body pane-body--flat">
        {unassigned.length === 0 ? (
          <div className="staging-placeholder"><p>No unassigned tests.</p></div>
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
                          <div onClick={e => e.stopPropagation()} style={{ display: 'inline-block' }}>
                            <Popover>
                              <PopoverTrigger asChild>
                                <button style={{ marginLeft: 4 }}>⊞</button>
                              </PopoverTrigger>
                              <PopoverContent>
                                <button onClick={() => clearFiltersForField(field)}>Clear Filters</button>
                                <ul>
                                  {allUniqueVals[field].map(cv =>
                                    <li key={cv} onClick={() => { toggleFilter(cv, field)}}>
                                      <input type="checkbox" onClick={e => e.stopPropagation()} checked={!!filters[field]?.has(cv)} onChange={() => toggleFilter(cv, field)} />
                                      {cv}
                                    </li>
                                  )}
                                </ul>
                              </PopoverContent>
                            </Popover>
                          </div>
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
                {visible.length === 0 ? (
                  <tr><td colSpan={COLS.length + 1} style={{ textAlign: 'center', padding: '4rem', color: '#888' }}>No tests match the current filters.</td></tr>
                ) : visible.map(test => (
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
                    <td className="cell--secondary cell--small">{test.project ?? '—'}</td>
                    <td className="cell--mono cell--secondary">{test.sample_id ?? '—'}</td>
                    <td>{test.test_name ?? '—'}</td>
                    <td>{test.available_date ?? '—'}</td>
                    <td>{test.due_date ?? '—'}</td>
                    <td>
                      {test.status ? (
                        <span className={`status-badge ${STATUS_BADGE[test.status] ?? 'badge--secondary'}`}>
                          {test.status}
                        </span>
                      ) : '—'}
                    </td>
                  </tr>
                ))
                }
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

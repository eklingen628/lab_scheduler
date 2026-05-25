import { useState, useContext, useMemo } from 'react';
import type { SampleTestGroup } from '../types';
import { StagingAreaContext } from './StangingAreaContext';
import GroupRow from './GroupRow';
import FilterDropdown from './FilterDropdown';

type ScheduleStatus = 'full' | 'partial' | 'none';
type SortField = 'project' | 'client' | 'test' | 'method' | 'earliestDue' | 'latestDue';
type SortDir = 'asc' | 'desc';
type HasTasksFilter = 'all' | 'has' | 'empty';

function getStatus(group: SampleTestGroup): ScheduleStatus {
  if (group.tasks.length === 0) return 'none';
  const scheduled = group.tasks.filter(t => t.scheduled_date).length;
  if (scheduled === group.tasks.length) return 'full';
  if (scheduled > 0) return 'partial';
  return 'none';
}

const SCHEDULE_STATUS_OPTIONS: { value: ScheduleStatus; label: string }[] = [
  { value: 'full',    label: 'Fully scheduled'    },
  { value: 'partial', label: 'Partially scheduled' },
  { value: 'none',    label: 'Not scheduled'       },
];

const SORT_COLS: { label: string; field: SortField }[] = [
  { label: 'Project',      field: 'project'    },
  { label: 'Client',       field: 'client'     },
  { label: 'Test',         field: 'test'       },
  { label: 'Method',       field: 'method'     },
  { label: 'Earliest available', field: 'earliestDue' },
  { label: 'Latest available',   field: 'latestDue'   },
];

export default function GroupsPane() {
  const { groups, tests } = useContext(StagingAreaContext);

  const [expandedIds, setExpandedIds] = useState<Set<number>>(new Set());
  const [search, setSearch]           = useState('');
  const [statusFilters, setStatusFilters] = useState<Set<ScheduleStatus>>(new Set());
  const [hasTasksFilter, setHasTasksFilter] = useState<HasTasksFilter>('all');
  const [sortField, setSortField]     = useState<SortField | null>(null);
  const [sortDir,   setSortDir]       = useState<SortDir>('asc');

  function toggleExpanded(id: number) {
    setExpandedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }

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

  function toggleStatusFilter(s: ScheduleStatus) {
    setStatusFilters(prev => {
      const next = new Set(prev);
      if (next.has(s)) next.delete(s); else next.add(s);
      return next;
    });
  }

  const searchLower = search.toLowerCase();

  const autoExpandIds = useMemo(() => {
    if (!searchLower) return new Set<number>();
    return new Set(
      groups
        .filter(g => g.tasks.some(t => (t.name ?? '').toLowerCase().includes(searchLower)))
        .map(g => g.id)
    );
  }, [groups, searchLower]);

  const processed = useMemo(() => {
    let result = groups.map(g => {
      const inGroup = tests.filter(t => t.group_id === g.id);
      const dueDates = inGroup.map(t => t.available_date).filter(Boolean) as string[];
      const sortedDates = [...dueDates].sort();
      return {
        group: g,
        inGroup,
        status: getStatus(g),
        projectKey: [...new Set(inGroup.map(t => t.project).filter(Boolean) as string[])].sort().join(', '),
        clientKey:  [...new Set(inGroup.map(t => t.client).filter(Boolean)  as string[])].sort().join(', '),
        testKey:    [...new Set(inGroup.map(t => t.test_name).filter(Boolean) as string[])].sort().join(', '),
        methodKey:  [...new Set(inGroup.map(t => t.method).filter(Boolean)  as string[])].sort().join(', '),
        earliestDue: sortedDates[0] ?? null,
        latestDue:   sortedDates.at(-1) ?? null,
      };
    });

    if (statusFilters.size > 0) {
      result = result.filter(({ status }) => statusFilters.has(status));
    }
    if (hasTasksFilter === 'has') {
      result = result.filter(({ group }) => group.tasks.length > 0);
    } else if (hasTasksFilter === 'empty') {
      result = result.filter(({ group }) => group.tasks.length === 0);
    }
    if (searchLower) {
      result = result.filter(({ group }) => {
        const nameMatch = `group ${group.id}`.includes(searchLower);
        const taskMatch = group.tasks.some(t => (t.name ?? '').toLowerCase().includes(searchLower));
        return nameMatch || taskMatch;
      });
    }

    if (sortField) {
      result.sort((a, b) => {
        let av: string | null;
        let bv: string | null;
        switch (sortField) {
          case 'project':    av = a.projectKey;   bv = b.projectKey;   break;
          case 'client':     av = a.clientKey;    bv = b.clientKey;    break;
          case 'test':       av = a.testKey;      bv = b.testKey;      break;
          case 'method':     av = a.methodKey;    bv = b.methodKey;    break;
          case 'earliestDue': av = a.earliestDue; bv = b.earliestDue;  break;
          case 'latestDue':  av = a.latestDue;    bv = b.latestDue;    break;
        }
        if (!av && !bv) return 0;
        if (!av) return sortDir === 'asc' ? 1 : -1;
        if (!bv) return sortDir === 'asc' ? -1 : 1;
        const cmp = av.localeCompare(bv);
        return sortDir === 'asc' ? cmp : -cmp;
      });
    } else {
      result.sort((a, b) => a.group.id - b.group.id);
    }

    return result;
  }, [groups, tests, statusFilters, hasTasksFilter, searchLower, sortField, sortDir]);

  const totalTasks   = groups.reduce((sum, g) => sum + g.tasks.length, 0);
  const fullCount    = groups.filter(g => getStatus(g) === 'full').length;
  const partialCount = groups.filter(g => getStatus(g) === 'partial').length;
  const noneCount    = groups.filter(g => getStatus(g) === 'none').length;

  const activeFilterCount = statusFilters.size + (hasTasksFilter !== 'all' ? 1 : 0);

  return (
    <div className="pane">
      <div className="pane-header">
        <span className="pane-title">Groups</span>
        <span className="pane-count">{groups.length} groups · {totalTasks} tasks</span>
        <span className="status-pill status-pill--full">{fullCount} fully</span>
        <span className="status-pill status-pill--partial">{partialCount} partial</span>
        <span className="status-pill status-pill--none">{noneCount} unscheduled</span>
        <div className="pane-controls">
          <FilterDropdown label="Schedule status" activeCount={statusFilters.size}>
            {SCHEDULE_STATUS_OPTIONS.map(({ value, label }) => (
              <label key={value} className="filter-dropdown-option">
                <input
                  type="checkbox"
                  checked={statusFilters.has(value)}
                  onChange={() => toggleStatusFilter(value)}
                />
                {label}
              </label>
            ))}
            {statusFilters.size > 0 && (
              <button className="filter-dropdown-clear" onClick={() => setStatusFilters(new Set())}>
                Clear
              </button>
            )}
          </FilterDropdown>

          <FilterDropdown label="Has tasks" activeCount={hasTasksFilter !== 'all' ? 1 : 0}>
            {(['all', 'has', 'empty'] as HasTasksFilter[]).map(v => (
              <label key={v} className="filter-dropdown-option">
                <input
                  type="radio"
                  name="hasTasks"
                  checked={hasTasksFilter === v}
                  onChange={() => setHasTasksFilter(v)}
                />
                {v === 'all' ? 'All' : v === 'has' ? 'Has tasks' : 'Empty'}
              </label>
            ))}
          </FilterDropdown>

          <button
            className="control-clear-btn"
            style={{ visibility: activeFilterCount > 0 ? 'visible' : 'hidden' }}
            onClick={() => { setStatusFilters(new Set()); setHasTasksFilter('all'); }}
          >
            Clear all
          </button>

          <input
            className="pane-search"
            type="text"
            placeholder="Search groups…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="pane-body">
        {groups.length === 0 ? (
          <div className="staging-placeholder">
            <p>No groups yet. Select tests from the unassigned pool and create a new group.</p>
          </div>
        ) : (
          <>
            <div className="groups-sort-header">
              {SORT_COLS.map(({ label, field }) => (
                <button
                  key={field}
                  className={`groups-sort-btn${sortField === field ? ' groups-sort-btn--active' : ''}`}
                  onClick={() => toggleSort(field)}
                >
                  {label}
                  {sortField === field && (
                    <span className="sort-indicator">{sortDir === 'asc' ? ' ↑' : ' ↓'}</span>
                  )}
                </button>
              ))}
              <button
                className="control-clear-btn"
                style={{ visibility: sortField ? 'visible' : 'hidden' }}
                onClick={() => { setSortField(null); setSortDir('asc'); }}
              >
                Clear sort
              </button>
            </div>
            {processed.length === 0 ? (
              <div className="staging-placeholder">
                <p>No groups match the current filters.</p>
              </div>
            ) : (
              processed.map(({ group, inGroup }) => (
                <GroupRow
                  key={group.id}
                  group={group}
                  inGroup={inGroup}
                  expanded={expandedIds.has(group.id) || autoExpandIds.has(group.id)}
                  onToggle={() => toggleExpanded(group.id)}
                  searchQuery={search}
                />
              ))
            )}
          </>
        )}
      </div>
    </div>
  );
}

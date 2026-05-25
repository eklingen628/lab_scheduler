import { useState, useContext } from 'react';
import type { SampleTestGroup } from '../types';
import { StagingAreaContext } from './StangingAreaContext';
import GroupCard from './GroupCard';



type FilterStatus = 'full' | 'partial' | 'none';

const FILTER_LABELS: { status: FilterStatus; label: string }[] = [
  { status: 'full',    label: 'Fully Scheduled'   },
  { status: 'partial', label: 'Partially Scheduled' },
  { status: 'none',    label: 'Not Scheduled'     },
];

function getGroupStatus(group: SampleTestGroup): FilterStatus {
  if (group.tasks.length === 0) return 'none';
  const scheduled = group.tasks.filter(t => t.scheduled_date).length;
  if (scheduled === group.tasks.length) return 'full';
  if (scheduled > 0) return 'partial';
  return 'none';
}


export default function GroupList() {
  const { groups, tests, } = useContext(StagingAreaContext);
  
  
  const [activeFilters, setActiveFilters] = useState<Set<FilterStatus>>(new Set());

  function toggleFilter(status: FilterStatus) {
    setActiveFilters(prev => {
      const next = new Set(prev);
      if (next.has(status)) next.delete(status); else next.add(status);
      return next;
    });
  }

  if (groups.length === 0) {
    return (
      <div className="staging-placeholder">
        <p>No groups yet. Select tests from the pool and create a new group.</p>
      </div>
    );
  }

  const filteredGroups = activeFilters.size === 0
    ? groups
    : groups.filter(g => activeFilters.has(getGroupStatus(g)));


  return (
    <>
    <div className="group-cards">
      <div className="group-controls">
        <div className="group-filters">
          {FILTER_LABELS.map(({ status, label }) => (
            <button
              key={status}
              className={`filter-btn${activeFilters.has(status) ? ' filter-btn--active' : ''}`}
              onClick={() => toggleFilter(status)}
            >
              {label}
            </button>
          ))}
          {activeFilters.size > 0 && (
            <button className="control-clear-btn" onClick={() => setActiveFilters(new Set())}>
              Clear Filters
            </button>
          )}
        </div>
      </div>

      {filteredGroups.length === 0 ? (
        <div className="staging-placeholder">
          <p>No groups match the selected filters.</p>
        </div>
      ) : (
        filteredGroups.map(group => {
          const inGroup = tests.filter(t => t.group_id === group.id);
          const hasScheduled = group.tasks.some(t => t.scheduled_date !== null);

          return <GroupCard key={group.id} group={group} inGroup={inGroup} hasScheduled={hasScheduled} />
        })
      )}
    </div>
    </>
  );
}

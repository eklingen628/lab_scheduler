import { useState } from 'react';
import type { SampleTest, SampleTestGroup } from '../types';

interface Props {
  groups: SampleTestGroup[];
  allTests: SampleTest[];
  selectedTestsToAdd: Set<number>;
  onAdd: (groupId: number) => Promise<void>;
  onRemove: (testId: number) => Promise<void>;
  onDelete: (groupId: number) => Promise<void>;
  onUnschedule: (taskId: number) => Promise<void>;
  adding: boolean;
}

type FilterStatus = 'full' | 'partial' | 'none';

const TEST_COLS = ['Test Key', 'Sample ID', 'Test Name', 'Project', 'Due Date', 'Status'] as const;

const TASK_COLS = ['Name', 'Type', 'Equipment', 'Scheduled Date'] as const;

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


type DialogState =
  | { kind: 'alert'; message: string }
  | { kind: 'confirm'; message: string; onConfirm: () => void }
  | null;

export default function GroupCards({ groups, allTests, selectedTestsToAdd, onAdd, onRemove, onDelete, onUnschedule, adding }: Props) {
  const [activeFilters, setActiveFilters] = useState<Set<FilterStatus>>(new Set());
  const [dialog, setDialog] = useState<DialogState>(null);

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

  const count = selectedTestsToAdd.size;

  return (
    <>
    {dialog && (
      <div className="modal-overlay" onClick={() => setDialog(null)}>
        <div className="modal-card" onClick={e => e.stopPropagation()}>
          <p style={{ margin: '0 0 20px', fontSize: '0.9rem', color: '#333' }}>{dialog.message}</p>
          <div className="modal-actions">
            {dialog.kind === 'confirm' && (
              <button className="modal-btn modal-btn--cancel" onClick={() => setDialog(null)}>Cancel</button>
            )}
            <button
              className="modal-btn modal-btn--confirm"
              onClick={() => { if (dialog.kind === 'confirm') dialog.onConfirm(); setDialog(null); }}
            >
              OK
            </button>
          </div>
        </div>
      </div>
    )}
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
          const inGroup = allTests.filter(t => t.group_id === group.id);
          const hasScheduled = group.tasks.some(t => t.scheduled_date !== null);

          return (
            <div key={group.id} className="group-card">
              <div className="group-card-header">
                <span className="group-card-title">Group {group.id}</span>
                <span className="group-card-meta">
                  {inGroup.length} test{inGroup.length !== 1 ? 's' : ''}
                  {' · '}
                  {group.tasks.length} task{group.tasks.length !== 1 ? 's' : ''}
                </span>
                <button
                  className="staging-new-btn"
                  disabled={count === 0 || adding}
                  onClick={() => onAdd(group.id)}
                >
                  {adding ? 'Adding…' : `Add Selected (${count}) ▸`}
                </button>
                <button
                  className="delete-group-btn"
                  disabled={hasScheduled}
                  title={hasScheduled ? 'Unschedule all tasks before deleting this group.' : undefined}
                  onClick={() => setDialog({
                    kind: 'confirm',
                    message: `Delete Group ${group.id} and release its tests back to the pool?`,
                    onConfirm: () => onDelete(group.id),
                  })}
                >
                  Delete Group
                </button>
              </div>

              <div className="group-card-section">
                <span className="group-card-section-label">Tests</span>
                {inGroup.length === 0 ? (
                  <p className="staging-empty" style={{ padding: '8px 14px' }}>No tests in this group yet.</p>
                ) : (
                  <div className="staging-table-wrapper group-card-table">
                    <table className="staging-table">
                      <thead>
                        <tr>
                          {TEST_COLS.map(c => <th key={c}>{c}</th>)}
                          <th></th>
                        </tr>
                      </thead>
                      <tbody>
                        {inGroup.map(test => (
                          <tr key={test.id} className="in-group-row">
                            <td>{test.test_key}</td>
                            <td>{test.sample_id ?? '—'}</td>
                            <td>{test.test_name ?? '—'}</td>
                            <td>{test.project ?? '—'}</td>
                            <td>{test.due_date ?? '—'}</td>
                            <td>{test.status ?? '—'}</td>
                            <td>
                              <button
                                className="remove-btn"
                                onClick={() => {
                                  if (inGroup.length === 1) {
                                    if (hasScheduled) {
                                      setDialog({ kind: 'alert', message: `Cannot remove the last test: Group ${group.id} has scheduled tasks. Unschedule them first.` });
                                      return;
                                    }
                                    setDialog({
                                      kind: 'confirm',
                                      message: `This is the last test in Group ${group.id}. Removing it will delete the group.`,
                                      onConfirm: () => onDelete(group.id),
                                    });
                                  } else {
                                    onRemove(test.id);
                                  }
                                }}
                              >
                                Remove
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              <div className="group-card-section">
                <span className="group-card-section-label">Tasks</span>
                {group.tasks.length === 0 ? (
                  <p className="staging-empty" style={{ padding: '8px 14px' }}>No tasks yet.</p>
                ) : (
                  <div className="staging-table-wrapper group-card-table">
                    <table className="staging-table">
                      <thead>
                        <tr>
                          {TASK_COLS.map(c => <th key={c}>{c}</th>)}
                          <th></th>
                        </tr>
                      </thead>
                      <tbody>
                        {group.tasks.map(task => (
                          <tr key={task.id} className={task.scheduled_date ? 'task-row--scheduled' : ''}>
                            <td>{task.name}</td>
                            <td>{task.type ?? '—'}</td>
                            <td>{task.equipment ?? '—'}</td>
                            <td>{task.scheduled_date ?? <span className="unscheduled-label">Unscheduled</span>}</td>
                            <td>
                              {task.scheduled_date && (
                                <button className="remove-btn" onClick={() => onUnschedule(task.id)}>
                                  Remove from Schedule
                                </button>
                              )}
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
        })
      )}
    </div>
    </>
  );
}

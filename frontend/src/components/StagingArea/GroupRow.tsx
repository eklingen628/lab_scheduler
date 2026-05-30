import { useState, useContext, useRef, useEffect } from 'react';
import type { SampleTest, SampleTestGroup } from '../types';
import { StagingAreaContext } from './StangingAreaContext';
import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuTrigger } from '@/components/ui/context-menu';
import { useNavigate } from 'react-router';

type ScheduleStatus = 'full' | 'partial' | 'none';

function getStatus(group: SampleTestGroup): ScheduleStatus {
  if (group.tasks.length === 0) return 'none';
  const scheduled = group.tasks.filter(t => t.scheduled_date).length;
  if (scheduled === group.tasks.length) return 'full';
  if (scheduled > 0) return 'partial';
  return 'none';
}


const STATUS_LABELS: Record<ScheduleStatus, string> = {
  full: 'fully scheduled',
  partial: 'partially scheduled',
  none: 'not scheduled',
};

type DialogState =
  | { kind: 'alert'; message: string }
  | { kind: 'confirm'; message: string; onConfirm: () => void }
  | null;

type TestSortField = 'sample_id' | 'test_name' | 'project' | 'available_date' | 'due_date' | 'status';
type SortDir = 'asc' | 'desc';

const TEST_COLS: { label: string; field: TestSortField }[] = [
  { label: 'Sample ID',        field: 'sample_id'      },
  { label: 'Test Name',        field: 'test_name'      },
  { label: 'Project',          field: 'project'        },
  { label: 'Available Date',   field: 'available_date' },
  { label: 'Due Date',         field: 'due_date'       },
  { label: 'Status',           field: 'status'         },
];

const TASK_COLS = ['Name', 'Type', 'Equipment', 'Scheduled Date', 'Person'] as const;

interface Props {
  group: SampleTestGroup;
  inGroup: SampleTest[];
  expanded: boolean;
  onToggle: () => void;
  searchQuery: string;
}

export default function GroupRow({ group, inGroup, expanded, onToggle, searchQuery }: Props) {
  const { selectedTestsToAdd, handleAdd, handleRemove, handleDeleteGroup, handleUnschedule, adding, people, setEditingTask } =
    useContext(StagingAreaContext);

  const [dialog, setDialog] = useState<DialogState>(null);
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);

  const [testSortField, setTestSortField] = useState<TestSortField | null>(null);
  const [testSortDir,   setTestSortDir]   = useState<SortDir>('asc');

  const count = selectedTestsToAdd.size;
  const status = getStatus(group);
  const hasScheduled = group.tasks.some(t => t.scheduled_date !== null);

  const goToCalendar = useNavigate();

  useEffect(() => {
    if (expanded) {
      headerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [expanded]);

  const dueDates = inGroup.map(t => t.available_date).filter(Boolean) as string[];
  const sortedDueDates = [...dueDates].sort();
  const earliestDue = sortedDueDates[0] ?? null;
  const latestDue   = sortedDueDates.at(-1) ?? null;

  useEffect(() => {
    function handleOutsideClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowMenu(false);
      }
    }
    if (showMenu) document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [showMenu]);

  const projects  = [...new Set(inGroup.map(t => t.project).filter((v): v is string => v !== null))].sort();
  const clients   = [...new Set(inGroup.map(t => t.client).filter((v): v is string => v !== null))].sort();
  const testNames = [...new Set(inGroup.map(t => t.test_name).filter((v): v is string => v !== null))].sort();
  const methods   = [...new Set(inGroup.map(t => t.method).filter((v): v is string => v !== null))].sort();

  const metaParts = [
    `${inGroup.length} test${inGroup.length !== 1 ? 's' : ''}`,
    `${group.tasks.length} task${group.tasks.length !== 1 ? 's' : ''}`,
    STATUS_LABELS[status],
  ];

  function toggleTestSort(field: TestSortField) {
    if (testSortField === field) {
      if (testSortDir === 'asc') {
        setTestSortDir('desc');
      } else {
        setTestSortField(null);
        setTestSortDir('asc');
      }
    } else {
      setTestSortField(field);
      setTestSortDir('asc');
    }
  }

  const sortedInGroup = testSortField
    ? [...inGroup].sort((a, b) => {
        const av = a[testSortField];
        const bv = b[testSortField];
        if (av === null && bv === null) return 0;
        if (av === null) return testSortDir === 'asc' ? 1 : -1;
        if (bv === null) return testSortDir === 'asc' ? -1 : 1;
        const cmp =
          typeof av === 'number' && typeof bv === 'number'
            ? av - bv
            : String(av).localeCompare(String(bv));
        return testSortDir === 'asc' ? cmp : -cmp;
      })
    : inGroup;

  return (
    <>
      {dialog && (
        <div className="modal-overlay" onClick={() => setDialog(null)}>
          <div className="modal-card" onClick={e => e.stopPropagation()}>
            <p style={{ margin: '0 0 20px', fontSize: '0.9rem', color: '#333' }}>{dialog.message}</p>
            <div className="modal-actions">
              <button
                className="modal-btn modal-btn--confirm"
                onClick={() => {
                  if (dialog.kind === 'confirm') dialog.onConfirm();
                  setDialog(null);
                }}
              >
                OK
              </button>
              {dialog.kind === 'confirm' && (
                <button className="modal-btn modal-btn--cancel" onClick={() => setDialog(null)}>
                  Cancel
                </button>
              )}

            </div>
          </div>
        </div>
      )}

      <div className={`group-row group-row--${status}`}>
        <div className="group-row-header" ref={headerRef} onClick={onToggle}>
          <div className="group-row-title-line">
            <span className="group-row-chevron">{expanded ? '▼' : '▶'}</span>
            <span className="group-row-name">Group {group.id}</span>
            <span className="group-row-meta">{metaParts.join(' · ')}</span>
            <button
              className="staging-new-btn group-row-add-btn"
              disabled={count === 0 || adding}
              onClick={e => {
                e.stopPropagation();
                handleAdd(group.id);
              }}
            >
              {adding ? 'Adding…' : `Add selected (${count}) ▸`}
            </button>
            <div className="group-row-menu-wrapper" ref={menuRef}>
              <button
                className="group-row-menu-btn"
                onClick={e => {
                  e.stopPropagation();
                  setShowMenu(v => !v);
                }}
              >
                ⋯
              </button>
              {showMenu && (
                <div className="group-row-menu">
                  <button
                    className="group-row-menu-item group-row-menu-item--danger"
                    disabled={hasScheduled}
                    title={hasScheduled ? 'Unschedule all tasks before deleting.' : undefined}
                    onClick={() => {
                      setShowMenu(false);
                      setDialog({
                        kind: 'confirm',
                        message: `Delete Group ${group.id} and unassign its tests?`,
                        onConfirm: () => handleDeleteGroup(group.id),
                      });
                    }}
                  >
                    Delete group
                  </button>
                </div>
              )}
            </div>
          </div>

          <table className="group-meta-table">
              <thead>
                <tr>
                  <th>Project</th>
                  <th>Client</th>
                  <th>Test</th>
                  <th>Method</th>
                  <th>Earliest available</th>
                  <th>Latest available</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="cell--mono">{projects.join(', ') || '—'}</td>
                  <td>{clients.join(', ') || '—'}</td>
                  <td>{testNames.join(', ') || '—'}</td>
                  <td className="cell--mono">{methods.join(', ') || '—'}</td>
                  <td>{earliestDue ?? '—'}</td>
                  <td>{latestDue ?? '—'}</td>
                </tr>
              </tbody>
            </table>
        </div>

        {expanded && (
          <div className="group-row-body">
            {inGroup.length > 0 && (
            <div className="group-card-section">
              {(
                <div className="staging-table-wrapper group-card-table">
                  <table className="staging-table">
                    <thead>
                      <tr>
                        {TEST_COLS.map(({ label, field }) => (
                          <th
                            key={field}
                            className="sortable-th"
                            onClick={e => { e.stopPropagation(); toggleTestSort(field); }}
                          >
                            {label}
                            {testSortField === field && (
                              <span className="sort-indicator">
                                {testSortDir === 'asc' ? ' ↑' : ' ↓'}
                              </span>
                            )}
                          </th>
                        ))}
                        <th></th>
                      </tr>
                    </thead>
                    <tbody>
                      {sortedInGroup.map(test => (
                        <tr key={test.id} className="in-group-row">
                          <td>{test.sample_id ?? '—'}</td>
                          <td>{test.test_name ?? '—'}</td>
                          <td>{test.project ?? '—'}</td>
                          <td>{test.available_date ?? '—'}</td>
                          <td>{test.due_date ?? '—'}</td>
                          <td>{test.status ?? '—'}</td>
                          <td>
                            <button
                              className="remove-btn"
                              onClick={() => {
                                if (inGroup.length === 1) {
                                  if (hasScheduled) {
                                    setDialog({
                                      kind: 'alert',
                                      message: `Cannot remove the last test: Group ${group.id} has scheduled tasks. Unschedule them first.`,
                                    });
                                    return;
                                  }
                                  setDialog({
                                    kind: 'confirm',
                                    message: `This is the last test in Group ${group.id}. Removing it will delete the group.`,
                                    onConfirm: () => handleDeleteGroup(group.id),
                                  });
                                } else {
                                  setDialog({
                                    kind: 'confirm',
                                    message: `Are you sure you want to remove this test from the group?`,
                                    onConfirm: () => handleRemove(test.id),
                                  });
                                  
                                
                                }
                              }}
                            >
                              Remove From Group
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
            )}

            <div className="group-card-section">
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
                      {group.tasks.map(task => {
                        const currPerson = people.find(p => p.id === task.person_id)
                        const personName = currPerson ? `${currPerson.first_name} ${currPerson.last_name}` : null
                        return (
                        <ContextMenu>
                          <ContextMenuTrigger asChild>
                            <tr key={task.id}>
                              <td>{task.name}</td>
                              <td>{task.type ?? '—'}</td>
                              <td>{task.equipment ?? '—'}</td>
                              <td>
                                {task.scheduled_date ?? (
                                  <span className="unscheduled-pill">Unscheduled</span>
                                )}
                              </td>
                              <td>
                                {currPerson ? personName : <span className="unscheduled-pill">Unassigned</span>}
                              </td>
                              <td>
                                {task.scheduled_date && (
                                  <button
                                    className="outline-btn"
                                    onClick={() => {
                                      setDialog({
                                        kind: 'confirm',
                                        message: `Are you sure you want to remove this task from the schedule?`,
                                        onConfirm: () => handleUnschedule(task.id),
                                      });
                                    }}                                    
                                  >
                                    Unschedule
                                  </button>
                                )}
                              </td>
                            </tr>
                          </ContextMenuTrigger>
                          <ContextMenuContent>
                            <ContextMenuItem onClick={() => setEditingTask(task)}>Edit</ContextMenuItem>
                            {task.person_id && task.scheduled_date && (
                              <ContextMenuItem onClick={() => goToCalendar(`/calendar?person=${task.person_id!}&date=${task.scheduled_date!}`)}>View on Calendar</ContextMenuItem>
                            )}
                          </ContextMenuContent>
                        </ContextMenu>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
}

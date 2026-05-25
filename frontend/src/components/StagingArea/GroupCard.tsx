import { useState, useContext } from 'react';
import type { SampleTest, SampleTestGroup } from '../types';
import { StagingAreaContext } from './StangingAreaContext';

interface GroupCardProps {
  group: SampleTestGroup;
  inGroup: SampleTest[];
  hasScheduled: boolean;
}


const TEST_COLS = ['Test Key', 'Sample ID', 'Test Name', 'Project', 'Due Date', 'Status'] as const;

const TASK_COLS = ['Name', 'Type', 'Equipment', 'Scheduled Date'] as const;


type DialogState =
  | { kind: 'alert'; message: string }
  | { kind: 'confirm'; message: string; onConfirm: () => void }
  | null;

export default function GroupCard({ group, inGroup, hasScheduled }: GroupCardProps) {
  const { selectedTestsToAdd, handleAdd, handleRemove, handleDeleteGroup, handleUnschedule, adding } = useContext(StagingAreaContext);  
  
  const [dialog, setDialog] = useState<DialogState>(null);

  const count = selectedTestsToAdd.size;

  return (
    <>
      {dialog && (
        <div className="modal-overlay" onClick={() => setDialog(null)}>
          <div className="modal-card" onClick={e => e.stopPropagation()}>
            <p style={{ margin: '0 0 20px', fontSize: '0.9rem', color: '#333' }}>{dialog.message}</p>
            <div className="modal-actions">
              <button
                className="modal-btn modal-btn--confirm"
                onClick={() => { if (dialog.kind === 'confirm') dialog.onConfirm(); setDialog(null); }}
              >
                OK
              </button>
              {dialog.kind === 'confirm' && (
                <button className="modal-btn modal-btn--cancel" onClick={() => setDialog(null)}>Cancel</button>
              )}

            </div>
          </div>
        </div>
      )}


      <div className="group-card">
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
            onClick={() => handleAdd(group.id)}
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
              onConfirm: () => handleDeleteGroup(group.id),
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
                                onConfirm: () => handleDeleteGroup(group.id),
                              });
                            } else {
                              handleRemove(test.id);
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
                          <button className="remove-btn" onClick={() => handleUnschedule(task.id)}>
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

    </>
  );
}

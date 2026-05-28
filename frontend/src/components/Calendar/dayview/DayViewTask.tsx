import { GripVertical } from 'lucide-react';
import type { SampleTest, Task } from '../../types';
import '../Calendar.css';
import { uniqueField } from '../../utils';

interface Props {
  task: Task;
  sampleTests?: SampleTest[];
  ghost?: boolean;
  isDragOverlay?: boolean;
}

function formatShortDate(iso: string): string {
  const d = new Date(iso + 'T00:00:00');
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export default function DayViewTask({ task, sampleTests = [], ghost = false, isDragOverlay = false }: Props) {


  const projects  = sampleTests.length > 0 ? uniqueField(sampleTests, 'project') : task.project ? [task.project] : [];
  const testNames = sampleTests.length > 0 ? uniqueField(sampleTests, 'test_name') : task.test_name ? [task.test_name] : [];
  const methods   = sampleTests.length > 0 ? uniqueField(sampleTests, 'method') : task.method ? [task.method] : [];


  const clients   = [...new Set(sampleTests.map(st => st.client).filter((v): v is string => v !== null))];
  const specSheets = [...new Set(sampleTests.map(st => st.spec_sheet).filter((v): v is string => v !== null))];
  const otherDocs  = [...new Set(sampleTests.map(st => st.other_testing_documents).filter((v): v is string => v !== null))];

  return (
    <div
      className="day-view-task"
      style={{
        opacity: ghost ? 0.3 : 1,
        cursor: isDragOverlay ? 'grabbing' : 'grab',
      }}
    >
      <div className="day-view-task-grip">
        <GripVertical size={14} />
      </div>
      <div className="day-view-task-body">
        <div className="day-view-task-header">
          <span className="day-view-task-name">{task.name}</span>
          {task.type && <span className="day-view-task-type">{task.type}</span>}
        </div>
        {task.description && (
          <p className="day-view-task-description">{task.description}</p>
        )}

        {(projects.length > 0 || clients.length > 0 || testNames.length > 0 || methods.length > 0 || specSheets.length > 0 || otherDocs.length > 0) && (
          <div className="day-view-task-fields day-view-task-group-fields">
            {projects.length > 0 && (
              <div className="day-view-task-field">
                <span className="day-view-task-label">Project</span>
                <span className='day-view-task-field-value'>{projects.join(', ')}</span>
              </div>
            )}
            {clients.length > 0 && (
              <div className="day-view-task-field">
                <span className="day-view-task-label">Client</span>
                <span className='day-view-task-field-value'>{clients.join(', ')}</span>
              </div>
            )}
            {testNames.length > 0 && (
              <div className="day-view-task-field">
                <span className="day-view-task-label">Tests</span>
                <span className='day-view-task-field-value'>{testNames.join(', ')}</span>
              </div>
            )}
            {methods.length > 0 && (
              <div className="day-view-task-field">
                <span className="day-view-task-label">Method</span>
                <span className='day-view-task-field-value'>{methods.join(', ')}</span>
              </div>
            )}
            {specSheets.length > 0 && (
              <div className="day-view-task-field">
                <span className="day-view-task-label">Spec</span>
                <span className='day-view-task-field-value'>{specSheets.join(', ')}</span>
              </div>
            )}
            {otherDocs.length > 0 && (
              <div className="day-view-task-field">
                <span className="day-view-task-label">Docs</span>
                <span className='day-view-task-field-value'>{otherDocs.join(', ')}</span>
              </div>
            )}
            <div className="day-view-task-field">
              <span className="day-view-task-label">Equipment</span>
              <span className='day-view-task-field-value'>{task.equipment ?? '—'}</span>
            </div>
          </div>
        )}

        {sampleTests.length > 0 && (
          <div className="day-view-task-samples">
            <table className="day-view-task-sample-table">
              <thead>
                <tr>
                  <th>Sample</th>
                  <th>#</th>
                  <th>Status</th>
                  <th>Due</th>
                  <th>PR</th>
                </tr>
              </thead>
              <tbody>
                {sampleTests.map(st => (
                  <tr key={st.id}>
                    <td>{st.sample_id ?? '—'}</td>
                    <td>{st.number_of != null ? `${st.number_of}×` : '—'}</td>
                    <td>{st.status ?? '—'}</td>
                    <td>{st.due_date ? formatShortDate(st.due_date) : '—'}</td>
                    <td>{st.pr_comp ? <span className="day-view-task-pr-badge">PR</span> : null}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}


        <div className="day-view-task-fields">
          <div className="day-view-task-field">
            <span className="day-view-task-label">Base time</span>
            <span className='day-view-task-field-value'>{task.base_time}h</span>
          </div>
          <div className="day-view-task-field">
            <span className="day-view-task-label">Per replicate</span>
            <span className='day-view-task-field-value'>{task.time_per_replicate != null ? `${task.time_per_replicate}h` : '—'}</span>
          </div>
          <div className="day-view-task-field">
            <span className="day-view-task-label">Group ID</span>
            <span className='day-view-task-field-value'>{task.sample_test_group_id ?? '—'}</span>
          </div>
        </div>

      </div>
    </div>
  );
}

import { GripVertical } from 'lucide-react';
import type { Task } from '../types';
import './Calendar.css';

interface Props {
  task: Task;
  ghost?: boolean;
  isDragOverlay?: boolean;
}

export default function DayViewTask({ task, ghost = false, isDragOverlay = false }: Props) {
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
        <div className="day-view-task-fields">
          <div className="day-view-task-field">
            <span className="day-view-task-label">Base time</span>
            <span>{task.base_time}h</span>
          </div>
          <div className="day-view-task-field">
            <span className="day-view-task-label">Per replicate</span>
            <span>{task.time_per_replicate != null ? `${task.time_per_replicate}h` : '—'}</span>
          </div>
          <div className="day-view-task-field">
            <span className="day-view-task-label">Steps</span>
            <span>{task.min_step ?? '—'} – {task.max_step ?? '—'}</span>
          </div>
          <div className="day-view-task-field">
            <span className="day-view-task-label">Equipment</span>
            <span>{task.equipment ?? '—'}</span>
          </div>
          <div className="day-view-task-field">
            <span className="day-view-task-label">Group ID</span>
            <span>{task.sample_test_group_id}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

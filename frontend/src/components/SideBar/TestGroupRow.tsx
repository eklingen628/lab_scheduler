import TestGroupBubble from './TestGroupBubble';
import DraggableTaskChip from '../Calendar/DraggableTaskChip';
import TaskChip from '../Calendar/TaskChip';
import type { Task } from '../types';
import './Sidebar.css';

interface Props {
  groupId: number;
  sampleIds: string[];
  testNames: string[];
  tasks: Task[];
  scheduledOverrides: Map<number, boolean>;
}

export default function TestGroupRow({ groupId, sampleIds, testNames, tasks, scheduledOverrides }: Props) {
  return (
    <div className="sidebar-row">
      <TestGroupBubble groupId={groupId} sampleIds={sampleIds} testNames={testNames} />
      <div className="sidebar-tasks">
        {tasks.map(task => {
          const override = scheduledOverrides.get(task.id);
          const isScheduled = override !== undefined
            ? override
            : task.scheduled_date !== null;
          return isScheduled
            ? <TaskChip key={task.id} task={task} scheduled />
            : <DraggableTaskChip key={task.id} task={task} />;
        })}
      </div>
    </div>
  );
}

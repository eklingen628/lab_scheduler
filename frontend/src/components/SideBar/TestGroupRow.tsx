import TestGroupBubble from './TestGroupBubble';
import DraggableTaskChip from '../Calendar/DraggableTaskChip';
import type { Task } from '../types';
import './Sidebar.css';

interface Props {
  groupId: number;
  sampleIds: string[];
  testNames: string[];
  tasks: Task[];
}

export default function TestGroupRow({ groupId, sampleIds, testNames, tasks }: Props) {
  return (
    <div className="sidebar-row">
      <TestGroupBubble groupId={groupId} sampleIds={sampleIds} testNames={testNames} />
      <div className="sidebar-tasks">
        {tasks.map(task => (
          <DraggableTaskChip key={task.id} task={task} />
        ))}
      </div>
    </div>
  );
}

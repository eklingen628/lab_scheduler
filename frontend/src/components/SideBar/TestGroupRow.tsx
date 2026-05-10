import TestGroupBubble from './TestGroupBubble';
import DraggableTaskChip from '../Calendar/DraggableTaskChip';
import TaskChip from '../Calendar/TaskChip';
import type { SampleTest, Task } from '../types';
import './Sidebar.css';

interface Props {
  groupId: number;
  sampleTests: SampleTest[];
  testNames: string[];
  projects: string[];
  clients: string[];
  specSheets: string[];
  otherDocs: string[];
  methods: string[];
  tasks: Task[];
  scheduledOverrides: Map<number, boolean>;
}

export default function TestGroupRow({ groupId, sampleTests, testNames, projects, clients, specSheets, otherDocs, methods, tasks, scheduledOverrides }: Props) {
  return (
    <div className="sidebar-row">
      <TestGroupBubble
        groupId={groupId}
        sampleTests={sampleTests}
        testNames={testNames}
        projects={projects}
        clients={clients}
        specSheets={specSheets}
        otherDocs={otherDocs}
        methods={methods}
      />
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

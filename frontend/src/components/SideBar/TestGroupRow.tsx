import { useContext } from 'react';
import TestGroupBubble from './TestGroupBubble';
import DraggableTaskChip from '../Calendar/DraggableTaskChip';
import TaskChip from '../Calendar/TaskChip';
import type { SampleTest, Task } from '../types';
import './Sidebar.css';
import { memo } from 'react';
import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuTrigger } from '@/components/ui/context-menu';
import { CalendarContext } from '../Calendar/CalendarContext';

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


function TestGroupRow({ groupId, sampleTests, testNames, projects, clients, specSheets, otherDocs, methods, tasks, scheduledOverrides }: Props) {
  const { onEditTask, goToPersonDate } = useContext(CalendarContext);

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
            ? (
              <ContextMenu key={task.id}>
                <ContextMenuTrigger asChild>
                  <div>
                    <TaskChip task={task} scheduled />
                  </div>
                </ContextMenuTrigger>
                <ContextMenuContent>
                  <ContextMenuItem onClick={() => onEditTask(task)}>Edit</ContextMenuItem>
                  {task.person_id && task.scheduled_date && (
                    <ContextMenuItem onClick={() => goToPersonDate(task.person_id!, task.scheduled_date!)}>Go To Current</ContextMenuItem>
                  )}
                </ContextMenuContent>
              </ContextMenu>
            )
            : <DraggableTaskChip key={task.id} task={task} />;
        })}
      </div>
    </div>
  );
}


export default memo(TestGroupRow)

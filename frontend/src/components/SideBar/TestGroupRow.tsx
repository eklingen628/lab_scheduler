import { useContext, memo } from 'react';
import TestGroupBubble from './TestGroupBubble';
import DraggableTaskChip from '../Calendar/DraggableTaskChip';
import TaskChip from '../Calendar/TaskChip';
import type { SampleTest, Task } from '../types';
import './Sidebar.css';
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
  const { onEditTask, goToPersonDate, selectedGroupId, setSelectedGroupId } = useContext(CalendarContext);
  const isSelected = selectedGroupId === groupId;
  const isRowDimmed = selectedGroupId !== null && !isSelected;

  function toggleGroup() {
    setSelectedGroupId(prev => prev === groupId ? null : groupId);
  }

  return (
    <div className={`sidebar-row${isRowDimmed ? ' sidebar-row--dimmed' : ''}`}>
      <div
        className={`sidebar-bubble-trigger${isSelected ? ' sidebar-bubble-trigger--selected' : ''}`}
        onClick={toggleGroup}
      >
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
      </div>
      <div className="sidebar-tasks">
        {tasks.map(task => {
          const override = scheduledOverrides.get(task.id);
          const isScheduled = override !== undefined ? override : task.scheduled_date !== null;
          const chipDimmed = selectedGroupId !== null && !isSelected;
          const chipHighlighted = isSelected;
          return isScheduled
            ? (
              <ContextMenu key={task.id}>
                <ContextMenuTrigger asChild>
                  <div>
                    <TaskChip task={task} scheduled dimmed={chipDimmed} highlighted={chipHighlighted} />
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

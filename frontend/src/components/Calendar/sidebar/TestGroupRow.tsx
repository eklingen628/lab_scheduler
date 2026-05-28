import { useContext, memo } from 'react';
import TestGroupBubble from './TestGroupBubble';
import type { SampleTest, Task } from '../../types';
import './Sidebar.css';
import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuTrigger } from '@/components/ui/context-menu';
import { CalendarContext } from '../context/CalendarContext';
import DraggableTaskChip from '../chips/DraggableTaskChip';
import TaskChip from '../chips/TaskChip';

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
  const { onEditTask, goToPersonDate, selectedGroupId, setSelectedGroupId, people } = useContext(CalendarContext);
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
          const person = task.person_id != null ? people.find(p => p.id === task.person_id) : null;
          return (
            <div key={task.id} className="sidebar-task-row">
              <div className="sidebar-task-schedule-info">
                {isScheduled && task.scheduled_date ? (
                  <>
                    <span className="sidebar-task-date">{task.scheduled_date}</span>
                    {person && <span className="sidebar-task-person">{person.first_name} {person.last_name}</span>}
                  </>
                ) : (
                  <span className="sidebar-task-unscheduled">Unscheduled</span>
                )}
              </div>
              {isScheduled
                ? (
                  <ContextMenu>
                    <ContextMenuTrigger asChild>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <TaskChip task={task} scheduled dimmed={chipDimmed} highlighted={chipHighlighted} />
                      </div>
                    </ContextMenuTrigger>
                    <ContextMenuContent>
                      <ContextMenuItem onClick={() => onEditTask(task)}>Edit</ContextMenuItem>
                      {task.person_id && task.scheduled_date && (
                        <ContextMenuItem onClick={() => goToPersonDate(task.person_id!, task.scheduled_date!)}>View on Calendar</ContextMenuItem>
                      )}
                    </ContextMenuContent>
                  </ContextMenu>
                )
                : <div style={{ flex: 1, minWidth: 0 }}><DraggableTaskChip task={task} /></div>}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default memo(TestGroupRow)

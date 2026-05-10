import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { X } from 'lucide-react';
import type { Person, Task, SampleTest } from '../types';
import SortableDayViewTask from './SortableDayViewTask';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

interface Props {
  person: Person | null;
  date: string | null;
  tasks: Task[];
  sampleTestsByGroup: Map<number, SampleTest[]>;
  onEditTask: (task: Task) => void;
  onAddTask: () => void;
  setPerson: (value: React.SetStateAction<Person | null>) => void;
  setCurrentDate: (value: React.SetStateAction<string | null>) => void;
}

function formatDate(iso: string): string {
  const d = new Date(iso + 'T00:00:00');
  return d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
}

export default function DayView({ person, date, tasks, sampleTestsByGroup, onEditTask, onAddTask, setPerson, setCurrentDate }: Props) {
  const active = person !== null && date !== null;

  const { setNodeRef } = useDroppable({
    id: active ? `dayview|${person.id}|${date}` : 'dayview|empty',
    disabled: !active,
  });

  const personDateTasks = active
    ? tasks.filter(task => task.person_id === person.id && task.scheduled_date === date)
    : [];

  return (
    <Card className="day-view-panel" ref={setNodeRef}>
      <CardHeader className="day-view-header">
        <div className="day-view-header-top">
          <div className="day-view-header-text">
            {active ? (
              <>
                <span className="day-view-person">{person.first_name} {person.last_name}</span>
                <span className="day-view-date">{formatDate(date)}</span>
              </>
            ) : (
              <span className="day-view-person">Day View</span>
            )}
          </div>
          <div className="day-view-header-actions">
            <Button variant="outline" size="sm" onClick={onAddTask}>+ Add Task</Button>
            {active && (
              <Button variant="ghost" size="icon-sm" onClick={() => { setCurrentDate(null); setPerson(null); }}>
                <X />
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {active ? (
          <SortableContext items={personDateTasks.map(t => `dayview-task-${t.id}`)} strategy={verticalListSortingStrategy}>
            {personDateTasks.map(task => (
              <SortableDayViewTask
                key={task.id}
                task={task}
                sampleTests={sampleTestsByGroup.get(task.sample_test_group_id) ?? []}
                onEdit={() => onEditTask(task)}
              />
            ))}
          </SortableContext>
        ) : (
          <p className="day-view-empty">Double-click a cell to view the day.</p>
        )}
      </CardContent>
    </Card>
  );
}

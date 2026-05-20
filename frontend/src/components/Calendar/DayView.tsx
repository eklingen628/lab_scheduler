import { useContext } from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { X } from 'lucide-react';
import type { Task, SampleTest } from '../types';
import SortableDayViewTask from './SortableDayViewTask';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { CalendarContext } from './CalendarContext';

interface Props {
  sampleTestsByGroup: Map<number, SampleTest[]>;
  onEditTask: (task: Task) => void;
  onAddTask: () => void;
}

function formatDate(iso: string): string {
  const d = new Date(iso + 'T00:00:00');
  return d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
}

export default function DayView({ sampleTestsByGroup, onEditTask, onAddTask }: Props) {
  const { dayViewPerson, dayViewDate, tasks, setDayViewPerson, setDayViewDate } = useContext(CalendarContext);
  const active = dayViewPerson !== null && dayViewDate !== null;

  const { setNodeRef } = useDroppable({
    id: active ? `dayview|${dayViewPerson.id}|${dayViewDate}` : 'dayview|empty',
    disabled: !active,
  });

  const personDateTasks = active
    ? tasks.filter(task => task.person_id === dayViewPerson.id && task.scheduled_date === dayViewDate)
    : [];

  return (
    <Card className="day-view-panel" ref={setNodeRef}>
      <CardHeader className="day-view-header">
        <div className="day-view-header-top">
          <div className="day-view-header-text">
            {active ? (
              <>
                <span className="day-view-person">{dayViewPerson.first_name} {dayViewPerson.last_name}</span>
                <span className="day-view-date">{formatDate(dayViewDate)}</span>
              </>
            ) : (
              <span className="day-view-person">Day View</span>
            )}
          </div>
          <div className="day-view-header-actions">
            <Button variant="outline" size="sm" onClick={onAddTask}>+ Add Task</Button>
            {active && (
              <Button variant="ghost" size="icon-sm" onClick={() => { setDayViewDate(null); setDayViewPerson(null); }}>
                <X />
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="day-view-content">
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

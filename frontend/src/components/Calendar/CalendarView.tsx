import { useState, useEffect } from 'react';
import { DndContext, DragOverlay, closestCenter } from '@dnd-kit/core';
import type { DragStartEvent, DragEndEvent, DragOverEvent } from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';
import type { Person, Task } from './types';
import CalendarGrid from './CalendarGrid';
import TaskChip from './TaskChip';
import { get, patch } from '../../api';
import './Calendar.css';

function getWeekDates(): string[] {
  const today = new Date();
  const day = today.getDay();
  const monday = new Date(today);
  monday.setDate(today.getDate() - (day === 0 ? 6 : day - 1));
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return d.toISOString().slice(0, 10);
  });
}

const DATES = getWeekDates();

function computePositions(tasks: Task[]): Map<number, number> {
  const counters = new Map<string, number>();
  const result = new Map<number, number>();
  for (const task of tasks) {
    const key = `${task.person_id}|${task.scheduled_date}`;
    const pos = counters.get(key) ?? 0;
    result.set(task.id, pos);
    counters.set(key, pos + 1);
  }
  return result;
}

export default function CalendarView() {
  const [people, setPeople] = useState<Person[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [tasksBeforeDrag, setTasksBeforeDrag] = useState<Task[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [activeTaskId, setActiveTaskId] = useState<number | null>(null);

  useEffect(() => {
    async function fetchData() {
      const [peopleData, tasksData] = await Promise.all([
        get('/people'),
        get(`/tasks?start=${DATES[0]}&end=${DATES[6]}`),
      ]);
      if (!peopleData || !tasksData) {
        setError(true);
      } else {
        setPeople(peopleData);
        setTasks(tasksData);
      }
      setLoading(false);
    }
    fetchData();
  }, []);

  const activeTask = tasks.find(t => t.id === activeTaskId) ?? null;

  function handleDragStart(event: DragStartEvent) {
    setActiveTaskId(Number(event.active.id));
    setTasksBeforeDrag(tasks);
  }

  function handleDragCancel() {
    setActiveTaskId(null);
    if (tasksBeforeDrag) {
      setTasks(tasksBeforeDrag);
      setTasksBeforeDrag(null);
    }
  }

  function handleDragOver(event: DragOverEvent) {
    const { active, over } = event;
    if (!over) return;

    const activeId = Number(active.id);
    const overId = over.id;

    setTasks(prev => {
      const activeIdx = prev.findIndex(t => t.id === activeId);
      if (activeIdx === -1) return prev;
      const activeTask = prev[activeIdx];

      let overPersonId: number;
      let overDate: string;

      if (typeof overId === 'string' && overId.startsWith('cell|')) {
        const [, personIdStr, date] = overId.split('|');
        overPersonId = Number(personIdStr);
        overDate = date;
      } else {
        const overTask = prev.find(t => t.id === Number(overId));
        if (!overTask) return prev;
        overPersonId = overTask.person_id;
        overDate = overTask.scheduled_date;
      }

      const crossCell =
        activeTask.person_id !== overPersonId || activeTask.scheduled_date !== overDate;

      let next = crossCell
        ? prev.map(t =>
            t.id === activeId
              ? { ...t, person_id: overPersonId, scheduled_date: overDate }
              : t
          )
        : [...prev];

      // If hovering over a task chip (not just the cell background), reorder
      if (typeof overId !== 'string' || !overId.startsWith('cell|')) {
        const newActiveIdx = next.findIndex(t => t.id === activeId);
        const overIdx = next.findIndex(t => t.id === Number(overId));
        if (newActiveIdx !== overIdx) {
          return arrayMove(next, newActiveIdx, overIdx);
        }
      }

      return next;
    });
  }

  async function handleDragEnd(event: DragEndEvent) {
    setActiveTaskId(null);
    const before = tasksBeforeDrag;
    setTasksBeforeDrag(null);
    if (!before) return;

    const afterPositions = computePositions(tasks);
    const beforePositions = computePositions(before);

    const changed = tasks.filter(task => {
      const prev = before.find(t => t.id === task.id);
      if (!prev) return false;
      return (
        task.person_id !== prev.person_id ||
        task.scheduled_date !== prev.scheduled_date ||
        afterPositions.get(task.id) !== beforePositions.get(task.id)
      );
    });

    if (changed.length === 0) return;

    const results = await Promise.all(
      changed.map(task =>
        patch(`/tasks/${task.id}`, {
          person_id: task.person_id,
          scheduled_date: task.scheduled_date,
          position: afterPositions.get(task.id),
        })
      )
    );

    if (results.some(r => !r)) {
      setTasks(before);
    }
  }

  if (loading) return <div className="calendar-view">Loading...</div>;
  if (error) return <div className="calendar-view">Failed to load tasks.</div>;

  return (
    <div className="calendar-view">
      <h2>Week of {DATES[0]}</h2>
      <DndContext
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
        onDragCancel={handleDragCancel}
      >
        <CalendarGrid people={people} dates={DATES} tasks={tasks} />
        <DragOverlay>
          {activeTask ? <TaskChip task={activeTask} isDragOverlay /> : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
}

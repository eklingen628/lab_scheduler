import { useState, useEffect } from 'react';
import { DndContext, DragOverlay, closestCenter, pointerWithin } from '@dnd-kit/core';
import type { DragStartEvent, DragEndEvent, DragOverEvent, CollisionDetection } from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';
import type { Person, Task } from './components/types';
import CalendarView from './components/Calendar/CalendarView';
import TaskChip from './components/Calendar/TaskChip';
import Sidebar from './components/SideBar/Sidebar';
import { get, patch } from './api';
import './App.css';

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

const DATES = getWeekDates();

const collisionDetection: CollisionDetection = (args) => {
  // Use pointer position for the sidebar so it registers the moment the pointer
  // enters it, regardless of drag origin. Fall back to closestCenter for the calendar.
  const sidebarHit = pointerWithin(args).find(c => c.id === 'sidebar');
  if (sidebarHit) return [sidebarHit];
  return closestCenter(args);
};

export default function App() {
  const [people, setPeople] = useState<Person[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [tasksBeforeDrag, setTasksBeforeDrag] = useState<Task[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  // Tracks schedule-state changes made this session so the sidebar stays in sync.
  // true  = task was scheduled (sidebar→calendar)
  // false = task was unscheduled (calendar→sidebar)
  const [scheduledOverrides, setScheduledOverrides] = useState<Map<number, boolean>>(new Map());

  useEffect(() => {
    async function fetchData() {
      try {
        const [peopleData, tasksData] = await Promise.all([
          get('/people'),
          get(`/tasks?start=${DATES[0]}&end=${DATES[6]}`),
        ]);
        setPeople(peopleData);
        setTasks(tasksData);
      } catch {
        setError(true);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  function handleDragStart(event: DragStartEvent) {
    const source = event.active.data.current?.source;
    if (source === 'sidebar') {
      setActiveTask(event.active.data.current?.task as Task);
    } else {
      setActiveTask(tasks.find(t => t.id === Number(event.active.id)) ?? null);
    }
    setTasksBeforeDrag(tasks);
  }

  function handleDragCancel() {
    setActiveTask(null);
    if (tasksBeforeDrag) {
      setTasks(tasksBeforeDrag);
      setTasksBeforeDrag(null);
    }
  }

  function handleDragOver(event: DragOverEvent) {
    if (event.active.data.current?.source === 'sidebar') return;

    const { active, over } = event;
    if (!over) return;

    const activeId = Number(active.id);
    const overId = over.id;

    // Hovering over the sidebar — don't preview any move
    if (overId === 'sidebar') return;

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
        if (!overTask || overTask.person_id === null || overTask.scheduled_date === null) return prev;
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
    setActiveTask(null);
    const before = tasksBeforeDrag;
    setTasksBeforeDrag(null);

    const source = event.active.data.current?.source;

    if (source === 'sidebar') {
      const task = event.active.data.current?.task as Task | undefined;
      const over = event.over;
      if (!task || !over) return;

      const overId = over.id;
      let personId: number;
      let date: string;

      if (typeof overId === 'string' && overId.startsWith('cell|')) {
        const [, personIdStr, dateStr] = overId.split('|');
        personId = Number(personIdStr);
        date = dateStr;
      } else {
        const overTask = tasks.find(t => t.id === Number(overId));
        if (!overTask || overTask.person_id === null || overTask.scheduled_date === null) return;
        personId = overTask.person_id;
        date = overTask.scheduled_date;
      }

      const position = tasks.filter(
        t => t.person_id === personId && t.scheduled_date === date
      ).length;

      try {
        await patch(`/tasks/${task.id}`, { person_id: personId, scheduled_date: date, position });
        const updated: Task = { ...task, person_id: personId, scheduled_date: date, position };
        setTasks(prev => {
          const idx = prev.findIndex(t => t.id === task.id);
          return idx !== -1
            ? prev.map(t => (t.id === task.id ? updated : t))
            : [...prev, updated];
        });
        setScheduledOverrides(prev => new Map(prev).set(task.id, true));
      } catch {
        // server error — no optimistic state to revert
      }
      return;
    }

    // Calendar-internal drag (or calendar→sidebar)
    if (!before) return;

    const overId = event.over?.id;

    if (overId === 'sidebar') {
      const taskId = Number(event.active.id);
      try {
        await patch(`/tasks/${taskId}`, { person_id: null, scheduled_date: null, position: null });
        setTasks(before.filter(t => t.id !== taskId));
        setScheduledOverrides(prev => new Map(prev).set(taskId, false));
      } catch {
        setTasks(before);
      }
      return;
    }

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

  if (loading) return <div className="app-layout" style={{ padding: '2rem' }}>Loading...</div>;
  if (error) return <div className="app-layout" style={{ padding: '2rem' }}>Failed to load data.</div>;

  return (
    <div className="app-layout">
      <DndContext
        collisionDetection={collisionDetection}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
        onDragCancel={handleDragCancel}
      >
        <Sidebar scheduledOverrides={scheduledOverrides} />
        <CalendarView people={people} tasks={tasks} dates={DATES} />
        <DragOverlay dropAnimation={null}>
          {activeTask ? <TaskChip task={activeTask} isDragOverlay /> : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
}

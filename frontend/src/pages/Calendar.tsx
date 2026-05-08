import { useState, useEffect } from 'react';
import { DndContext, DragOverlay, closestCenter, pointerWithin } from '@dnd-kit/core';
import type { DragStartEvent, DragEndEvent, DragOverEvent, CollisionDetection, Modifier } from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';
import type { Person, Task } from '../components/types';
import CalendarView from '../components/Calendar/CalendarView';
import TaskChip from '../components/Calendar/TaskChip';
import DayViewTask from '../components/Calendar/DayViewTask';
import Sidebar from '../components/SideBar/Sidebar';
import { get, patch } from '../api';
import DayView from '@/components/Calendar/DayView';

function localDateStr(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function getWeekDates(offset = 0): string[] {
  const today = new Date();
  const day = today.getDay();
  const monday = new Date(today);
  monday.setDate(today.getDate() - (day === 0 ? 6 : day - 1) + offset * 7);
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return localDateStr(d);
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

const dayviewVerticalOnly: Modifier = ({ transform, active }) => {
  if (active?.data?.current?.source === 'dayview') {
    return { ...transform, x: 0 };
  }
  return transform;
};

const collisionDetection: CollisionDetection = (args) => {
  if (args.active?.data?.current?.source === 'dayview') {
    const filtered = {
      ...args,
      droppableContainers: args.droppableContainers.filter(
        c => typeof c.id !== 'string' || (!c.id.startsWith('cell|') && c.id !== 'sidebar')
      ),
    };
    return closestCenter(filtered);
  }
  const sidebarHit = pointerWithin(args).find(c => c.id === 'sidebar');
  if (sidebarHit) return [sidebarHit];
  return closestCenter(args);
};

export default function Calendar() {
  const [weekOffset, setWeekOffset] = useState(0);
  const dates = getWeekDates(weekOffset);
  const [people, setPeople] = useState<Person[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [tasksBeforeDrag, setTasksBeforeDrag] = useState<Task[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [activeSource, setActiveSource] = useState<string | null>(null);
  const [scheduledOverrides, setScheduledOverrides] = useState<Map<number, boolean>>(new Map());

  const [currentDate, setCurrentDate] = useState<string | null>(null)
  const [person, setPerson] = useState<Person | null>(null)

  useEffect(() => {
    setLoading(true);
    setError(false);
    setScheduledOverrides(new Map());
    async function fetchData() {
      try {
        const [peopleData, tasksData] = await Promise.all([
          get('/people'),
          get(`/tasks?start=${dates[0]}&end=${dates[6]}`),
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
  }, [weekOffset]); // eslint-disable-line react-hooks/exhaustive-deps

  function handleDragStart(event: DragStartEvent) {
    const source = event.active.data.current?.source;
    setActiveSource(source ?? null);
    if (source === 'sidebar') {
      setActiveTask(event.active.data.current?.task as Task);
    } else if (source === 'dayview') {
      setActiveTask(tasks.find(t => t.id === event.active.data.current?.taskId) ?? null);
    } else {
      setActiveTask(tasks.find(t => t.id === Number(event.active.id)) ?? null);
    }
    setTasksBeforeDrag(tasks);
  }

  function handleDragCancel() {
    setActiveTask(null);
    setActiveSource(null);
    if (tasksBeforeDrag) {
      setTasks(tasksBeforeDrag);
      setTasksBeforeDrag(null);
    }
  }

  function handleDragOver(event: DragOverEvent) {
    const source = event.active.data.current?.source;
    if (source === 'sidebar') return;

    const { active, over } = event;
    if (!over) return;

    const activeId = Number(active.id);
    const overId = over.id;

    if (overId === 'sidebar') return;

    if (source === 'dayview') {
      if (typeof overId === 'string' && overId.startsWith('cell|')) return;
      const realActiveId = event.active.data.current?.taskId as number;
      const realOverId = typeof overId === 'string' && overId.startsWith('dayview-task-')
        ? parseInt(overId.replace('dayview-task-', ''), 10)
        : Number(overId);
      setTasks(prev => {
        const activeIdx = prev.findIndex(t => t.id === realActiveId);
        const overIdx = prev.findIndex(t => t.id === realOverId);
        if (activeIdx === -1 || overIdx === -1 || activeIdx === overIdx) return prev;
        const a = prev[activeIdx];
        const o = prev[overIdx];
        if (a.person_id !== o.person_id || a.scheduled_date !== o.scheduled_date) return prev;
        return arrayMove(prev, activeIdx, overIdx);
      });
      return;
    }

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
    setActiveSource(null);
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

  return (
    <div className="app-layout">
      <DndContext
        collisionDetection={collisionDetection}
        modifiers={[dayviewVerticalOnly]}
        autoScroll={activeSource !== 'dayview'}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
        onDragCancel={handleDragCancel}
      >
        <Sidebar scheduledOverrides={scheduledOverrides} />
        <CalendarView
          people={people}
          tasks={tasks}
          dates={dates}
          loading={loading}
          error={error}
          isCurrentWeek={weekOffset === 0}
          selectedPersonId={person?.id ?? null}
          selectedDate={currentDate}
          onPrev={() => setWeekOffset(o => o - 1)}
          onNext={() => setWeekOffset(o => o + 1)}
          onToday={() => setWeekOffset(0)}
          setPerson={setPerson}
          setCurrentDate={setCurrentDate}
        /> 
        <DayView
          person={person}
          date={currentDate}
          tasks={tasks}
          setPerson={setPerson}
          setCurrentDate={setCurrentDate}
        />
        <DragOverlay dropAnimation={null}>
          {activeTask
            ? activeSource === 'dayview'
              ? <DayViewTask task={activeTask} isDragOverlay />
              : <TaskChip task={activeTask} isDragOverlay />
            : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
}

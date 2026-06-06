import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { DndContext, DragOverlay, closestCenter, pointerWithin } from '@dnd-kit/core';
import type { DragStartEvent, DragEndEvent, DragOverEvent, CollisionDetection, Modifier } from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';
import type { Person, Task, SampleTest, SampleTestGroup } from '../components/types';
import CalendarView from '../components/Calendar/CalendarView';
import TaskChip from '@/components/Calendar/chips/TaskChip';
import DayViewTask from '@/components/Calendar/dayview/DayViewTask';
import Sidebar from '../components/Calendar/sidebar/Sidebar';
import { get, patch } from '../api';
import DayView from '@/components/Calendar/dayview/DayView';
import TaskEditModal from '@/components/Calendar/modals/TaskEditModal';
import { CalendarContext } from '@/components/Calendar/context/CalendarContext';
import { TaskEditContext } from '@/components/Calendar/context/TaskEditContext';
import { getMonday, getWeekDates } from '@/components/utils';
import { useSearchParams } from 'react-router';





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


export default function Calendar() {
  const [weekOffset, setWeekOffset] = useState(0);
  const dates = getWeekDates(getMonday(new Date()), weekOffset);
  const [people, setPeople] = useState<Person[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [tasksBeforeDrag, setTasksBeforeDrag] = useState<Task[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [activeSource, setActiveSource] = useState<string | null>(null);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [scheduledOverrides, setScheduledOverrides] = useState<Map<number, boolean>>(new Map());
  const [groupData, setGroupData] = useState<SampleTestGroup[] | null>(null)
  const [groupDataError, setGroupDataError] = useState(false);

  const [dayViewDate, setDayViewDate] = useState<string | null>(null)
  const [dayViewPerson, setDayViewPerson] = useState<Person | null>(null)
  const [sampleTestsByGroup, setSampleTestsByGroup] = useState<Map<number, SampleTest[]>>(new Map())
  const [personFilter, setPersonFilter] = useState<Set<number> | null>(null)
  const [personSort, setPersonSort] = useState<'asc' | 'desc' | null>(null)
  const [selectedGroupId, setSelectedGroupId] = useState<number | null>(null)

  const [searchParams, setSearchParams] = useSearchParams()
  const searchParamPerson = searchParams.get('person');
  const searchParamDate = searchParams.get('date');
  const handledSearchParams = useRef(false);
  const [viewMode, setViewMode] = useState<'compact' | 'expanded'>('compact');

  useEffect(() => {
    if (!handledSearchParams.current && searchParamPerson && searchParamDate && people.length > 0) {
      handledSearchParams.current = true;
      goToPersonDate(Number(searchParamPerson), searchParamDate);
      setSearchParams({}, { replace: true })
    }
  }, [people]);



  async function fetchGroups() {
    try {
      const groups: SampleTestGroup[] = await get('/sample-test-groups/with-tasks');
      setSampleTestsByGroup(new Map(groups.map(g => [g.id, g.sample_tests])));
      setGroupData(groups);

    } catch {
      setGroupDataError(true)
    }
  }


  useEffect(() => {
    fetchGroups();
  }, []);

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

  const taskMap = useMemo(
    () => {
      const map: Record<number, Record<string, Task[]>> = {}
      tasks.forEach(task => {
        if (task.person_id && task.scheduled_date) {
          if (!(task.person_id in map))
            map[task.person_id] = {};
          if (!(task.scheduled_date in map[task.person_id]))
            map[task.person_id][task.scheduled_date] = []
          map[task.person_id][task.scheduled_date].push(task)
        }

      })
      return map;
    }, [tasks])

  const taskMapRef = useRef(taskMap);
  taskMapRef.current = taskMap;
  const dragSourceCellRef = useRef<string | null>(null);

  const collisionDetection = useCallback<CollisionDetection>((args) => {
    if (args.active?.data?.current?.source === 'dayview') {
      return closestCenter({
        ...args,
        droppableContainers: args.droppableContainers.filter(
          c => typeof c.id !== 'string' || (!c.id.startsWith('cell|') && c.id !== 'sidebar')
        ),
      });
    }
    const sidebarHit = pointerWithin(args).find(c => c.id === 'sidebar');
    if (sidebarHit) return [sidebarHit];

    const sourceCell = dragSourceCellRef.current;
    let sourceCellTaskIds = new Set<number>();
    if (sourceCell) {
      const [personIdStr, cellDate] = sourceCell.split('|');
      const cellTasks = taskMapRef.current[Number(personIdStr)]?.[cellDate] ?? [];
      sourceCellTaskIds = new Set(cellTasks.map(t => t.id));
    }

    const allowed = args.droppableContainers.filter(c => {
      if (typeof c.id === 'string' && c.id.startsWith('cell|')) return true;
      return typeof c.id === 'number' && sourceCellTaskIds.has(c.id);
    });

    const within = pointerWithin({ ...args, droppableContainers: allowed });
    if (within.length > 0) return within;
    return closestCenter({ ...args, droppableContainers: allowed });
  }, []);

  function handleDragStart(event: DragStartEvent) {
    const source = event.active.data.current?.source;
    setActiveSource(source ?? null);
    if (source === 'sidebar') {
      setActiveTask(event.active.data.current?.task as Task);
    } else if (source === 'dayview') {
      setActiveTask(tasks.find(t => t.id === event.active.data.current?.taskId) ?? null);
    } else {
      const taskId = Number(event.active.id);
      const task = tasks.find(t => t.id === taskId);
      setActiveTask(task ?? null);
      if (task?.person_id && task?.scheduled_date) {
        dragSourceCellRef.current = `${task.person_id}|${task.scheduled_date}`;
      }
    }
    setTasksBeforeDrag(tasks);
  }

  function handleDragCancel() {
    setActiveTask(null);
    setActiveSource(null);
    dragSourceCellRef.current = null;
    if (tasksBeforeDrag) {
      setTasks(tasksBeforeDrag);
      setTasksBeforeDrag(null);
    }
  }

  function handleDragOver(event: DragOverEvent) {
    const source = event.active.data.current?.source;
    if (source === 'sidebar') return;

    const { over } = event;
    if (!over) return;

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

  }

  async function handleDragEnd(event: DragEndEvent) {
    setActiveTask(null);
    setActiveSource(null);
    const before = tasksBeforeDrag;
    setTasksBeforeDrag(null);
    dragSourceCellRef.current = null;

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
        fetchGroups();
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
        fetchGroups();
      } catch {
        setTasks(before);
      }
      return;
    }

    if (source === 'dayview') {
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
      if (results.some(r => !r)) setTasks(before);
      else fetchGroups();
      return;
    }

    // Calendar grid: same-cell reorder (dropped on a chip)
    const activeId = Number(event.active.id);
    if (typeof overId === 'number') {
      const activeIdx = before.findIndex(t => t.id === activeId);
      const overIdx = before.findIndex(t => t.id === overId);
      if (activeIdx === -1 || overIdx === -1 || activeIdx === overIdx) return;
      const finalTasks = arrayMove(before, activeIdx, overIdx);
      const afterPositions = computePositions(finalTasks);
      const beforePositions = computePositions(before);
      const changed = finalTasks.filter(task => {
        const prev = before.find(t => t.id === task.id);
        if (!prev) return false;
        return afterPositions.get(task.id) !== beforePositions.get(task.id);
      });
      if (changed.length === 0) return;
      const results = await Promise.all(
        changed.map(task => patch(`/tasks/${task.id}`, { position: afterPositions.get(task.id) }))
      );
      if (results.some(r => !r)) setTasks(before);
      else { setTasks(finalTasks); fetchGroups(); }
      return;
    }

    // Calendar grid: cross-cell move (dropped on a cell droppable)
    let overPersonId: number;
    let overDate: string;

    if (typeof overId !== 'string' || !overId.startsWith('cell|')) return;
    const [, personIdStr, date] = overId.split('|');
    overPersonId = Number(personIdStr);
    overDate = date;

    const movedTask = { ...before.find(t => t.id === activeId)!, person_id: overPersonId, scheduled_date: overDate };
    const finalTasks = [...before.filter(t => t.id !== activeId), movedTask];

    const afterPositions = computePositions(finalTasks);
    const beforePositions = computePositions(before);

    const changed = finalTasks.filter(task => {
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
    } else {
      setTasks(finalTasks);
      fetchGroups();
    }
  }

  function openEditModal(task: Task) {
    setEditingTask(task);
    setModalOpen(true);
  }

  function openCreateModal() {
    setEditingTask(null);
    setModalOpen(true);
  }

  function closeModal() {
    setModalOpen(false);
    setEditingTask(null);
  }

  async function handleSavedTask(saved: Task) {
    const updatedTasks = tasks.findIndex(t => t.id === saved.id) !== -1
      ? tasks.map(t => t.id === saved.id ? saved : t)
      : [...tasks, saved];
    setTasks(updatedTasks);

    if (saved.person_id && saved.scheduled_date) {
      const cellTasks = updatedTasks.filter(t => t.person_id === saved.person_id && t.scheduled_date === saved.scheduled_date);
      const positions = computePositions(cellTasks);
      await Promise.all(cellTasks.map(t => patch(`/tasks/${t.id}`, { position: positions.get(t.id) })));
    }
    fetchGroups();
    closeModal();
  }

  function handleUnscheduledTask(taskId: number) {
    setTasks(prev => prev.filter(t => t.id !== taskId));
    setScheduledOverrides(prev => new Map(prev).set(taskId, false));
    fetchGroups();
    closeModal();
  }


  function goToPersonDate(person_id: number, date: string) {
    const person = people.find(p => p.id === person_id);
    if (!person) return;

    const toMonday = getMonday(new Date(date + 'T00:00:00'));
    const currMonday = getMonday(new Date());
    const delta = (toMonday.getTime() - currMonday.getTime()) / 86400000;
    const offset = Math.round(delta / 7);
    
    setWeekOffset(offset);
    setDayViewPerson(person);
    setDayViewDate(date);
  }





  return (
    <CalendarContext.Provider value={{
      setDayViewPerson,
      setDayViewDate,
      onEditTask: openEditModal,
      people,
      goToPersonDate,
      personFilter,
      setPersonFilter,
      personSort,
      setPersonSort,
      selectedGroupId,
      setSelectedGroupId,
      tasks,
      taskMap,
      dates,
      dayViewPerson,
      dayViewDate,
      sampleTestsByGroup,
      viewMode,
      setViewMode,
      openCreateModal,
    }}>

    
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

          <Sidebar scheduledOverrides={scheduledOverrides} groupData={groupData} groupDataError={groupDataError} />
          <CalendarView
            loading={loading}
            error={error}
            isCurrentWeek={weekOffset === 0}
            onPrev={() => setWeekOffset(o => o - 1)}
            onNext={() => setWeekOffset(o => o + 1)}
            onToday={() => setWeekOffset(0)}
          />
          {viewMode === 'compact' && <DayView />}
          <DragOverlay dropAnimation={null}>
            {activeTask
              ? activeSource === 'dayview'
                ? <DayViewTask task={activeTask} isDragOverlay />
                : <TaskChip task={activeTask} isDragOverlay />
              : null}
          </DragOverlay>
        </DndContext>
        <TaskEditContext.Provider value={{ people, sampleTestsByGroup }}>
          <TaskEditModal
            task={editingTask}
            open={modalOpen}
            initialPersonId={dayViewPerson?.id ?? null}
            initialDate={dayViewDate}
            onClose={closeModal}
            onSaved={handleSavedTask}
            onUnscheduled={handleUnscheduledTask}
          />
        </TaskEditContext.Provider>
      </div>
    </CalendarContext.Provider>
  );
}

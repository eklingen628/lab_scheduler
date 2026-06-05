import { useEffect, useState } from 'react';
import { get, post, del, unscheduleTask } from '../api';
import type { Person, SampleTest, SampleTestGroup, Task } from '../components/types';
import CreateGroupModal from '../components/StagingArea/CreateGroupModal';
import TaskEditModal from '@/components/Calendar/modals/TaskEditModal';
import { TaskEditContext } from '@/components/Calendar/context/TaskEditContext';
import GroupsPane from '@/components/StagingArea/GroupsPane';
import FlatTestsPane from '@/components/StagingArea/FlatTestsPane';
import UnassignedPane from '@/components/StagingArea/UnassignedPane';
import Toolbar from '@/components/StagingArea/Toolbar';
import SplitContainer from '@/components/StagingArea/SplitContainer';
import { usePersistedState } from '@/components/StagingArea/usePersistedState';
import '../components/StagingArea/StagingArea.css';
import { StagingAreaContext } from '@/components/StagingArea/StangingAreaContext';

export type PaneMode = 'grouped' | 'flat';

export default function StagingArea() {
  const [tests, setTests]   = useState<SampleTest[]>([]);
  const [groups, setGroups] = useState<SampleTestGroup[]>([]);
  const [showModal, setShowModal]   = useState(false);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState(false);
  const [selectedTestsToAdd, setSelectedTestsToAdd] = useState<Set<number>>(new Set());
  const [adding, setAdding] = useState(false);
  const [people, setPeople] = useState<Person[]>([]);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  const [paneMode, setPaneMode] = usePersistedState<PaneMode>(
    'testScheduler.paneMode', 'grouped'
  );
  const [splitRatio, setSplitRatio] = usePersistedState(
    'testScheduler.splitRatio', 0.5
  );

  useEffect(() => { fetchData(); }, []);

  async function fetchData() {
    try {
      const [testsData, groupsData, peopleData] = await Promise.all([
        get('/sample-tests'),
        get('/sample-test-groups/with-tasks'),
        get('/people'),
      ]);
      setTests(testsData);
      setGroups(groupsData);
      setPeople(peopleData);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }

  async function refresh() {
    const [testsData, groupsData] = await Promise.all([
      get('/sample-tests'),
      get('/sample-test-groups/with-tasks'),
    ]);
    setTests(testsData);
    setGroups(groupsData);
  }

  async function handleCreateGroupWithTests(templateIds: number[]) {
    if (selectedTestsToAdd.size === 0) return;
    await post('/sample-test-groups', {
      template_ids: templateIds,
      sample_test_ids: [...selectedTestsToAdd],
    });
    await refresh();
    setSelectedTestsToAdd(new Set());
    setShowModal(false);
  }

  function toggleSelect(id: number) {
    setSelectedTestsToAdd(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  async function handleAdd(groupId: number) {
    if (selectedTestsToAdd.size === 0) return;
    setAdding(true);
    try {
      await Promise.all(
        [...selectedTestsToAdd].map(id => post(`/sample-test-groups/${groupId}/samples/${id}`))
      );
      await refresh();
      setSelectedTestsToAdd(new Set());
    } finally {
      setAdding(false);
    }
  }

  async function handleRemove(testId: number) {
    await del(`/sample-test-groups/samples/${testId}`);
    await refresh();
  }

  async function handleDeleteGroup(groupId: number) {
    await del(`/sample-test-groups/${groupId}`);
    await refresh();
  }

  async function handleUnschedule(taskId: number) {
    await unscheduleTask(taskId)
    await refresh();
  }

  if (loading) return <div className="staging-page" style={{ padding: '2rem' }}>Loading...</div>;
  if (error)   return <div className="staging-page" style={{ padding: '2rem' }}>Failed to load data.</div>;

  return (
    <StagingAreaContext.Provider value={{
      tests,
      groups,
      selectedTestsToAdd,
      adding,
      showModal,
      loading,
      error,
      people,
      refresh,
      toggleSelect,
      handleAdd,
      handleRemove,
      handleDeleteGroup,
      handleUnschedule,
      handleCreateGroupWithTests,
      setShowModal,
      setSelectedTestsToAdd,
      editingTask,
      setEditingTask,
    }}>
      <div className="staging-page">
        <Toolbar paneMode={paneMode} setPaneMode={setPaneMode} />
        {paneMode === 'grouped' ? (
          <SplitContainer
            orientation="horizontal"
            ratio={splitRatio}
            onRatioChange={setSplitRatio}
          >
            <UnassignedPane />
            <GroupsPane />
          </SplitContainer>
        ) : (
          <div className="staging-layout">
            <div className="staging-layout__collapsed-strip">
              <span>Switch to Grouped view to add tests</span>
            </div>
            <FlatTestsPane />
          </div>
        )}
        {showModal && <CreateGroupModal />}
        <TaskEditContext.Provider value={{
          people,
          sampleTestsByGroup: new Map(groups.map(g => [g.id, g.sample_tests])),
        }}>
          <TaskEditModal
            task={editingTask}
            open={editingTask !== null}
            onClose={() => setEditingTask(null)}
            onSaved={() => { setEditingTask(null); refresh(); }}
            onUnscheduled={() => { setEditingTask(null); refresh(); }}
          />
        </TaskEditContext.Provider>
      </div>
    </StagingAreaContext.Provider>
  );
}

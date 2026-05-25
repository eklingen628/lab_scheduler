import { useEffect, useState } from 'react';
import { get, post, del, patch } from '../api';
import type { SampleTest, SampleTestGroup } from '../components/types';
import CreateGroupModal from '../components/StagingArea/CreateGroupModal';
import TestPool from '../components/StagingArea/TestPool';
import GroupList from '@/components/StagingArea/GroupList';
import '../components/StagingArea/StagingArea.css';
import { StagingAreaContext } from '@/components/StagingArea/StangingAreaContext';

export default function StagingArea() {
  const [tests, setTests] = useState<SampleTest[]>([]);
  const [groups, setGroups] = useState<SampleTestGroup[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [selectedTestsToAdd, setSelectedTestsToAdd] = useState<Set<number>>(new Set());
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    try {
      const [testsData, groupsData] = await Promise.all([
        get('/sample-tests'),
        get('/sample-test-groups/with-tasks'),
      ]);
      setTests(testsData);
      setGroups(groupsData);
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
    await patch(`/tasks/${taskId}`, { scheduled_date: null });
    await refresh();
  }

  if (loading) return <div className="staging-layout" style={{ padding: '2rem' }}>Loading...</div>;
  if (error) return <div className="staging-layout" style={{ padding: '2rem' }}>Failed to load data.</div>;

  return (

        <StagingAreaContext.Provider value={{
          tests,
          groups,
          selectedTestsToAdd,
          adding,
          showModal,
          loading,
          error,
          refresh,
          toggleSelect,
          handleAdd,	
          handleRemove,
          handleDeleteGroup,
          handleUnschedule,
          handleCreateGroupWithTests,
          setShowModal,
          setSelectedTestsToAdd,


        }}>


      <div className="staging-layout">
        <TestPool/>
        <div className="staging-main">
          <GroupList/>
        </div>

        {showModal && (
          <CreateGroupModal/>
        )}
      </div>
    </StagingAreaContext.Provider>

  );
}

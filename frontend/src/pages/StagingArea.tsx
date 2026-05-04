import { useEffect, useState } from 'react';
import { get, post, del } from '../api';
import type { SampleTest, SampleTestGroup } from '../components/types';
import GroupList from '../components/StagingArea/GroupList';
import GroupDetail from '../components/StagingArea/GroupDetail';
import CreateGroupModal from '../components/StagingArea/CreateGroupModal';
import '../components/StagingArea/StagingArea.css';
import TestPool from '../components/StagingArea/TestPool';

export default function StagingArea() {
  const [tests, setTests] = useState<SampleTest[]>([]);
  const [groups, setGroups] = useState<SampleTestGroup[]>([]);
  const [selectedGroupId, setSelectedGroupId] = useState<number | null>(null);
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

  async function handleCreateGroup(templateIds: number[]) {
    if (selectedTestsToAdd.size === 0) return;

    const group = await post('/sample-test-groups', {
      template_ids: templateIds,
      sample_test_ids: [...selectedTestsToAdd],
    });

    await refresh();
    setSelectedGroupId(group.id);
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

  const resetSelection = () => setSelectedTestsToAdd(new Set());


  // async function handleAdd(testIds: number[]) {

  // }



  async function handleAdd() {
    if (selectedTestsToAdd.size === 0) return;
    setAdding(true);
    try {
      await Promise.all(
        [...selectedTestsToAdd].map(id => post(`/sample-test-groups/${selectedGroupId}/samples/${id}`))
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

  const selectedGroup = groups.find(g => g.id === selectedGroupId) ?? null;

  if (loading) return <div className="staging-layout" style={{ padding: '2rem' }}>Loading...</div>;
  if (error) return <div className="staging-layout" style={{ padding: '2rem' }}>Failed to load data.</div>;

  return (
    <div className="staging-layout">
      <div className="staging-center">
          <TestPool
            group={selectedGroup}
            allTests={tests}
            onAdd={handleAdd}
            onNew={() => setShowModal(true)}
            onToggle={toggleSelect}
            selectedTestsToAdd={selectedTestsToAdd}
            onMount={resetSelection}
            adding={adding}
          />
      </div>
      <GroupList
        groups={groups}
        selectedId={selectedGroupId}
        onSelect={setSelectedGroupId}
        

      />
      <div className="staging-right">
        {selectedGroup ? (
          <GroupDetail
            group={selectedGroup}
            allTests={tests}
            onRemove={handleRemove}
          />
        ) : (
          <div className="staging-placeholder">
            <p>Select a group to manage its tests, or create a new one.</p>
          </div>
        )}
      </div>



      {showModal && (
        <CreateGroupModal
          onConfirm={handleCreateGroup}
          onCancel={() => setShowModal(false)}
        />
      )}
    </div>
  );
}

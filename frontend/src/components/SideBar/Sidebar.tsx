import { useEffect, useState } from 'react';
import { useDroppable } from '@dnd-kit/core';
import TestGroupRow from './TestGroupRow';
import { get } from '../../api';
import type { SampleTestGroup } from '../types';
import './Sidebar.css';

interface Props {
  scheduledOverrides: Map<number, boolean>;
}

export default function Sidebar({ scheduledOverrides }: Props) {
  const [groupData, setGroupData] = useState<SampleTestGroup[]>([]);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);

  const { setNodeRef, isOver } = useDroppable({ id: 'sidebar' });

  useEffect(() => {
    async function fetchData() {
      try {
        const data = await get('/sample-test-groups/with-tasks');
        setGroupData(data);
      } catch {
        setError(true);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  if (loading) return <div className="sidebar-view" style={{ padding: '1rem' }}>Loading...</div>;
  if (error) return <div className="sidebar-view" style={{ padding: '1rem' }}>Failed to load groups.</div>;

  return (
    <div
      ref={setNodeRef}
      className={`sidebar-view${isOver ? ' sidebar-view--over' : ''}`}
    >
      {groupData.map(group => {
        const sampleIds = group.sample_tests
          .map(st => st.sample_id)
          .filter((id): id is string => id !== null);
        const testNames = group.sample_tests
          .map(st => st.test_name)
          .filter((name): name is string => name !== null);
        return (
          <TestGroupRow
            key={group.id}
            groupId={group.id}
            sampleIds={sampleIds}
            testNames={testNames}
            tasks={group.tasks}
            scheduledOverrides={scheduledOverrides}
          />
        );
      })}
    </div>
  );
}

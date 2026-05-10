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
        const testNames = [...new Set(group.sample_tests.map(st => st.test_name).filter((n): n is string => n !== null))];
        const projects = [...new Set(group.sample_tests.map(st => st.project).filter((p): p is string => p !== null))];
        const clients = [...new Set(group.sample_tests.map(st => st.client).filter((c): c is string => c !== null))];
        const specSheets = [...new Set(group.sample_tests.map(st => st.spec_sheet).filter((s): s is string => s !== null))];
        const otherDocs = [...new Set(group.sample_tests.map(st => st.other_testing_documents).filter((d): d is string => d !== null))];
        const methods = [...new Set(group.sample_tests.map(st => st.method).filter((m): m is string => m !== null))];
        return (
          <TestGroupRow
            key={group.id}
            groupId={group.id}
            sampleTests={group.sample_tests}
            testNames={testNames}
            projects={projects}
            clients={clients}
            specSheets={specSheets}
            otherDocs={otherDocs}
            methods={methods}
            tasks={group.tasks}
            scheduledOverrides={scheduledOverrides}
          />
        );
      })}
    </div>
  );
}

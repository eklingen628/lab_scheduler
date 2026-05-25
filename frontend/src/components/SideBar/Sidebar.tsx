import { useDroppable } from '@dnd-kit/core';
import TestGroupRow from './TestGroupRow';
import type { SampleTestGroup } from '../types';
import './Sidebar.css';
import { memo } from 'react';
import { uniqueField } from '../utils';

interface Props {
  scheduledOverrides: Map<number, boolean>;
  groupData: SampleTestGroup[] | null;
  groupDataError: boolean;
}



function Sidebar({ scheduledOverrides, groupData, groupDataError }: Props) {
  

  const { setNodeRef, isOver } = useDroppable({ id: 'sidebar' });



  if (groupData === null) return <div className="sidebar-view" style={{ padding: '1rem' }}>Loading...</div>;
  if (groupDataError) return <div className="sidebar-view" style={{ padding: '1rem' }}>Failed to load groups.</div>;

  return (
    <div
      ref={setNodeRef}
      className={`sidebar-view${isOver ? ' sidebar-view--over' : ''}`}
    >
      {groupData.map(group => {
        const testNames = uniqueField(group.sample_tests, 'test_name')
        const projects = uniqueField(group.sample_tests, 'project')
        const clients = uniqueField(group.sample_tests, 'client')
        const specSheets = uniqueField(group.sample_tests, 'spec_sheet')
        const otherDocs = uniqueField(group.sample_tests, 'other_testing_documents')
        const methods = uniqueField(group.sample_tests, 'method')

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

export default memo(Sidebar)
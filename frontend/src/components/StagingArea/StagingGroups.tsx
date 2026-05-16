import type { SampleTestGroup } from '../types';
import TestGroupBubble from '../SideBar/TestGroupBubble';
import TaskChip from '../Calendar/TaskChip';

interface Props {
  groups: SampleTestGroup[];
}

export default function StagingGroups({ groups }: Props) {
  return (
    <div className="staging-groups">
      <h2 className="staging-groups-title">Groups</h2>
      {groups.length === 0 ? (
        <p className="staging-empty" style={{ padding: '12px' }}>No groups yet.</p>
      ) : (
        groups.map(group => {
          const testNames = [...new Set(group.sample_tests.map(st => st.test_name).filter((n): n is string => n !== null))];
          const projects = [...new Set(group.sample_tests.map(st => st.project).filter((p): p is string => p !== null))];
          const clients = [...new Set(group.sample_tests.map(st => st.client).filter((c): c is string => c !== null))];
          const specSheets = [...new Set(group.sample_tests.map(st => st.spec_sheet).filter((s): s is string => s !== null))];
          const otherDocs = [...new Set(group.sample_tests.map(st => st.other_testing_documents).filter((d): d is string => d !== null))];
          const methods = [...new Set(group.sample_tests.map(st => st.method).filter((m): m is string => m !== null))];
          return (
            <div key={group.id} className="staging-group-row">
              <TestGroupBubble
                groupId={group.id}
                sampleTests={group.sample_tests}
                testNames={testNames}
                projects={projects}
                clients={clients}
                specSheets={specSheets}
                otherDocs={otherDocs}
                methods={methods}
              />
              <div className="staging-group-tasks">
                {group.tasks.map(task => (
                  <TaskChip key={task.id} task={task} />
                ))}
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}

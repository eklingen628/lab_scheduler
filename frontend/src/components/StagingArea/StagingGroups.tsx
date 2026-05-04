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
          const sampleIds = group.sample_tests
            .map(st => st.sample_id)
            .filter((id): id is string => id !== null);
          const testNames = group.sample_tests
            .map(st => st.test_name)
            .filter((name): name is string => name !== null);
          return (
            <div key={group.id} className="staging-group-row">
              <TestGroupBubble groupId={group.id} sampleIds={sampleIds} testNames={testNames} />
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

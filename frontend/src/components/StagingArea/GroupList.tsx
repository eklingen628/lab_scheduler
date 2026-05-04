import type { SampleTestGroup } from '../types';

interface Props {
  groups: SampleTestGroup[];
  selectedId: number | null;
  onSelect: (id: number) => void;

}

export default function GroupList({ groups, selectedId, onSelect }: Props) {
  return (
    <div className="staging-left">
      <div className="staging-left-header">
        <span className="staging-left-title">Groups</span>

      </div>
      <div className="group-list">
        {groups.length === 0 ? (
          <p className="staging-empty" style={{ padding: '12px' }}>No groups yet.</p>
        ) : (
          groups.map(g => (
            <div
              key={g.id}
              className={`group-list-item${g.id === selectedId ? ' group-list-item--selected' : ''}`}
              onClick={() => onSelect(g.id)}
            >
              <span className="group-list-name">Group {g.id}</span>
              <span className="group-list-meta">{g.sample_tests.length} test{g.sample_tests.length !== 1 ? 's' : ''}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

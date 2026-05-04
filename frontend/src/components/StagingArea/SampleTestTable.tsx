import type { SampleTest } from '../types';

interface Props {
  tests: SampleTest[];
  selectedIds: Set<number>;
  onToggle: (id: number) => void;
}

export default function SampleTestTable({ tests, selectedIds, onToggle }: Props) {
  if (tests.length === 0) return <p className="staging-empty">No ungrouped tests.</p>;

  return (
    <div className="staging-table-wrapper">
      <table className="staging-table">
        <thead>
          <tr>
            <th></th>
            <th>Test Key</th>
            <th>Sample ID</th>
            <th>Test Name</th>
            <th>Project</th>
            <th>Due Date</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {tests.map(test => (
            <tr
              key={test.id}
              className={selectedIds.has(test.id) ? 'staging-row--selected' : ''}
              onClick={() => onToggle(test.id)}
            >
              <td>
                <input
                  type="checkbox"
                  checked={selectedIds.has(test.id)}
                  onChange={() => onToggle(test.id)}
                  onClick={e => e.stopPropagation()}
                />
              </td>
              <td>{test.test_key}</td>
              <td>{test.sample_id ?? '—'}</td>
              <td>{test.test_name ?? '—'}</td>
              <td>{test.project ?? '—'}</td>
              <td>{test.due_date ?? '—'}</td>
              <td>{test.status ?? '—'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

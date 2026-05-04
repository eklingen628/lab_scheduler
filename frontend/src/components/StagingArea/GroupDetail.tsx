import { useEffect, useState } from 'react';
import type { SampleTest, SampleTestGroup } from '../types';

interface Props {
  group: SampleTestGroup;
  allTests: SampleTest[];
  onAdd: (testIds: number[]) => Promise<void>;
  onRemove: (testId: number) => Promise<void>;
}

const COLS = ['Test Key', 'Sample ID', 'Test Name', 'Project', 'Due Date', 'Status'] as const;

function TestRow({ test }: { test: SampleTest }) {
  return (
    <>
      <td>{test.test_key}</td>
      <td>{test.sample_id ?? '—'}</td>
      <td>{test.test_name ?? '—'}</td>
      <td>{test.project ?? '—'}</td>
      <td>{test.due_date ?? '—'}</td>
      <td>{test.status ?? '—'}</td>
    </>
  );
}

export default function GroupDetail({ group, allTests, onAdd, onRemove }: Props) {
  const [selectedToAdd, setSelectedToAdd] = useState<Set<number>>(new Set());
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    setSelectedToAdd(new Set());
  }, [group.id]);

  const inGroup = allTests.filter(t => t.group_id === group.id);
  const available = allTests.filter(t => t.group_id === null);

  function toggleAdd(id: number) {
    setSelectedToAdd(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  async function handleAdd() {
    if (selectedToAdd.size === 0) return;
    setAdding(true);
    try {
      await onAdd([...selectedToAdd]);
      setSelectedToAdd(new Set());
    } finally {
      setAdding(false);
    }
  }

  return (
    <div className="group-detail">

      <div className="group-section">
        <div className="group-section-header">
          <span className="group-section-label">In this group</span>
        </div>
        {inGroup.length === 0 ? (
          <p className="staging-empty">No tests in this group yet.</p>
        ) : (
          <div className="staging-table-wrapper">
            <table className="staging-table">
              <thead>
                <tr>
                  {COLS.map(c => <th key={c}>{c}</th>)}
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {inGroup.map(test => (
                  <tr key={test.id} className="in-group-row">
                    <TestRow test={test} />
                    <td>
                      <button className="remove-btn" onClick={() => onRemove(test.id)}>Remove</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="group-section">
        <div className="group-section-header">
          <span className="group-section-label">Available tests</span>
          <button
            className="staging-new-btn"
            disabled={selectedToAdd.size === 0 || adding}
            onClick={handleAdd}
          >
            {adding ? 'Adding…' : `Add Selected (${selectedToAdd.size})`}
          </button>
        </div>
        {available.length === 0 ? (
          <p className="staging-empty">No ungrouped tests.</p>
        ) : (
          <div className="staging-table-wrapper">
            <table className="staging-table">
              <thead>
                <tr>
                  <th></th>
                  {COLS.map(c => <th key={c}>{c}</th>)}
                </tr>
              </thead>
              <tbody>
                {available.map(test => (
                  <tr
                    key={test.id}
                    className={selectedToAdd.has(test.id) ? 'staging-row--selected' : ''}
                    onClick={() => toggleAdd(test.id)}
                  >
                    <td>
                      <input
                        type="checkbox"
                        checked={selectedToAdd.has(test.id)}
                        onChange={() => toggleAdd(test.id)}
                        onClick={e => e.stopPropagation()}
                      />
                    </td>
                    <TestRow test={test} />
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
}

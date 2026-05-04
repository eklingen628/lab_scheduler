import { useEffect, useState } from 'react';
import type { SampleTest, SampleTestGroup } from '../types';

interface Props {
  group: SampleTestGroup | null;
  allTests: SampleTest[];
  onAdd: () => Promise<void>;
  onNew: () => void;
  onToggle: (id: number) => void;
  selectedTestsToAdd: Set<number>;
  onMount: () => void;
  adding: boolean;

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

export default function TestPool({ allTests, onAdd, onNew, onToggle, selectedTestsToAdd, onMount, adding }: Props) {

  useEffect(() => {
    onMount();
  }, []);

  const available = allTests.filter(t => t.group_id === null);



  return (
    <div className="group-detail">

      <div className="group-section">
        <div className="group-section-header">
          <button 
            className="staging-new-btn" 
            onClick={onNew}
            disabled={selectedTestsToAdd.size === 0}
          >
            + Create New Group
          </button>
          <span className="group-section-label">Available tests</span>
          <button
            className="staging-new-btn"
            disabled={selectedTestsToAdd.size === 0 || adding}
            onClick={() => onAdd()}
          >
            {adding ? 'Adding…' : `Add Selected To Group (${selectedTestsToAdd.size})`}
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
                    className={selectedTestsToAdd.has(test.id) ? 'staging-row--selected' : ''}
                    onClick={() => onToggle(test.id)}
                  >
                    <td>
                      <input
                        type="checkbox"
                        checked={selectedTestsToAdd.has(test.id)}
                        onChange={() => onToggle(test.id)}
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

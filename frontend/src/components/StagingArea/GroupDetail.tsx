import { useEffect, useState } from 'react';
import type { SampleTest, SampleTestGroup } from '../types';

interface Props {
  group: SampleTestGroup;
  allTests: SampleTest[];
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

export default function GroupDetail({ group, allTests, onRemove }: Props) {



  const inGroup = allTests.filter(t => t.group_id === group.id);



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

    </div>
  );
}

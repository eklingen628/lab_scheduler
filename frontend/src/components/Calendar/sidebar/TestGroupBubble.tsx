import { useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import type { SampleTest } from '../../types';
import './Sidebar.css';

interface Props {
  groupId: number;
  sampleTests: SampleTest[];
  testNames: string[];
  projects: string[];
  clients: string[];
  specSheets: string[];
  otherDocs: string[];
  methods: string[];
}

function formatShortDate(iso: string): string {
  const d = new Date(iso + 'T00:00:00');
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export default function TestGroupBubble({ groupId, sampleTests, testNames, projects, clients, methods }: Props) {
  const [hovered, setHovered] = useState(false);
  const [pos, setPos] = useState({ top: 0, left: 0 });
  const bubbleRef = useRef<HTMLDivElement>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const hasSamples = sampleTests.length > 0;

  function openPopover() {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    if (bubbleRef.current) {
      const r = bubbleRef.current.getBoundingClientRect();
      setPos({ top: r.top, left: r.right + 6 });
    }
    setHovered(true);
  }

  function scheduleClose() {
    closeTimer.current = setTimeout(() => setHovered(false), 120);
  }

  function cancelClose() {
    if (closeTimer.current) clearTimeout(closeTimer.current);
  }

  const rows: { label: string; value: string | null; mono: boolean }[] = [
    { label: 'Project', value: projects.join(', ') || null,  mono: true  },
    { label: 'Client',  value: clients.join(', ') || null,   mono: false },
    { label: 'Tests',   value: testNames.join(', ') || null, mono: false },
    { label: 'Method',  value: methods.join(', ') || null,   mono: true  },
  ].filter(r => r.value !== null);

  return (
    <div
      ref={bubbleRef}
      className="sidebar-bubble"
      onMouseEnter={hasSamples ? openPopover : undefined}
      onMouseLeave={hasSamples ? scheduleClose : undefined}
    >
      <div className="sidebar-bubble-header">
        <span className="sidebar-bubble-title">Group {groupId}</span>
        {hasSamples && (
          <span className="sidebar-bubble-sample-count">{sampleTests.length} samples</span>
        )}
      </div>

      <table className="sidebar-bubble-table">
        <tbody>
          {rows.map((row, i) => (
            <tr key={row.label} className={i === rows.length - 1 ? 'sidebar-bubble-table-lastrow' : ''}>
              <td className="sidebar-bubble-table-label">{row.label}</td>
              <td className={`sidebar-bubble-table-value${row.mono ? ' sidebar-bubble-table-mono' : ''}`}>
                {row.value}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {hovered && hasSamples && createPortal(
        <div
          className="sidebar-bubble-popover"
          style={{ top: pos.top, left: pos.left }}
          onMouseEnter={cancelClose}
          onMouseLeave={() => setHovered(false)}
        >
          <table className="sidebar-popover-table">
            <thead>
              <tr>
                <th>Sample</th>
                <th>#</th>
                <th>Status</th>
                <th>Due</th>
                <th>PR</th>
              </tr>
            </thead>
            <tbody>
              {sampleTests.map(st => (
                <tr key={st.id}>
                  <td>{st.sample_id ?? '—'}</td>
                  <td>{st.number_of != null ? `${st.number_of}×` : '—'}</td>
                  <td>{st.status ?? '—'}</td>
                  <td>{st.due_date ? formatShortDate(st.due_date) : '—'}</td>
                  <td>{st.pr_comp ? <span className="sidebar-popover-pr-badge">PR</span> : null}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>,
        document.body
      )}
    </div>
  );
}

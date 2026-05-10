import { useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import type { SampleTest } from '../types';
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

export default function TestGroupBubble({ groupId, sampleTests, testNames, projects, clients, specSheets, otherDocs, methods }: Props) {
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

  return (
    <div
      ref={bubbleRef}
      className="sidebar-bubble"
      onMouseEnter={hasSamples ? openPopover : undefined}
      onMouseLeave={hasSamples ? scheduleClose : undefined}
    >
      <p className="sidebar-bubble-title">Group {groupId}</p>

      {projects.length > 0 && (
        <div className="sidebar-bubble-row">
          <span className="sidebar-bubble-label">Project</span>
          <span>{projects.join(', ')}</span>
        </div>
      )}
      {clients.length > 0 && (
        <div className="sidebar-bubble-row">
          <span className="sidebar-bubble-label">Client</span>
          <span>{clients.join(', ')}</span>
        </div>
      )}
      {testNames.length > 0 && (
        <div className="sidebar-bubble-row">
          <span className="sidebar-bubble-label">Tests</span>
          <span>{testNames.join(', ')}</span>
        </div>
      )}
      {methods.length > 0 && (
        <div className="sidebar-bubble-row">
          <span className="sidebar-bubble-label">Method</span>
          <span>{methods.join(', ')}</span>
        </div>
      )}
      {specSheets.length > 0 && (
        <div className="sidebar-bubble-row">
          <span className="sidebar-bubble-label">Spec</span>
          <span>{specSheets.join(', ')}</span>
        </div>
      )}
      {otherDocs.length > 0 && (
        <div className="sidebar-bubble-row">
          <span className="sidebar-bubble-label">Docs</span>
          <span>{otherDocs.join(', ')}</span>
        </div>
      )}
      {hasSamples && (
        <div className="sidebar-bubble-row">
          <span className="sidebar-bubble-label">Samples</span>
          <span>{sampleTests.length}</span>
        </div>
      )}

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

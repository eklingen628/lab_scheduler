import { useEffect, useState } from 'react';
import { get } from '../../api';
import type { Template } from '../types';

interface Props {
  onConfirm: (templateIds: number[]) => Promise<void>;
  onCancel: () => void;
}

export default function CreateGroupModal({ onConfirm, onCancel }: Props) {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    get('/templates')
      .then(data => setTemplates(data))
      .finally(() => setLoading(false));
  }, []);

  function toggleTemplate(id: number) {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  async function handleConfirm() {
    setSubmitting(true);
    try {
      await onConfirm([...selectedIds]);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal-card" onClick={e => e.stopPropagation()}>
        <h3>Create Group</h3>
        <p className="modal-subtitle">Select templates to apply to this group.</p>
        {loading ? (
          <p className="staging-empty">Loading templates...</p>
        ) : templates.length === 0 ? (
          <p className="staging-empty">No templates found.</p>
        ) : (
          <ul className="modal-template-list">
            {templates.map(t => (
              <li
                key={t.id}
                className={`modal-template-item${selectedIds.has(t.id) ? ' modal-template-item--selected' : ''}`}
                onClick={() => toggleTemplate(t.id)}
              >
                <input
                  type="checkbox"
                  checked={selectedIds.has(t.id)}
                  onChange={() => toggleTemplate(t.id)}
                  onClick={e => e.stopPropagation()}
                />
                <div>
                  <div className="modal-template-name">{t.name ?? `Template ${t.id}`}</div>
                  {t.description && <div className="modal-template-desc">{t.description}</div>}
                </div>
              </li>
            ))}
          </ul>
        )}
        <div className="modal-actions">
          <button className="modal-btn modal-btn--cancel" onClick={onCancel}>Cancel</button>
          <button
            className="modal-btn modal-btn--confirm"
            onClick={handleConfirm}
            disabled={submitting || selectedIds.size === 0}
          >
            {submitting ? 'Creating...' : 'Create Group'}
          </button>
        </div>
      </div>
    </div>
  );
}

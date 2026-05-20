import { useState } from 'react';
import './Templates.css';

export interface LocalAlias {
  localId: string;
  id?: number;
  pattern: string;
}

export interface LocalTask {
  localId: string;
  id?: number;
  name: string;
  type: string;
  description: string;
  equipment: string;
  base_time: string;
  time_per_replicate: string;
}

export interface FormSaveData {
  name: string;
  description: string;
  aliases: LocalAlias[];
  tasks: LocalTask[];
  deletedAliasIds: number[];
  deletedTaskIds: number[];
}

interface Props {
  initialName?: string;
  initialDescription?: string;
  initialAliases?: LocalAlias[];
  initialTasks?: LocalTask[];
  saving: boolean;
  onSave: (data: FormSaveData) => void;
  onCancel: () => void;
}

const TASK_FIELDS: { key: keyof Omit<LocalTask, 'localId' | 'id'>; label: string; numeric?: boolean }[] = [
  { key: 'name',               label: 'Name' },
  { key: 'type',               label: 'Type' },
  { key: 'description',        label: 'Description' },
  { key: 'equipment',          label: 'Equipment' },
  { key: 'base_time',          label: 'Base Time',    numeric: true },
  { key: 'time_per_replicate', label: 'Time/Rep',     numeric: true },
];

function newLocalId() {
  return `local-${Date.now()}-${Math.random()}`;
}

function emptyTask(): LocalTask {
  return { localId: newLocalId(), name: '', type: '', description: '', equipment: '', base_time: '', time_per_replicate: '',};
}

export default function TemplateForm({
  initialName = '',
  initialDescription = '',
  initialAliases = [],
  initialTasks = [],
  saving,
  onSave,
  onCancel,
}: Props) {
  const [name, setName] = useState(initialName);
  const [description, setDescription] = useState(initialDescription);
  const [aliases, setAliases] = useState<LocalAlias[]>(initialAliases);
  const [tasks, setTasks] = useState<LocalTask[]>(initialTasks);
  const [deletedAliasIds, setDeletedAliasIds] = useState<number[]>([]);
  const [deletedTaskIds, setDeletedTaskIds] = useState<number[]>([]);

  function addAlias() {
    setAliases(prev => [...prev, { localId: newLocalId(), pattern: '' }]);
  }

  function removeAlias(localId: string, id?: number) {
    setAliases(prev => prev.filter(a => a.localId !== localId));
    if (id !== undefined) setDeletedAliasIds(prev => [...prev, id]);
  }

  function updateAlias(localId: string, pattern: string) {
    setAliases(prev => prev.map(a => a.localId === localId ? { ...a, pattern } : a));
  }

  function addTask() {
    setTasks(prev => [...prev, emptyTask()]);
  }

  function removeTask(localId: string, id?: number) {
    setTasks(prev => prev.filter(t => t.localId !== localId));
    if (id !== undefined) setDeletedTaskIds(prev => [...prev, id]);
  }

  function updateTask(localId: string, field: keyof Omit<LocalTask, 'localId' | 'id'>, value: string) {
    setTasks(prev => prev.map(t => t.localId === localId ? { ...t, [field]: value } : t));
  }

  return (
    <div className="tpl-form">
      <div className="tpl-section">
        <div className="tpl-field">
          <label className="tpl-label">Name</label>
          <input className="tpl-input" value={name} onChange={e => setName(e.target.value)} />
        </div>
        <div className="tpl-field">
          <label className="tpl-label">Description</label>
          <textarea className="tpl-input tpl-textarea" value={description} onChange={e => setDescription(e.target.value)} rows={2} />
        </div>
      </div>

      <div className="tpl-section">
        <div className="tpl-section-header">
          <h3 className="tpl-section-title">Test Name Patterns</h3>
          <button className="tpl-add-btn" onClick={addAlias} type="button">+ Add Pattern</button>
        </div>
        {aliases.length === 0 ? (
          <p className="tpl-empty">No patterns yet.</p>
        ) : (
          <ul className="tpl-aliases">
            {aliases.map(alias => (
              <li key={alias.localId} className="tpl-alias-row">
                <input
                  className="tpl-input"
                  value={alias.pattern}
                  onChange={e => updateAlias(alias.localId, e.target.value)}
                  placeholder="e.g. Tensile*"
                />
                <button className="tpl-remove-btn" onClick={() => removeAlias(alias.localId, alias.id)} type="button">✕</button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="tpl-section">
        <div className="tpl-section-header">
          <h3 className="tpl-section-title">Tasks</h3>
          <button className="tpl-add-btn" onClick={addTask} type="button">+ Add Task</button>
        </div>
        {tasks.length === 0 ? (
          <p className="tpl-empty">No tasks yet.</p>
        ) : (
          <div className="tpl-tasks-wrapper">
            <table className="tpl-tasks-table">
              <thead>
                <tr>
                  {TASK_FIELDS.map(f => <th key={f.key}>{f.label}</th>)}
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {tasks.map(task => (
                  <tr key={task.localId}>
                    {TASK_FIELDS.map(f => (
                      <td key={f.key}>
                        <input
                          className="tpl-cell-input"
                          type={f.numeric ? 'number' : 'text'}
                          value={task[f.key]}
                          onChange={e => updateTask(task.localId, f.key, e.target.value)}
                        />
                      </td>
                    ))}
                    <td>
                      <button className="tpl-remove-btn" onClick={() => removeTask(task.localId, task.id)} type="button">✕</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="tpl-actions">
        <button className="tpl-btn tpl-btn--cancel" onClick={onCancel} type="button">Cancel</button>
        <button className="tpl-btn tpl-btn--save" onClick={() => onSave({ name, description, aliases, tasks, deletedAliasIds, deletedTaskIds })} disabled={saving} type="button">
          {saving ? 'Saving…' : 'Save Template'}
        </button>
      </div>
    </div>
  );
}

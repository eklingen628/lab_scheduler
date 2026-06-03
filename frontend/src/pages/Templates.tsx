import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { get, del, post } from '../api';
import type { Template, TemplateTask } from '../components/types';
import '../components/Templates/Templates.css';

export default function Templates() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [taskCounts, setTaskCounts] = useState<Map<number, number>>(new Map());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchData() {
      try {
        const [tpls, allTasks] = await Promise.all([
          get('/templates'),
          get('/template-tasks'),
        ]);
        setTemplates(tpls);
        const counts = new Map<number, number>();
        (allTasks as TemplateTask[]).forEach(t => {
          counts.set(t.template_id, (counts.get(t.template_id) ?? 0) + 1);
        });
        setTaskCounts(counts);
      } catch {
        setError(true);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  async function handleDelete(id: number) {
    if (!confirm('Delete this template?')) return;
    try {
      await del(`/templates/${id}`);
      setTemplates(prev => prev.filter(t => t.id !== id));
    } catch (e) {
      alert(`Delete failed: ${e instanceof Error ? e.message : e}`);
    }
  }

  async function handleCopyToTemplate(id: number) {
    try {
      const newTemplate = await post(`/templates/${id}/copy`);
      setTemplates(prev => [...prev, newTemplate]);
      navigate(`/templates/${newTemplate.id}`)

    } catch (e) {
      alert(`Copying template failed: ${e instanceof Error ? e.message : e}`);
    }
  }

  if (loading) return <div className="tpl-page">Loading...</div>;
  if (error) return <div className="tpl-page">Failed to load templates.</div>;

  return (
    <div className="tpl-page">
      <div className="tpl-list-header">
        <h2>Templates</h2>
        <Link to="/templates/new" className="tpl-new-btn">+ New Template</Link>
      </div>
      {templates.length === 0 ? (
        <p className="tpl-empty">No templates yet.</p>
      ) : (
        <div className="tpl-table-wrapper">
          <table className="tpl-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Description</th>
                <th>Tasks</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {templates.map(t => (
                <tr key={t.id}>
                  <td>{t.name ?? '—'}</td>
                  <td>{t.description ?? '—'}</td>
                  <td>{taskCounts.get(t.id) ?? 0}</td>
                  <td>
                    <Link to={`/templates/${t.id}`} className="tpl-edit-link">Edit</Link>
                    <button className="tpl-create-btn" onClick={() => handleCopyToTemplate(t.id)}>Copy To New</button>
                    <button className="tpl-delete-btn" onClick={() => handleDelete(t.id)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

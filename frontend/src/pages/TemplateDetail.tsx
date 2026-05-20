import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { get, post, patch, del } from '../api';
import TemplateForm from '../components/Templates/TemplateForm';
import type { FormSaveData, LocalAlias, LocalTask } from '../components/Templates/TemplateForm';
import type { Template, TemplateTask, TemplateTestNameAlias } from '../components/types';
import '../components/Templates/Templates.css';

function parseFloat_(s: string): number | null {
  const n = parseFloat(s);
  return isNaN(n) ? null : n;
}

function parseInt_(s: string): number | null {
  const n = parseInt(s, 10);
  return isNaN(n) ? null : n;
}

function taskToLocal(t: TemplateTask): LocalTask {
  return {
    localId: `existing-${t.id}`,
    id: t.id,
    name: t.name ?? '',
    type: t.type ?? '',
    description: t.description ?? '',
    equipment: t.equipment ?? '',
    base_time: t.base_time?.toString() ?? '',
    time_per_replicate: t.time_per_replicate?.toString() ?? '',
  };
}

function aliasToLocal(a: TemplateTestNameAlias): LocalAlias {
  return { localId: `existing-${a.id}`, id: a.id, pattern: a.test_name_pattern };
}

export default function TemplateDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [template, setTemplate] = useState<Template | null>(null);
  const [initialTasks, setInitialTasks] = useState<LocalTask[]>([]);
  const [initialAliases, setInitialAliases] = useState<LocalAlias[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    async function fetchData() {
      try {
        const [tpl, allTasks, allAliases] = await Promise.all([
          get(`/templates/${id}`),
          get('/template-tasks'),
          get('/template-test-name-aliases'),
        ]);
        setTemplate(tpl);
        setInitialTasks(
          (allTasks as TemplateTask[]).filter(t => t.template_id === Number(id)).map(taskToLocal)
        );
        setInitialAliases(
          (allAliases as TemplateTestNameAlias[]).filter(a => a.template_id === Number(id)).map(aliasToLocal)
        );
      } catch {
        setError(true);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [id]);

  async function handleSave(data: FormSaveData) {
    setSaving(true);
    try {
      await patch(`/templates/${id}`, {
        name: data.name || null,
        description: data.description || null,
      });
      // Deletes first so IDs don't conflict
      await Promise.all([
        ...data.deletedAliasIds.map(aid => del(`/template-test-name-aliases/${aid}`)),
        ...data.deletedTaskIds.map(tid => del(`/template-tasks/${tid}`)),
      ]);
      await Promise.all([
        ...data.aliases.map(a =>
          a.id
            ? patch(`/template-test-name-aliases/${a.id}`, { test_name_pattern: a.pattern })
            : post('/template-test-name-aliases', { template_id: Number(id), test_name_pattern: a.pattern })
        ),
        ...data.tasks.map(t => {
          const body = {
            name: t.name || null,
            type: t.type || null,
            description: t.description || null,
            equipment: t.equipment || null,
            base_time: parseFloat_(t.base_time),
            time_per_replicate: parseFloat_(t.time_per_replicate),
          };
          return t.id
            ? patch(`/template-tasks/${t.id}`, body)
            : post('/template-tasks', { template_id: Number(id), ...body });
        }),
      ]);
      navigate('/templates');
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <div className="tpl-page">Loading...</div>;
  if (error || !template) return <div className="tpl-page">Template not found.</div>;

  return (
    <div className="tpl-page">
      <h2 className="tpl-form-title">Edit Template</h2>
      <TemplateForm
        initialName={template.name ?? ''}
        initialDescription={template.description ?? ''}
        initialAliases={initialAliases}
        initialTasks={initialTasks}
        saving={saving}
        onSave={handleSave}
        onCancel={() => navigate('/templates')}
      />
    </div>
  );
}

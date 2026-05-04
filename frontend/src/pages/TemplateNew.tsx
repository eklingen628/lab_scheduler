import { useState } from 'react';
import { useNavigate } from 'react-router';
import { post } from '../api';
import TemplateForm from '../components/Templates/TemplateForm';
import type { FormSaveData } from '../components/Templates/TemplateForm';
import '../components/Templates/Templates.css';

function parseFloat_(s: string): number | null {
  const n = parseFloat(s);
  return isNaN(n) ? null : n;
}

function parseInt_(s: string): number | null {
  const n = parseInt(s, 10);
  return isNaN(n) ? null : n;
}

export default function TemplateNew() {
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);

  async function handleSave(data: FormSaveData) {
    setSaving(true);
    try {
      const template = await post('/templates', {
        name: data.name || null,
        description: data.description || null,
      });
      await Promise.all([
        ...data.aliases.map(a =>
          post('/template-test-name-aliases', {
            template_id: template.id,
            test_name_pattern: a.pattern,
          })
        ),
        ...data.tasks.map(t =>
          post('/template-tasks', {
            template_id: template.id,
            name: t.name || null,
            type: t.type || null,
            description: t.description || null,
            equipment: t.equipment || null,
            base_time: parseFloat_(t.base_time),
            time_per_replicate: parseFloat_(t.time_per_replicate),
            min_step: parseInt_(t.min_step),
            max_step: parseInt_(t.max_step),
          })
        ),
      ]);
      navigate('/templates');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="tpl-page">
      <h2 className="tpl-form-title">New Template</h2>
      <TemplateForm saving={saving} onSave={handleSave} onCancel={() => navigate('/templates')} />
    </div>
  );
}

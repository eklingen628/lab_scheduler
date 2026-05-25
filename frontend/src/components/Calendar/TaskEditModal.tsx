import { useState, useEffect } from 'react';
import type { Task, Person } from '../types';
import { post, patch } from '../../api';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';

interface Props {
  task: Task | null;
  open: boolean;
  people: Person[];
  initialPersonId?: number | null;
  initialDate?: string | null;
  onClose: () => void;
  onSaved: (task: Task) => void;
  onUnscheduled: (taskId: number) => void;
}

type GroupedTaskFormState = {
  name: string;
  type: string;
  description: string;
  equipment: string;
  base_time: string;
  time_per_replicate: string;
  person_id: string;
  scheduled_date: string;
};

type AdHocTaskFormState = {
  name: string;
  type: string;
  description: string;
  project: string;
  method: string;
  test_name: string;
  equipment: string;
  base_time: string;
  time_per_replicate: string;
  person_id: string;
  scheduled_date: string;
};

function groupedTaskToForm(task: Task): GroupedTaskFormState {
  return {
    name: task.name,
    type: task.type ?? '',
    description: task.description ?? '',
    equipment: task.equipment ?? '',
    base_time: String(task.base_time),
    time_per_replicate: task.time_per_replicate != null ? String(task.time_per_replicate) : '',
    person_id: task.person_id != null ? String(task.person_id) : '',
    scheduled_date: task.scheduled_date ?? '',
  };
}

function adHocTaskToForm(task: Task): AdHocTaskFormState {
  return {
    name: task.name,
    type: task.type ?? '',
    description: task.description ?? '',
    project: task.project ?? '',
    method: task.method ?? '',
    test_name: task.test_name ?? '',
    equipment: task.equipment ?? '',
    base_time: String(task.base_time),
    time_per_replicate: task.time_per_replicate != null ? String(task.time_per_replicate) : '',
    person_id: task.person_id != null ? String(task.person_id) : '',
    scheduled_date: task.scheduled_date ?? '',
  };
}

function emptyForm(initialPersonId?: number | null, initialDate?: string | null): AdHocTaskFormState {
  return {
    name: '',
    type: '',
    description: '',
    project: '',
    method: '',
    test_name: '',
    equipment: '',
    base_time: '',
    time_per_replicate: '',
    person_id: initialPersonId != null ? String(initialPersonId) : '',
    scheduled_date: initialDate ?? '',
  };
}

function isAdHoc(f: AdHocTaskFormState | GroupedTaskFormState): f is AdHocTaskFormState {
  return 'project' in f;
}


export default function TaskEditModal({ task, open, people, initialPersonId, initialDate, onClose, onSaved, onUnscheduled }: Props) {
  const isCreate = task === null;
  const [form, setForm] = useState<AdHocTaskFormState | GroupedTaskFormState>(() => {
    if (!task)
      return emptyForm(initialPersonId, initialDate)
    else 
      return task.sample_test_group_id ? groupedTaskToForm(task) : adHocTaskToForm(task)
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    setForm(!task ? emptyForm(initialPersonId, initialDate) : task.sample_test_group_id ? groupedTaskToForm(task) : adHocTaskToForm(task));
  }, [open, task]);

  // keyof AdHocTaskFormState because it has all fields from both form types
  function set(field: keyof AdHocTaskFormState, value: string) {
    setForm(prev => ({ ...prev, [field]: value }));
  }

  async function handleSave() {
    setSaving(true);
    const payload = {
      name: form.name || null,
      type: form.type || null,
      description: form.description || null,
      project: isAdHoc(form) ? form.project || null : null,
      method: isAdHoc(form) ? form.method || null : null,
      test_name: isAdHoc(form) ? form.test_name || null : null,      
      equipment: form.equipment || null,
      base_time: form.base_time !== '' ? parseFloat(form.base_time) : null,
      time_per_replicate: form.time_per_replicate !== '' ? parseFloat(form.time_per_replicate) : null,
      person_id: form.person_id !== '' ? parseInt(form.person_id, 10) : null,
      scheduled_date: form.scheduled_date || null,
    };
    try {
      let saved: Task;
      if (isCreate) {
        saved = await post('/tasks', payload);
      } else {
        saved = await patch(`/tasks/${task.id}`, payload);
      }
      onSaved(saved);
    } finally {
      setSaving(false);
    }
  }

  async function handleUnschedule() {
    if (!task) return;
    setSaving(true);
    try {
      await patch(`/tasks/${task.id}`, { person_id: null, scheduled_date: null, position: null });
      onUnscheduled(task.id);
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={open => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isCreate ? 'New Task' : 'Edit Task'}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-3 py-2">
          <div className="grid grid-cols-[120px_1fr] items-center gap-2">
            <Label>Name</Label>
            <Input value={form.name} onChange={e => set('name', e.target.value)} />
          </div>
          <div className="grid grid-cols-[120px_1fr] items-center gap-2">
            <Label>Type</Label>
            <Input value={form.type} onChange={e => set('type', e.target.value)} />
          </div>
          <div className="grid grid-cols-[120px_1fr] items-center gap-2">
            <Label>Description</Label>
            <Input value={form.description} onChange={e => set('description', e.target.value)} />
          </div>

          {isAdHoc(form) && (
            <>
              <div className="grid grid-cols-[120px_1fr] items-center gap-2">
                <Label>Project</Label>
                <Input value={form.project} onChange={e => set('project', e.target.value)} />
              </div>
              <div className="grid grid-cols-[120px_1fr] items-center gap-2">
                <Label>Method</Label>
                <Input value={form.method} onChange={e => set('method', e.target.value)} />
              </div>
              <div className="grid grid-cols-[120px_1fr] items-center gap-2">
                <Label>Test Name</Label>
                <Input value={form.test_name} onChange={e => set('test_name', e.target.value)} />
              </div>            
            </>
          )}

          <div className="grid grid-cols-[120px_1fr] items-center gap-2">
            <Label>Equipment</Label>
            <Input value={form.equipment} onChange={e => set('equipment', e.target.value)} />
          </div>
          <div className="grid grid-cols-[120px_1fr] items-center gap-2">
            <Label>Base time (h)</Label>
            <Input type="number" value={form.base_time} onChange={e => set('base_time', e.target.value)} />
          </div>
          <div className="grid grid-cols-[120px_1fr] items-center gap-2">
            <Label>Per replicate (h)</Label>
            <Input type="number" value={form.time_per_replicate} onChange={e => set('time_per_replicate', e.target.value)} />
          </div>
          <div className="grid grid-cols-[120px_1fr] items-center gap-2">
            <Label>Person</Label>
            <select
              className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-xs outline-none"
              value={form.person_id}
              onChange={e => set('person_id', e.target.value)}
            >
              <option value="">— Unassigned —</option>
              {people.map(p => (
                <option key={p.id} value={String(p.id)}>
                  {p.first_name} {p.last_name}
                </option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-[120px_1fr] items-center gap-2">
            <Label>Date</Label>
            <Input type="date" value={form.scheduled_date} onChange={e => set('scheduled_date', e.target.value)} />
          </div>
        </div>
        <DialogFooter className="flex justify-between">
          {!isCreate && (
            <Button variant="destructive" onClick={handleUnschedule} disabled={saving || !task?.scheduled_date}>
              Unschedule
            </Button>
          )}
          <div className="flex gap-2 ml-auto">
            <Button variant="outline" onClick={onClose} disabled={saving}>Cancel</Button>
            <Button onClick={handleSave} disabled={saving}>Save</Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

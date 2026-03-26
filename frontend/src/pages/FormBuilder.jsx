import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { KeyboardSensor } from '@dnd-kit/core';
import Navbar from '../components/Navbar.jsx';
import { listForms, createForm, updateForm, deleteForm } from '../utils/api.js';

const STEP_TYPES = [
  { type: 'text', label: 'Text Input', icon: '📝' },
  { type: 'photo', label: 'Photo Capture', icon: '📸' },
  { type: 'audio', label: 'Audio Recording', icon: '🎙️' },
  { type: 'multichoice', label: 'Multiple Choice', icon: '☑️' },
];

function newStep(type) {
  const id = `step-${Date.now()}`;
  switch (type) {
    case 'text':
      return { id, type, config: { label: 'New question', placeholder: 'Your answer...', field: id, required: false } };
    case 'photo':
      return { id, type, config: { label: 'Upload a photo', hint: '', field: id, required: false, maxSizeMB: 10 } };
    case 'audio':
      return { id, type, config: { label: 'Record audio', hint: '', field: id, required: false, maxMinutes: 2 } };
    case 'multichoice':
      return { id, type, config: { label: 'Choose one', field: id, required: false, options: ['Option A', 'Option B'] } };
    default:
      return { id, type: 'text', config: { label: 'New question', field: id, required: false } };
  }
}

function SortableStepItem({ step, isSelected, onSelect, onDelete }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: step.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className="flex items-center gap-2">
      <button
        {...listeners}
        {...attributes}
        className="p-2 rounded-xl cursor-grab touch-none"
        style={{ color: 'var(--text-secondary)', background: 'var(--surface-2)' }}
        title="Drag to reorder"
      >
        ⠿
      </button>

      <button
        onClick={onSelect}
        className="flex-1 text-left rounded-2xl px-4 py-3 border-2 transition-all"
        style={{
          borderColor: isSelected ? 'var(--accent)' : 'var(--border)',
          background: isSelected ? 'var(--accent-light)' : 'var(--surface)',
        }}
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="font-semibold text-sm" style={{ color: isSelected ? 'var(--accent)' : 'var(--text-primary)' }}>
              {step.config.label || 'Untitled step'}
            </p>
            <p className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>
              {step.type}
              {step.config.required ? ' · Required' : ''}
            </p>
          </div>
          <span className="text-lg">
            {STEP_TYPES.find((t) => t.type === step.type)?.icon || '📝'}
          </span>
        </div>
      </button>

      <button
        onClick={onDelete}
        className="p-2 rounded-xl transition-all"
        style={{ color: 'var(--error)', background: '#fee2e2' }}
        title="Delete step"
      >
        ✕
      </button>
    </div>
  );
}

function StepEditor({ step, onChange }) {
  if (!step) return (
    <div className="text-center py-12" style={{ color: 'var(--text-secondary)' }}>
      <p className="text-3xl mb-2">👈</p>
      <p className="text-sm">Select a step to edit it</p>
    </div>
  );

  const cfg = step.config;

  function set(key, val) {
    onChange({ ...step, config: { ...cfg, [key]: val } });
  }

  return (
    <div className="space-y-4">
      <h3 className="font-bold text-base" style={{ fontFamily: 'Syne, sans-serif' }}>Edit Step</h3>

      <div>
        <label className="text-xs font-semibold block mb-1" style={{ color: 'var(--text-secondary)' }}>Question / Label</label>
        <input className="form-input" value={cfg.label || ''} onChange={(e) => set('label', e.target.value)} />
      </div>

      <div>
        <label className="text-xs font-semibold block mb-1" style={{ color: 'var(--text-secondary)' }}>Field name (unique identifier)</label>
        <input className="form-input" value={cfg.field || ''} onChange={(e) => set('field', e.target.value.toLowerCase().replace(/\s+/g, '_'))} />
      </div>

      {(step.type === 'text') && (
        <>
          <div>
            <label className="text-xs font-semibold block mb-1" style={{ color: 'var(--text-secondary)' }}>Placeholder</label>
            <input className="form-input" value={cfg.placeholder || ''} onChange={(e) => set('placeholder', e.target.value)} />
          </div>
          <div>
            <label className="text-xs font-semibold block mb-1" style={{ color: 'var(--text-secondary)' }}>Validation</label>
            <select className="form-input" value={cfg.validation || ''} onChange={(e) => set('validation', e.target.value)}>
              <option value="">None</option>
              <option value="email">Email</option>
              <option value="phone">Phone</option>
              <option value="name">Name</option>
            </select>
          </div>
          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <input type="checkbox" checked={!!cfg.multiline} onChange={(e) => set('multiline', e.target.checked)} className="rounded" />
            Multi-line textarea
          </label>
        </>
      )}

      {step.type === 'multichoice' && (
        <div>
          <label className="text-xs font-semibold block mb-1" style={{ color: 'var(--text-secondary)' }}>
            Options (one per line)
          </label>
          <textarea
            className="form-input resize-none"
            rows={5}
            value={(cfg.options || []).join('\n')}
            onChange={(e) => set('options', e.target.value.split('\n').filter((o) => o.trim()))}
          />
        </div>
      )}

      {(step.type === 'photo' || step.type === 'audio') && (
        <div>
          <label className="text-xs font-semibold block mb-1" style={{ color: 'var(--text-secondary)' }}>Hint text</label>
          <input className="form-input" value={cfg.hint || ''} onChange={(e) => set('hint', e.target.value)} />
        </div>
      )}

      <label className="flex items-center gap-2 text-sm cursor-pointer">
        <input type="checkbox" checked={!!cfg.required} onChange={(e) => set('required', e.target.checked)} className="rounded" />
        Required
      </label>
    </div>
  );
}

export default function FormBuilder() {
  const [forms, setForms] = useState([]);
  const [loadingForms, setLoadingForms] = useState(true);
  const [editing, setEditing] = useState(null); // null = list view, object = editing form
  const [selectedStepId, setSelectedStepId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState(null);
  const [showAddStep, setShowAddStep] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  useEffect(() => {
    loadForms();
  }, []);

  async function loadForms() {
    setLoadingForms(true);
    try {
      const data = await listForms();
      setForms(data);
    } catch {
      // silently ignore auth errors on this page for now
    } finally {
      setLoadingForms(false);
    }
  }

  function startNew() {
    setEditing({
      name: 'New Form',
      slug: `form-${Date.now()}`,
      description: '',
      business_name: '',
      accent_color: '#2563eb',
      steps: [],
    });
    setSelectedStepId(null);
  }

  function startEdit(form) {
    setEditing({ ...form, steps: Array.isArray(form.steps) ? [...form.steps] : [] });
    setSelectedStepId(null);
  }

  async function handleSave() {
    setSaving(true);
    setSaveError(null);

    try {
      if (editing.id) {
        const updated = await updateForm(editing.id, editing);
        setForms((prev) => prev.map((f) => (f.id === updated.id ? updated : f)));
      } else {
        const created = await createForm(editing);
        setForms((prev) => [created, ...prev]);
      }
      setEditing(null);
    } catch (err) {
      setSaveError(err.message || 'Failed to save form.');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id) {
    if (!confirm('Delete this form? This cannot be undone.')) return;
    try {
      await deleteForm(id);
      setForms((prev) => prev.filter((f) => f.id !== id));
    } catch {
      // silently ignore
    }
  }

  function handleDragEnd(event) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const steps = editing.steps;
    const oldIndex = steps.findIndex((s) => s.id === active.id);
    const newIndex = steps.findIndex((s) => s.id === over.id);

    setEditing((prev) => ({ ...prev, steps: arrayMove(prev.steps, oldIndex, newIndex) }));
  }

  function addStep(type) {
    const step = newStep(type);
    setEditing((prev) => ({ ...prev, steps: [...prev.steps, step] }));
    setSelectedStepId(step.id);
    setShowAddStep(false);
  }

  function updateStep(updated) {
    setEditing((prev) => ({
      ...prev,
      steps: prev.steps.map((s) => (s.id === updated.id ? updated : s)),
    }));
  }

  function deleteStep(id) {
    setEditing((prev) => ({ ...prev, steps: prev.steps.filter((s) => s.id !== id) }));
    if (selectedStepId === id) setSelectedStepId(null);
  }

  const selectedStep = editing?.steps.find((s) => s.id === selectedStepId);

  if (editing) {
    return (
      <div style={{ background: 'var(--surface-2)', minHeight: '100vh' }}>
        <Navbar />
        <div className="max-w-5xl mx-auto px-4 pt-20 pb-16">
          {/* Builder header */}
          <div className="flex items-center gap-3 mb-6 flex-wrap">
            <button
              onClick={() => setEditing(null)}
              className="text-sm px-3 py-1.5 rounded-xl border"
              style={{ borderColor: 'var(--border)', color: 'var(--text-secondary)', background: 'var(--surface)' }}
            >
              ← Back
            </button>
            <div className="flex-1 min-w-0">
              <input
                className="form-input text-lg font-bold"
                style={{ fontFamily: 'Syne, sans-serif', padding: '8px 12px' }}
                value={editing.name}
                onChange={(e) => setEditing((p) => ({ ...p, name: e.target.value }))}
                placeholder="Form name"
              />
            </div>
            <div className="flex gap-2">
              <a
                href={`/form/${editing.slug}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm px-3 py-1.5 rounded-xl border"
                style={{ borderColor: 'var(--border)', color: 'var(--text-secondary)', background: 'var(--surface)' }}
              >
                Preview
              </a>
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-4 py-1.5 rounded-xl text-sm font-semibold text-white transition-all"
                style={{ background: 'var(--accent)', opacity: saving ? 0.6 : 1 }}
              >
                {saving ? 'Saving...' : 'Save Form'}
              </button>
            </div>
          </div>

          {saveError && (
            <div className="rounded-xl p-3 mb-4 text-sm" style={{ background: '#fee2e2', color: 'var(--error)' }}>
              {saveError}
            </div>
          )}

          {/* Form metadata */}
          <div className="rounded-2xl p-4 mb-4 grid grid-cols-1 sm:grid-cols-3 gap-3" style={{ background: 'var(--surface)' }}>
            <div>
              <label className="text-xs font-semibold block mb-1" style={{ color: 'var(--text-secondary)' }}>Slug (URL)</label>
              <input
                className="form-input text-sm"
                value={editing.slug}
                onChange={(e) => setEditing((p) => ({ ...p, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') }))}
                placeholder="my-form"
              />
            </div>
            <div>
              <label className="text-xs font-semibold block mb-1" style={{ color: 'var(--text-secondary)' }}>Business Name</label>
              <input
                className="form-input text-sm"
                value={editing.business_name || ''}
                onChange={(e) => setEditing((p) => ({ ...p, business_name: e.target.value }))}
                placeholder="Your Business"
              />
            </div>
            <div>
              <label className="text-xs font-semibold block mb-1" style={{ color: 'var(--text-secondary)' }}>Accent Color</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={editing.accent_color || '#2563eb'}
                  onChange={(e) => setEditing((p) => ({ ...p, accent_color: e.target.value }))}
                  className="w-10 h-10 rounded-xl border cursor-pointer"
                  style={{ borderColor: 'var(--border)', padding: 2 }}
                />
                <input
                  className="form-input text-sm flex-1"
                  value={editing.accent_color || '#2563eb'}
                  onChange={(e) => setEditing((p) => ({ ...p, accent_color: e.target.value }))}
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Steps list */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h2 className="font-bold text-base" style={{ fontFamily: 'Syne, sans-serif' }}>
                  Steps ({editing.steps.length})
                </h2>
                <button
                  onClick={() => setShowAddStep(!showAddStep)}
                  className="px-3 py-1.5 rounded-xl text-sm font-semibold text-white"
                  style={{ background: 'var(--accent)' }}
                >
                  + Add Step
                </button>
              </div>

              {showAddStep && (
                <div className="rounded-2xl p-3 mb-3 grid grid-cols-2 gap-2" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
                  {STEP_TYPES.map((t) => (
                    <button
                      key={t.type}
                      onClick={() => addStep(t.type)}
                      className="flex items-center gap-2 p-2.5 rounded-xl text-sm font-medium transition-all"
                      style={{ background: 'var(--surface-2)', color: 'var(--text-primary)' }}
                    >
                      <span>{t.icon}</span>
                      {t.label}
                    </button>
                  ))}
                </div>
              )}

              {editing.steps.length === 0 ? (
                <div className="text-center py-10 rounded-2xl" style={{ border: '2px dashed var(--border)' }}>
                  <p className="text-2xl mb-2">📋</p>
                  <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>No steps yet. Add one above.</p>
                </div>
              ) : (
                <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                  <SortableContext items={editing.steps.map((s) => s.id)} strategy={verticalListSortingStrategy}>
                    <div className="space-y-2">
                      {editing.steps.map((step) => (
                        <SortableStepItem
                          key={step.id}
                          step={step}
                          isSelected={selectedStepId === step.id}
                          onSelect={() => setSelectedStepId(step.id === selectedStepId ? null : step.id)}
                          onDelete={() => deleteStep(step.id)}
                        />
                      ))}
                    </div>
                  </SortableContext>
                </DndContext>
              )}
            </div>

            {/* Step editor panel */}
            <div className="rounded-2xl p-5" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
              <StepEditor
                step={selectedStep}
                onChange={updateStep}
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Forms list view
  return (
    <div style={{ background: 'var(--surface-2)', minHeight: '100vh' }}>
      <Navbar />

      <div className="max-w-4xl mx-auto px-4 pt-20 pb-16">
        <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-bold" style={{ fontFamily: 'Syne, sans-serif' }}>Form Builder</h1>
            <p className="text-sm mt-0.5" style={{ color: 'var(--text-secondary)' }}>
              Create and manage your intake forms
            </p>
          </div>
          <button onClick={startNew} className="px-4 py-2 rounded-xl text-sm font-semibold text-white" style={{ background: 'var(--accent)' }}>
            + New Form
          </button>
        </div>

        {loadingForms && (
          <div className="text-center py-12">
            <div className="w-7 h-7 border-2 border-t-transparent rounded-full animate-spin mx-auto" style={{ borderColor: 'var(--accent)', borderTopColor: 'transparent' }} />
          </div>
        )}

        {!loadingForms && forms.length === 0 && (
          <div className="text-center py-16">
            <p className="text-4xl mb-3">📋</p>
            <p className="font-semibold text-lg mb-1">No forms yet</p>
            <p className="text-sm mb-5" style={{ color: 'var(--text-secondary)' }}>Create your first form or start from a template.</p>
            <button onClick={startNew} className="btn-primary" style={{ width: 'auto', padding: '12px 28px' }}>
              Create New Form
            </button>
          </div>
        )}

        <div className="space-y-3">
          {forms.map((form) => (
            <div
              key={form.id}
              className="rounded-2xl p-5 flex items-center gap-4"
              style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
            >
              <div
                className="w-10 h-10 rounded-2xl shrink-0"
                style={{ background: form.accent_color ? `${form.accent_color}22` : 'var(--accent-light)' }}
              />
              <div className="flex-1 min-w-0">
                <p className="font-semibold truncate" style={{ color: 'var(--text-primary)' }}>{form.name}</p>
                <p className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>
                  /form/{form.slug} · {form.steps?.length || 0} steps
                  {form.business_name ? ` · ${form.business_name}` : ''}
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <a
                  href={`/form/${form.slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm px-3 py-1.5 rounded-xl border transition-all"
                  style={{ borderColor: 'var(--border)', color: 'var(--text-secondary)' }}
                >
                  View
                </a>
                <button
                  onClick={() => startEdit(form)}
                  className="text-sm px-3 py-1.5 rounded-xl border transition-all"
                  style={{ borderColor: 'var(--border)', color: 'var(--text-primary)', background: 'var(--surface-2)' }}
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(form.id)}
                  className="text-sm px-3 py-1.5 rounded-xl transition-all"
                  style={{ color: 'var(--error)', background: '#fee2e2' }}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

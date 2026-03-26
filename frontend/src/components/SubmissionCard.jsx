import { useState } from 'react';
import MediaPreview from './MediaPreview.jsx';
import { isImageMime, isAudioMime, isVideoMime } from '../utils/fileHelpers.js';
import { updateSubmission } from '../utils/api.js';

const STATUS_LABELS = { new: 'New', reviewed: 'Reviewed', archived: 'Archived' };
const STATUS_COLORS = {
  new: { bg: '#dbeafe', color: '#1d4ed8' },
  reviewed: { bg: '#dcfce7', color: '#15803d' },
  archived: { bg: '#f1f5f9', color: '#64748b' },
};

export default function SubmissionCard({ submission, form, onUpdate }) {
  const [expanded, setExpanded] = useState(false);
  const [notes, setNotes] = useState(submission.notes || '');
  const [saving, setSaving] = useState(false);

  const { responses, media_files } = submission;

  // Build a map of field -> media info for quick lookup
  const mediaByField = {};
  (media_files || []).forEach((mf) => {
    mediaByField[mf.fieldname] = mf;
  });

  async function handleStatusChange(status) {
    try {
      const updated = await updateSubmission(submission.id, { status });
      onUpdate(updated);
    } catch {
      // silently ignore
    }
  }

  async function handleNotesSave() {
    setSaving(true);
    try {
      const updated = await updateSubmission(submission.id, { notes });
      onUpdate(updated);
    } finally {
      setSaving(false);
    }
  }

  const statusStyle = STATUS_COLORS[submission.status] || STATUS_COLORS.new;

  // Derive form steps from the form object
  const steps = form?.steps || [];

  return (
    <div
      className="rounded-2xl border submission-print"
      style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between p-4 cursor-pointer select-none"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-3 min-w-0">
          <span
            className="px-2.5 py-0.5 rounded-full text-xs font-semibold shrink-0"
            style={{ background: statusStyle.bg, color: statusStyle.color }}
          >
            {STATUS_LABELS[submission.status] || 'New'}
          </span>
          <div className="min-w-0">
            <p className="font-semibold text-sm truncate" style={{ color: 'var(--text-primary)' }}>
              {responses.client_name || responses.name || 'Unknown'}{' '}
              {responses.email ? <span style={{ color: 'var(--text-secondary)', fontWeight: 400 }}>— {responses.email}</span> : null}
            </p>
            <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
              {new Date(submission.submitted_at).toLocaleString()}
              {form ? ` · ${form.name}` : ''}
              {' · ID: ' + submission.id.slice(0, 8)}
            </p>
          </div>
        </div>
        <span className="ml-3 text-lg" style={{ color: 'var(--text-secondary)' }}>
          {expanded ? '▲' : '▼'}
        </span>
      </div>

      {/* Expanded content */}
      {expanded && (
        <div className="border-t px-4 pb-4 pt-4" style={{ borderColor: 'var(--border)' }}>
          {/* Status controls */}
          <div className="flex gap-2 mb-4 flex-wrap no-print">
            {['new', 'reviewed', 'archived'].map((s) => (
              <button
                key={s}
                onClick={() => handleStatusChange(s)}
                className="px-3 py-1 rounded-xl text-xs font-semibold border transition-all"
                style={{
                  background: submission.status === s ? statusStyle.bg : 'transparent',
                  color: submission.status === s ? statusStyle.color : 'var(--text-secondary)',
                  borderColor: submission.status === s ? statusStyle.color : 'var(--border)',
                }}
              >
                {STATUS_LABELS[s]}
              </button>
            ))}
            <button
              onClick={() => window.print()}
              className="ml-auto px-3 py-1 rounded-xl text-xs font-semibold border transition-all no-print"
              style={{ borderColor: 'var(--border)', color: 'var(--text-secondary)' }}
            >
              Print / Export PDF
            </button>
          </div>

          {/* Responses */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
            {steps.map((step) => {
              const field = step.config?.field;
              if (!field) return null;
              const value = responses[field];
              const media = mediaByField[field];

              if (!value && !media) return null;

              return (
                <div key={step.id} className="rounded-xl p-3" style={{ background: 'var(--surface-2)' }}>
                  <p className="text-xs font-semibold mb-1.5" style={{ color: 'var(--text-secondary)' }}>
                    {step.config.label}
                  </p>
                  {media ? (
                    <MediaPreview
                      url={value || media.url}
                      mime={media.mimetype}
                      filename={media.filename}
                      className="max-h-48 w-full"
                    />
                  ) : (
                    <p className="text-sm" style={{ color: 'var(--text-primary)' }}>
                      {Array.isArray(value) ? value.join(', ') : value}
                    </p>
                  )}
                </div>
              );
            })}
          </div>

          {/* Any media not matched to a step */}
          {media_files?.filter((mf) => !steps.find((s) => s.config?.field === mf.fieldname)).length > 0 && (
            <div className="mb-4">
              <p className="text-xs font-semibold mb-2" style={{ color: 'var(--text-secondary)' }}>
                Additional Files
              </p>
              <div className="grid grid-cols-2 gap-2">
                {media_files
                  .filter((mf) => !steps.find((s) => s.config?.field === mf.fieldname))
                  .map((mf) => (
                    <MediaPreview
                      key={mf.filename}
                      url={mf.url}
                      mime={mf.mimetype}
                      filename={mf.filename}
                      className="max-h-40 w-full"
                    />
                  ))}
              </div>
            </div>
          )}

          {/* Notes */}
          <div>
            <label className="text-xs font-semibold block mb-1.5" style={{ color: 'var(--text-secondary)' }}>
              Private Notes
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="form-input resize-none text-sm"
              rows={3}
              placeholder="Add notes visible only to you..."
            />
            <button
              onClick={handleNotesSave}
              disabled={saving}
              className="mt-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all no-print"
              style={{ background: 'var(--accent)', color: 'white', opacity: saving ? 0.6 : 1 }}
            >
              {saving ? 'Saving...' : 'Save Notes'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

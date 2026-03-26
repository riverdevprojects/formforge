import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar.jsx';
import SubmissionCard from '../components/SubmissionCard.jsx';
import { listSubmissions, listForms, getApiKey } from '../utils/api.js';

const STATUS_OPTIONS = [
  { value: '', label: 'All Statuses' },
  { value: 'new', label: 'New' },
  { value: 'reviewed', label: 'Reviewed' },
  { value: 'archived', label: 'Archived' },
];

export default function Dashboard() {
  const [authed, setAuthed] = useState(!!localStorage.getItem('sf_api_key'));
  const [keyInput, setKeyInput] = useState('');
  const [authError, setAuthError] = useState(null);

  const [forms, setForms] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filterForm, setFilterForm] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  useEffect(() => {
    if (authed) loadData();
  }, [authed, filterForm, filterStatus]);

  async function loadData() {
    setLoading(true);
    try {
      const [subs, fms] = await Promise.all([
        listSubmissions({ form_id: filterForm || undefined, status: filterStatus || undefined }),
        listForms(),
      ]);
      setSubmissions(subs);
      setForms(fms);
    } catch (err) {
      if (err.status === 401) {
        localStorage.removeItem('sf_api_key');
        setAuthed(false);
        setAuthError('Invalid API key. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  }

  function handleLogin(e) {
    e.preventDefault();
    if (!keyInput.trim()) return;
    localStorage.setItem('sf_api_key', keyInput.trim());
    setAuthed(true);
    setAuthError(null);
  }

  function handleLogout() {
    localStorage.removeItem('sf_api_key');
    setAuthed(false);
    setKeyInput('');
    setSubmissions([]);
  }

  function handleSubmissionUpdate(updated) {
    setSubmissions((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));
  }

  const formMap = Object.fromEntries(forms.map((f) => [f.id, f]));

  if (!authed) {
    return (
      <div style={{ background: 'var(--surface-2)', minHeight: '100vh' }}>
        <Navbar />
        <div className="flex items-center justify-center min-h-screen px-4">
          <div className="step-card w-full max-w-sm">
            <h1 className="text-2xl font-bold mb-1" style={{ fontFamily: 'Syne, sans-serif' }}>Dashboard</h1>
            <p className="text-sm mb-5" style={{ color: 'var(--text-secondary)' }}>
              Enter your API key to access submissions.
            </p>

            {authError && (
              <div className="rounded-xl p-3 mb-4 text-sm" style={{ background: '#fee2e2', color: 'var(--error)' }}>
                {authError}
              </div>
            )}

            <form onSubmit={handleLogin}>
              <input
                type="password"
                value={keyInput}
                onChange={(e) => setKeyInput(e.target.value)}
                className="form-input mb-3"
                placeholder="API key"
                autoFocus
              />
              <button type="submit" className="btn-primary py-3">
                Access Dashboard
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ background: 'var(--surface-2)', minHeight: '100vh' }}>
      <Navbar />

      <div className="max-w-5xl mx-auto px-4 pt-20 pb-16">
        <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-bold" style={{ fontFamily: 'Syne, sans-serif' }}>Submissions</h1>
            <p className="text-sm mt-0.5" style={{ color: 'var(--text-secondary)' }}>
              {submissions.length} total
            </p>
          </div>
          <button
            onClick={handleLogout}
            className="text-sm px-3 py-1.5 rounded-xl border transition-all"
            style={{ borderColor: 'var(--border)', color: 'var(--text-secondary)' }}
          >
            Sign out
          </button>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3 mb-5">
          <select
            value={filterForm}
            onChange={(e) => setFilterForm(e.target.value)}
            className="form-input"
            style={{ width: 'auto', minWidth: 160 }}
          >
            <option value="">All Forms</option>
            {forms.map((f) => (
              <option key={f.id} value={f.id}>{f.name}</option>
            ))}
          </select>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="form-input"
            style={{ width: 'auto', minWidth: 160 }}
          >
            {STATUS_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>

          <button
            onClick={loadData}
            className="px-4 py-2 rounded-xl text-sm font-semibold border transition-all"
            style={{ borderColor: 'var(--border)', background: 'var(--surface)', color: 'var(--text-primary)' }}
          >
            Refresh
          </button>
        </div>

        {loading && (
          <div className="text-center py-12">
            <div className="w-7 h-7 border-2 border-t-transparent rounded-full animate-spin mx-auto" style={{ borderColor: 'var(--accent)', borderTopColor: 'transparent' }} />
          </div>
        )}

        {!loading && submissions.length === 0 && (
          <div className="text-center py-16">
            <p className="text-4xl mb-3">📭</p>
            <p className="font-semibold text-lg mb-1">No submissions yet</p>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              Submissions will appear here once clients complete a form.
            </p>
          </div>
        )}

        <div className="space-y-3">
          {submissions.map((sub) => (
            <SubmissionCard
              key={sub.id}
              submission={sub}
              form={formMap[sub.form_id]}
              onUpdate={handleSubmissionUpdate}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

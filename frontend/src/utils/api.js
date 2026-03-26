const BASE = '/api';

function getApiKey() {
  return localStorage.getItem('sf_api_key') || '';
}

function authHeaders() {
  const key = getApiKey();
  return key ? { 'x-api-key': key } : {};
}

async function request(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, {
    ...options,
    headers: {
      ...authHeaders(),
      ...(options.headers || {}),
    },
  });

  if (!res.ok) {
    let err;
    try {
      const data = await res.json();
      err = new Error(data.error || `HTTP ${res.status}`);
      err.status = res.status;
      err.details = data.details;
    } catch {
      err = new Error(`HTTP ${res.status}`);
      err.status = res.status;
    }
    throw err;
  }

  return res.json();
}

// ── Forms ────────────────────────────────────────────────────────────────────

export function getFormBySlug(slug) {
  return request(`/forms/${slug}`);
}

export function listForms() {
  return request('/forms');
}

export function createForm(formData) {
  return request('/forms', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(formData),
  });
}

export function updateForm(id, formData) {
  return request(`/forms/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(formData),
  });
}

export function deleteForm(id) {
  return request(`/forms/${id}`, { method: 'DELETE' });
}

// ── Submissions ───────────────────────────────────────────────────────────────

export function listSubmissions(filters = {}) {
  const params = new URLSearchParams();
  if (filters.form_id) params.set('form_id', filters.form_id);
  if (filters.status) params.set('status', filters.status);
  const qs = params.toString();
  return request(`/submissions${qs ? `?${qs}` : ''}`);
}

export function getSubmission(id) {
  return request(`/submissions/${id}`);
}

export async function createSubmission(formId, responses, files) {
  const fd = new FormData();
  fd.append('form_id', formId);

  // Separate text responses from file responses
  const textResponses = {};
  Object.entries(responses).forEach(([key, value]) => {
    if (value instanceof Blob || value instanceof File) {
      fd.append(key, value, files?.[key]?.name || `${key}.bin`);
    } else {
      textResponses[key] = value;
    }
  });

  fd.append('responses', JSON.stringify(textResponses));

  const res = await fetch(`${BASE}/submissions`, {
    method: 'POST',
    body: fd,
  });

  if (!res.ok) {
    let err;
    try {
      const data = await res.json();
      err = new Error(data.error || `HTTP ${res.status}`);
      err.status = res.status;
    } catch {
      err = new Error(`HTTP ${res.status}`);
    }
    throw err;
  }

  return res.json();
}

export function updateSubmission(id, data) {
  return request(`/submissions/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
}

export { getApiKey };

const { getDb } = require('./db');

function findAll({ form_id, status } = {}) {
  const db = getDb();
  let query = 'SELECT * FROM submissions WHERE 1=1';
  const params = [];

  if (form_id) {
    query += ' AND form_id = ?';
    params.push(form_id);
  }
  if (status) {
    query += ' AND status = ?';
    params.push(status);
  }

  query += ' ORDER BY submitted_at DESC';
  return db.prepare(query).all(...params);
}

function findById(id) {
  const db = getDb();
  return db.prepare('SELECT * FROM submissions WHERE id = ?').get(id);
}

function create({ id, form_id, responses, media_files }) {
  const db = getDb();
  db.prepare(`
    INSERT INTO submissions (id, form_id, responses, media_files)
    VALUES (?, ?, ?, ?)
  `).run(
    id,
    form_id,
    typeof responses === 'string' ? responses : JSON.stringify(responses),
    Array.isArray(media_files) ? JSON.stringify(media_files) : (media_files || '[]'),
  );
  return findById(id);
}

function update(id, { status, notes }) {
  const db = getDb();
  const existing = findById(id);
  if (!existing) return null;

  db.prepare(`
    UPDATE submissions SET
      status = ?,
      notes = ?
    WHERE id = ?
  `).run(
    status !== undefined ? status : existing.status,
    notes !== undefined ? notes : existing.notes,
    id,
  );
  return findById(id);
}

module.exports = { findAll, findById, create, update };

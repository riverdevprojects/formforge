const Database = require('better-sqlite3');
const { getDb } = require('./db');

function fieldValues(row) {
  const values = new Map(Object.entries(JSON.parse(row.responses) || {}));
  const counts = new Map();
  for (const file of JSON.parse(row.media_files || '[]')) {
    counts.set(file.fieldname, (counts.get(file.fieldname) || 0) + 1);
  }
  for (const [key, count] of counts) values.set(key, count);
  return values;
}

// The header scan and row stream share a read snapshot, not the app's write connection.
function* exportRows() {
  const db = new Database(getDb().name, { readonly: true });
  try {
    db.exec('BEGIN');
    const fields = new Set();
    for (const row of db.prepare('SELECT responses, media_files FROM submissions').iterate()) {
      for (const field of fieldValues(row).keys()) fields.add(field);
    }
    const keys = [...fields].sort();
    yield ['id', 'form_name', 'status', 'created_at', ...keys];

    const rows = db.prepare(`
      SELECT s.id, f.name AS form_name, s.status, s.submitted_at, s.responses, s.media_files
      FROM submissions s JOIN forms f ON f.id = s.form_id
      ORDER BY s.submitted_at DESC, s.id
    `);
    for (const row of rows.iterate()) {
      const values = fieldValues(row);
      yield [row.id, row.form_name, row.status, row.submitted_at, ...keys.map((key) => values.get(key))];
    }
  } finally {
    db.close();
  }
}

module.exports = { exportRows };

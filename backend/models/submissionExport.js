const Database = require('better-sqlite3');
const { setImmediate: yieldTurn } = require('node:timers/promises');
const { getDb } = require('./db');

const MAX_FIELDS = 200;
const METADATA = ['id', 'form_name', 'status', 'created_at'];
const EXTRA = 'extra_responses_json';

function fieldValues(row) {
  const values = new Map(Object.entries(JSON.parse(row.responses) || {}));
  const counts = new Map();
  for (const file of JSON.parse(row.media_files || '[]')) {
    counts.set(file.fieldname, (counts.get(file.fieldname) || 0) + 1);
  }
  for (const [key, count] of counts) values.set(key, count);
  return values;
}

function responseHeaders(keys) {
  const used = new Set([...METADATA, EXTRA]);
  return keys.map((key) => {
    const base = 'resp_' + key.replace(/[^A-Za-z0-9_]/g, '_');
    let name = base;
    let suffix = 2;
    while (used.has(name.toLowerCase())) name = `${base}_${suffix++}`;
    used.add(name.toLowerCase());
    return name;
  });
}

// Both passes use one read snapshot, independent of the app's write connection.
async function* exportRows() {
  const db = new Database(getDb().name, { readonly: true });
  try {
    db.exec('BEGIN');
    const fields = new Set();
    let scanned = 0;
    scan: for (const row of db.prepare('SELECT responses, media_files FROM submissions ORDER BY rowid').iterate()) {
      for (const key of fieldValues(row).keys()) {
        fields.add(key);
        if (fields.size === MAX_FIELDS) break scan;
      }
      if (++scanned % 32 === 0) await yieldTurn();
    }
    const keys = [...fields];
    yield [...METADATA, ...responseHeaders(keys), EXTRA];

    const rows = db.prepare(`
      SELECT s.id, f.name AS form_name, s.status, s.submitted_at, s.responses, s.media_files
      FROM submissions s JOIN forms f ON f.id = s.form_id
      ORDER BY s.submitted_at DESC, s.id
    `);
    for (const row of rows.iterate()) {
      const values = fieldValues(row);
      const extra = Object.create(null);
      for (const [key, value] of values) if (!fields.has(key)) extra[key] = value;
      yield [row.id, row.form_name, row.status, row.submitted_at, ...keys.map((key) => values.get(key)), extra];
    }
  } finally {
    db.close();
  }
}

module.exports = { exportRows };

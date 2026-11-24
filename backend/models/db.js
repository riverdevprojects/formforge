const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const DB_PATH = process.env.DB_PATH
  ? path.resolve(process.env.DB_PATH)
  : path.join(__dirname, '..', 'db', 'smartforms.db');

let db;

function getDb() {
  if (!db) {
    throw new Error('Database not initialized. Call initDb() first.');
  }
  return db;
}

function initDb() {
  fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });
  db = new Database(DB_PATH);
  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');

  runMigrations();
  return db;
}

function runMigrations() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS forms (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT,
      slug TEXT UNIQUE NOT NULL,
      steps TEXT NOT NULL,
      business_name TEXT,
      accent_color TEXT DEFAULT '#2563eb',
      logo_url TEXT,
      is_active INTEGER DEFAULT 1,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS submissions (
      id TEXT PRIMARY KEY,
      form_id TEXT NOT NULL,
      responses TEXT NOT NULL,
      media_files TEXT DEFAULT '[]',
      submitted_at TEXT DEFAULT (datetime('now')),
      status TEXT DEFAULT 'new',
      notes TEXT,
      FOREIGN KEY (form_id) REFERENCES forms(id)
    );
  `);
}

module.exports = { initDb, getDb };

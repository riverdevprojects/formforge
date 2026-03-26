const { getDb } = require('./db');

function findAll() {
  const db = getDb();
  return db.prepare('SELECT * FROM forms ORDER BY created_at DESC').all();
}

function findBySlug(slug) {
  const db = getDb();
  return db.prepare('SELECT * FROM forms WHERE slug = ? AND is_active = 1').get(slug);
}

function findById(id) {
  const db = getDb();
  return db.prepare('SELECT * FROM forms WHERE id = ?').get(id);
}

function create({ id, name, description, slug, steps, business_name, accent_color, logo_url }) {
  const db = getDb();
  db.prepare(`
    INSERT INTO forms (id, name, description, slug, steps, business_name, accent_color, logo_url)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    id,
    name,
    description || null,
    slug,
    typeof steps === 'string' ? steps : JSON.stringify(steps),
    business_name || null,
    accent_color || '#2563eb',
    logo_url || null,
  );
  return findById(id);
}

function update(id, { name, description, slug, steps, business_name, accent_color, logo_url, is_active }) {
  const db = getDb();
  const existing = findById(id);
  if (!existing) return null;

  db.prepare(`
    UPDATE forms SET
      name = ?,
      description = ?,
      slug = ?,
      steps = ?,
      business_name = ?,
      accent_color = ?,
      logo_url = ?,
      is_active = ?
    WHERE id = ?
  `).run(
    name !== undefined ? name : existing.name,
    description !== undefined ? description : existing.description,
    slug !== undefined ? slug : existing.slug,
    steps !== undefined ? (typeof steps === 'string' ? steps : JSON.stringify(steps)) : existing.steps,
    business_name !== undefined ? business_name : existing.business_name,
    accent_color !== undefined ? accent_color : existing.accent_color,
    logo_url !== undefined ? logo_url : existing.logo_url,
    is_active !== undefined ? is_active : existing.is_active,
    id,
  );
  return findById(id);
}

function remove(id) {
  const db = getDb();
  const result = db.prepare('DELETE FROM forms WHERE id = ?').run(id);
  return result.changes > 0;
}

function countAll() {
  const db = getDb();
  return db.prepare('SELECT COUNT(*) as count FROM forms').get().count;
}

module.exports = { findAll, findBySlug, findById, create, update, remove, countAll };

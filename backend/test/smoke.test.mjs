import test from 'node:test';
import assert from 'node:assert/strict';
import { once } from 'node:events';
import { mkdtemp, rm } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';

test('seeded form, public intake, authenticated list and CSV download', async (t) => {
  const dir = await mkdtemp(path.join(os.tmpdir(), 'smartforms-'));
  Object.assign(process.env, {
    DB_PATH: path.join(dir, 'db', 'smoke.db'),
    UPLOAD_DIR: path.join(dir, 'uploads'),
    DASHBOARD_API_KEY: 'smoke-key',
    SMTP_HOST: '',
    NOTIFY_TO: '',
  });
  const { start } = await import('../server.js');
  const { getDb } = await import('../models/db.js');
  const server = start(0);
  t.after(async () => {
    await new Promise((resolve) => server.close(resolve));
    getDb().close();
    await rm(dir, { recursive: true, force: true });
  });
  await once(server, 'listening');
  const api = `http://127.0.0.1:${server.address().port}/api`;
  const headers = { 'x-api-key': process.env.DASHBOARD_API_KEY };
  const health = await fetch(`${api}/health`);
  assert.equal(health.status, 200);
  assert.deepEqual(await health.json(), { status: 'ok' });

  const seeded = await fetch(`${api}/forms/device-repair`);
  assert.equal(seeded.status, 200);
  const form = await seeded.json();
  assert.equal(form.slug, 'device-repair');
  assert.equal((await fetch(`${api}/submissions`)).status, 401);
  assert.equal((await fetch(`${api}/submissions/export.csv`)).status, 401);

  const body = new FormData();
  const name = 'Lee, "Jo"';
  body.append('form_id', form.id);
  body.append('responses', JSON.stringify({ client_name: name }));
  const intake = await fetch(`${api}/submissions`, { method: 'POST', body });
  assert.equal(intake.status, 201);
  const created = await intake.json();
  const list = await fetch(`${api}/submissions`, { headers });
  assert.equal(list.status, 200);
  assert.equal((await list.json()).find((s) => s.id === created.id)?.responses.client_name, name);

  const csv = await fetch(`${api}/submissions/export.csv`, { headers });
  assert.equal(csv.status, 200);
  assert.match(csv.headers.get('content-type'), /^text\/csv\b/);
  assert.equal(await csv.text(), 'id,form_name,status,created_at,client_name\r\n' +
    `${created.id},${form.name},new,${created.submitted_at},"Lee, ""Jo"""\r\n`);
});

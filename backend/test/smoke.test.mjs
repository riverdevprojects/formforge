import test from 'node:test';
import assert from 'node:assert/strict';
import { once } from 'node:events';
import { spawnSync } from 'node:child_process';
import { mkdtemp, readdir, rm } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import os from 'node:os';
import path from 'node:path';
import nodemailer from 'nodemailer';

test('production refuses to listen without a dashboard key', async (t) => {
  const dir = await mkdtemp(path.join(os.tmpdir(), 'smartforms-start-'));
  t.after(() => rm(dir, { recursive: true, force: true }));
  const env = { ...process.env, NODE_ENV: 'production', PORT: '0', DB_PATH: path.join(dir, 'test.db'), UPLOAD_DIR: path.join(dir, 'uploads') };
  delete env.DASHBOARD_API_KEY;
  const result = spawnSync(process.execPath, [fileURLToPath(new URL('../server.js', import.meta.url))], {
    cwd: dir, env, timeout: 8000, encoding: 'utf8',
  });
  assert.ifError(result.error);
  assert.equal(result.status, 1);
  assert.match(result.stderr, /DASHBOARD_API_KEY is required in production/);
  assert.doesNotMatch(result.stdout, /API running/);
  assert.deepEqual(await readdir(dir), []);
});

test('public intake, upload ownership, notifications and dashboard export', { timeout: 15000 }, async (t) => {
  const dir = await mkdtemp(path.join(os.tmpdir(), 'smartforms-'));
  Object.assign(process.env, {
    DB_PATH: path.join(dir, 'db', 'smoke.db'), UPLOAD_DIR: path.join(dir, 'uploads'),
    DASHBOARD_API_KEY: 'smoke-key', SMTP_HOST: 'fixture.invalid', SMTP_PORT: '587', SMTP_SECURE: 'false',
    NOTIFY_TO: 'office@example.test', PUBLIC_BASE_URL: 'https://forms.example.test',
  });
  const messages = [];
  let fail = false;
  const createTransport = t.mock.method(nodemailer, 'createTransport', () => ({
    async sendMail(msg) {
      messages.push(msg);
      if (fail) throw new Error('fixture delivery failure');
      return { accepted: [msg.to] };
    },
  }));
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
  const count = () => getDb().prepare('SELECT count(*) AS n FROM submissions').get().n;
  assert.deepEqual(await (await fetch(`${api}/health`)).json(), { status: 'ok' });
  const form = await (await fetch(`${api}/forms/device-repair`)).json();
  assert.equal(form.slug, 'device-repair');
  assert.equal((await fetch(`${api}/submissions`)).status, 401);
  assert.equal((await fetch(`${api}/submissions/export.csv`)).status, 401);

  function post(responses, file = false) {
    const body = new FormData();
    body.append('form_id', form.id);
    body.append('responses', responses);
    if (file) body.append('photo', new Blob(['private-photo-content'], { type: 'image/png' }), 'photo.png');
    return fetch(`${api}/submissions`, { method: 'POST', body });
  }
  const rejected = await post('{', true);
  assert.equal(rejected.status, 422);
  assert.equal(count(), 0);
  assert.deepEqual(await readdir(process.env.UPLOAD_DIR), []);

  const name = 'Lee, "Jo"';
  const intake = await post(JSON.stringify({ client_name: name, status: 'client status', ' =key': ' \t=1', ' _key': '+2', note: '\u0001@text' }), true);
  assert.equal(intake.status, 201);
  const created = await intake.json();
  const list = await fetch(`${api}/submissions`, { headers });
  assert.equal(list.status, 200);
  assert.equal((await list.json()).find((s) => s.id === created.id)?.responses.client_name, name);
  assert.deepEqual(await readdir(process.env.UPLOAD_DIR), [created.media_files[0].filename]);
  assert.equal(messages.length, 1);
  assert.equal(messages[0].to, process.env.NOTIFY_TO);
  assert.ok(messages[0].text.includes(created.id) && messages[0].text.includes(name));
  assert.match(messages[0].text, /Attachments: image: 1/);
  assert.equal(messages[0].attachments, undefined);
  assert.doesNotMatch(JSON.stringify(messages[0]), /private-photo-content|\/api\/media\//);

  async function download() {
    const csv = await fetch(`${api}/submissions/export.csv`, { headers });
    assert.equal(csv.status, 200);
    assert.match(csv.headers.get('content-type'), /^text\/csv\b/);
    return csv.text();
  }
  assert.equal(await download(), 'id,form_name,status,created_at,resp_client_name,resp_status,resp___key,resp___key_2,resp_note,resp_photo,extra_responses_json\r\n' +
    `${created.id},${form.name},new,${created.submitted_at},"Lee, ""Jo""",client status,' \t=1,'+2,'\u0001@text,1,{}\r\n`);

  fail = true;
  const wide = Object.fromEntries(Array.from({ length: 195 }, (_, i) => [`field${i}`, i]));
  const second = await post(JSON.stringify(wide));
  assert.equal(second.status, 201);
  const saved = await second.json();
  assert.equal(count(), 2);
  const [columns, ...rows] = (await download()).split('\r\n');
  const names = columns.split(',');
  assert.equal(names.length, 205);
  assert.equal(new Set(names).size, names.length);
  assert.deepEqual(names.slice(-2), ['resp_field193', 'extra_responses_json']);
  assert.ok(rows.find(row => row.startsWith(saved.id + ',')).endsWith(',193,"{""field194"":194}"'));
  assert.equal(messages.length, 2);
  assert.ok(messages[1].text.includes(saved.id));
  assert.equal(createTransport.mock.callCount(), 1);
  const [opts] = createTransport.mock.calls[0].arguments;
  assert.equal(opts.pool, true);
  assert.equal(opts.maxConnections, 2);
  assert.equal(opts.maxMessages, 100);
  assert.equal(opts.requireTLS, true);
});

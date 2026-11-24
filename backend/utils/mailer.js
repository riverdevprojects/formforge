const nodemailer = require('nodemailer');
const { setImmediate: yieldTurn } = require('node:timers/promises');

const MAX_CONNECTIONS = 2;
const MAX_PENDING = 32; // Total admitted jobs, including active deliveries.
let pending = 0;
let transport;

function getTransport() {
  if (!transport) {
    const { SMTP_HOST, SMTP_PORT, SMTP_SECURE, SMTP_USER, SMTP_PASS } = process.env;
    const secure = SMTP_SECURE === 'true';
    transport = nodemailer.createTransport({
      host: SMTP_HOST,
      port: Number(SMTP_PORT || 587),
      secure,
      requireTLS: !secure,
      pool: true,
      maxConnections: MAX_CONNECTIONS,
      maxMessages: 100,
      connectionTimeout: 10000,
      greetingTimeout: 10000,
      socketTimeout: 30000,
      auth: SMTP_USER ? { user: SMTP_USER, pass: SMTP_PASS } : undefined,
    });
  }
  return transport;
}

function escapeHtml(value) {
  return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function message(form, submission) {
  const { SMTP_USER, NOTIFY_FROM, NOTIFY_TO, PUBLIC_BASE_URL } = process.env;
  const fields = new Set();
  const counts = new Map();
  for (const file of submission.media_files) {
    fields.add(file.fieldname);
    const kind = file.mimetype.split('/')[0];
    counts.set(kind, (counts.get(kind) || 0) + 1);
  }
  const lines = [
    `Form: ${form.name}`, `Submission ID: ${submission.id}`, `Submitted at: ${submission.submitted_at} UTC`, '',
  ];
  for (const [key, value] of Object.entries(submission.responses)) {
    if (!fields.has(key)) lines.push(`${key}: ${typeof value === 'string' ? value : JSON.stringify(value)}`);
  }
  lines.push('', `Attachments: ${Array.from(counts, ([kind, count]) => `${kind}: ${count}`).join(', ') || 'none'}`);
  const body = lines.join('\n');
  const link = `${(PUBLIC_BASE_URL || 'http://localhost:5173').replace(/\/+$/, '')}/dashboard`;
  return {
    from: NOTIFY_FROM || SMTP_USER || 'smartforms@localhost',
    to: NOTIFY_TO,
    subject: `New submission: ${form.name}`,
    text: `${body}\n\nDashboard: ${link}`,
    html: `<pre>${escapeHtml(body)}</pre><p><a href="${escapeHtml(link)}">Open dashboard</a></p>`,
  };
}

async function sendNewSubmissionNotification(form, submission) {
  if (!process.env.SMTP_HOST || !process.env.NOTIFY_TO) return;
  if (pending >= MAX_PENDING) {
    console.warn('New submission notification skipped: mail queue full.');
    return;
  }
  pending++;
  try {
    await yieldTurn();
    await getTransport().sendMail(message(form, submission));
  } finally {
    pending--;
  }
}

module.exports = { sendNewSubmissionNotification };

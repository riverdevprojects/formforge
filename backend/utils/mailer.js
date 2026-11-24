const nodemailer = require('nodemailer');

function escapeHtml(value) {
  return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

async function sendNewSubmissionNotification(form, submission) {
  const { SMTP_HOST, SMTP_PORT, SMTP_SECURE, SMTP_USER, SMTP_PASS, NOTIFY_FROM, NOTIFY_TO, PUBLIC_BASE_URL } = process.env;
  if (!SMTP_HOST || !NOTIFY_TO) {
    console.log('New submission notification skipped: SMTP_HOST or NOTIFY_TO not configured.');
    return;
  }

  const transport = nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT || 587),
    secure: SMTP_SECURE === 'true',
    auth: SMTP_USER ? { user: SMTP_USER, pass: SMTP_PASS } : undefined,
  });
  const fields = new Set();
  const counts = new Map();
  for (const file of submission.media_files) {
    fields.add(file.fieldname);
    const kind = file.mimetype.split('/')[0];
    counts.set(kind, (counts.get(kind) || 0) + 1);
  }
  const lines = [
    `Form: ${form.name}`,
    `Submission ID: ${submission.id}`,
    `Submitted at: ${submission.submitted_at} UTC`,
    '',
  ];
  for (const [key, value] of Object.entries(submission.responses)) {
    if (!fields.has(key)) lines.push(`${key}: ${typeof value === 'string' ? value : JSON.stringify(value)}`);
  }
  lines.push('', `Attachments: ${Array.from(counts, ([kind, count]) => `${kind}: ${count}`).join(', ') || 'none'}`);
  const body = lines.join('\n');
  const link = `${(PUBLIC_BASE_URL || 'http://localhost:5173').replace(/\/+$/, '')}/dashboard`;
  await transport.sendMail({
    from: NOTIFY_FROM || SMTP_USER || 'smartforms@localhost',
    to: NOTIFY_TO,
    subject: `New submission: ${form.name}`,
    text: `${body}\n\nDashboard: ${link}`,
    html: `<pre>${escapeHtml(body)}</pre><p><a href="${escapeHtml(link)}">Open dashboard</a></p>`,
  });
}

module.exports = { sendNewSubmissionNotification };

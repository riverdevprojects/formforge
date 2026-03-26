require('dotenv').config();

const express = require('express');
const cors = require('cors');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const { initDb } = require('./models/db');
const Form = require('./models/Form');
const { ensureUploadDir } = require('./utils/storage');

const formsRouter = require('./routes/forms');
const submissionsRouter = require('./routes/submissions');
const mediaRouter = require('./routes/media');

const app = express();
const PORT = process.env.PORT || 3001;

// ── Middleware ──────────────────────────────────────────────────────────────

app.use(cors({
  origin: process.env.NODE_ENV === 'production'
    ? false
    : ['http://localhost:5173', 'http://127.0.0.1:5173'],
  credentials: true,
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

if (process.env.NODE_ENV !== 'production') {
  app.use((req, _res, next) => {
    console.log(`${req.method} ${req.path}`);
    next();
  });
}

// ── Static files ────────────────────────────────────────────────────────────

const FRONTEND_DIST = path.join(__dirname, '..', 'frontend', 'dist');
const fs = require('fs');
if (fs.existsSync(FRONTEND_DIST)) {
  app.use(express.static(FRONTEND_DIST));
}

// ── API Routes ───────────────────────────────────────────────────────────────

app.use('/api/forms', formsRouter);
app.use('/api/submissions', submissionsRouter);
app.use('/api/media', mediaRouter);

app.get('/api/health', (_req, res) => res.json({ status: 'ok' }));

// ── SPA fallback (production) ────────────────────────────────────────────────

if (fs.existsSync(FRONTEND_DIST)) {
  app.get('*', (_req, res) => {
    res.sendFile(path.join(FRONTEND_DIST, 'index.html'));
  });
}

// ── Global error handler ─────────────────────────────────────────────────────

app.use((err, req, res, _next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'An unexpected error occurred.' });
});

// ── Seed default forms ────────────────────────────────────────────────────────

function seedDefaultForms() {
  const count = Form.countAll();
  if (count > 0) return;

  console.log('Seeding default forms...');

  const deviceRepairSteps = [
    { id: 'step-1', type: 'text', config: { label: "What's your name?", placeholder: 'Full name', field: 'client_name', required: true, validation: 'name' } },
    { id: 'step-2', type: 'text', config: { label: 'Best email to reach you?', placeholder: 'you@email.com', field: 'email', required: true, validation: 'email' } },
    { id: 'step-3', type: 'text', config: { label: 'Phone number', placeholder: '(555) 000-0000', field: 'phone', required: false, validation: 'phone' } },
    { id: 'step-4', type: 'multichoice', config: { label: 'What type of device needs repair?', field: 'device_type', required: true, options: ['MacBook', 'Windows Laptop', 'Desktop PC', 'iPhone', 'iPad', 'Other'] } },
    { id: 'step-5', type: 'text', config: { label: 'Describe what\'s happening with your device.', placeholder: 'e.g. Screen cracked, won\'t turn on, running slow...', field: 'problem_description', required: true, multiline: true } },
    { id: 'step-6', type: 'multichoice', config: { label: 'How long has this been happening?', field: 'issue_duration', required: true, options: ['Just started', 'Few days', 'Over a week', 'Over a month'] } },
    { id: 'step-7', type: 'multichoice', config: { label: 'Has the device been dropped or had liquid damage?', field: 'physical_damage', required: true, options: ['Yes – dropped', 'Yes – liquid damage', 'No'] } },
    { id: 'step-8', type: 'photo', config: { label: 'Take a photo of the front of your device.', hint: 'Make sure the whole screen is visible.', field: 'photo_front', required: true, maxSizeMB: 10 } },
    { id: 'step-9', type: 'photo', config: { label: 'Take a photo showing the damage or issue (if visible).', hint: 'Get as close as possible.', field: 'photo_damage', required: false, maxSizeMB: 10 } },
    { id: 'step-10', type: 'text', config: { label: 'Anything else we should know?', placeholder: 'Optional additional details...', field: 'additional_notes', required: false, multiline: true } },
  ];

  const dataRecoverySteps = [
    { id: 'step-1', type: 'text', config: { label: "What's your name?", placeholder: 'Full name', field: 'client_name', required: true, validation: 'name' } },
    { id: 'step-2', type: 'text', config: { label: 'Best email to reach you?', placeholder: 'you@email.com', field: 'email', required: true, validation: 'email' } },
    { id: 'step-3', type: 'text', config: { label: 'Phone number', placeholder: '(555) 000-0000', field: 'phone', required: false, validation: 'phone' } },
    { id: 'step-4', type: 'multichoice', config: { label: 'What type of drive needs recovery?', field: 'drive_type', required: true, options: ['Internal HDD', 'Internal SSD', 'External HDD', 'External SSD', 'USB Flash Drive', 'Memory Card'] } },
    { id: 'step-5', type: 'text', config: { label: 'What data needs to be recovered?', placeholder: 'e.g. Family photos, work documents, client files...', field: 'data_description', required: true, multiline: true } },
    { id: 'step-6', type: 'multichoice', config: { label: 'What happened to the drive?', field: 'failure_reason', required: true, options: ['Accidentally deleted', 'Drive fell/dropped', 'Water damage', "Won't mount/be recognized", 'Making noise', 'Unknown'] } },
    { id: 'step-7', type: 'audio', config: { label: 'Record the sound of your drive.', hint: 'Press record and place your device near the drive while it\'s powered on. Let it record for 10–15 seconds of the drive attempting to spin up. This helps us diagnose the problem remotely.', field: 'drive_audio', required: false, maxMinutes: 2 } },
    { id: 'step-8', type: 'photo', config: { label: 'Photo of the drive label/sticker.', hint: 'Show the model number and serial number clearly.', field: 'photo_label', required: true, maxSizeMB: 10 } },
    { id: 'step-9', type: 'photo', config: { label: 'Photo of any visible physical damage.', hint: 'Scratches, cracks, burn marks, connector damage.', field: 'photo_damage', required: false, maxSizeMB: 10 } },
    { id: 'step-10', type: 'multichoice', config: { label: 'What operating system was it connected to?', field: 'operating_system', required: true, options: ['Mac', 'Windows', 'Linux', 'Other'] } },
    { id: 'step-11', type: 'multichoice', config: { label: 'Approximate data size?', field: 'data_size', required: false, options: ['Under 100GB', '100–500GB', '500GB–2TB', 'Over 2TB', "Don't know"] } },
  ];

  Form.create({
    id: uuidv4(),
    name: 'Device Repair Intake',
    description: 'Tell us about your device so we can help you faster.',
    slug: 'device-repair',
    steps: deviceRepairSteps,
    business_name: 'TechFix Pro',
    accent_color: '#1d4ed8',
  });

  Form.create({
    id: uuidv4(),
    name: 'Data Recovery Intake',
    description: 'Help us understand your data recovery situation.',
    slug: 'data-recovery',
    steps: dataRecoverySteps,
    business_name: 'DataRescue Labs',
    accent_color: '#7c3aed',
  });

  console.log('Default forms seeded: device-repair, data-recovery');
}

// ── Startup ───────────────────────────────────────────────────────────────────

try {
  ensureUploadDir();
  initDb();
  seedDefaultForms();
} catch (err) {
  console.error('Startup error:', err);
  process.exit(1);
}

app.listen(PORT, () => {
  console.log(`SmartForms API running on http://localhost:${PORT}`);
});

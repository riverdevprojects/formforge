const { v4: uuidv4 } = require('uuid');
const { unlinkSync } = require('node:fs');
const { Readable, pipeline } = require('stream');
const Submission = require('../models/Submission');
const Form = require('../models/Form');
const { exportRows } = require('../models/submissionExport');
const { sendNewSubmissionNotification } = require('../utils/mailer');

function listSubmissions(req, res) {
  try {
    const { form_id, status } = req.query;
    const submissions = Submission.findAll({ form_id, status });
    res.json(submissions.map(parseSubmissionRow));
  } catch (err) {
    console.error('listSubmissions error:', err);
    res.status(500).json({ error: 'Failed to list submissions.' });
  }
}

function csvCell(value) {
  let text = value == null ? '' : typeof value === 'object' ? JSON.stringify(value) : String(value);
  // Preserve the original whitespace, but never let it hide a formula marker.
  if (/^[\s\p{Cc}]*[=+@\-\t\r]/u.test(text)) text = "'" + text;
  return /[",\r\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

function exportSubmissions(_req, res) {
  async function* lines() {
    for await (const row of exportRows()) yield row.map(csvCell).join(',') + '\r\n';
  }
  res.attachment('submissions.csv').type('text/csv').set('Cache-Control', 'no-store');
  pipeline(Readable.from(lines()), res, (err) => {
    if (err) console.error('exportSubmissions error:', err.message);
  });
}

function getSubmission(req, res) {
  try {
    const submission = Submission.findById(req.params.id);
    if (!submission) {
      return res.status(404).json({ error: 'Submission not found.' });
    }
    res.json(parseSubmissionRow(submission));
  } catch (err) {
    console.error('getSubmission error:', err);
    res.status(500).json({ error: 'Failed to retrieve submission.' });
  }
}

function createSubmission(req, res) {
  const files = Array.isArray(req.files) ? req.files : Object.values(req.files || {}).flat();
  let persisted = false;
  try {
    const { form_id, responses } = req.body;
    if (!form_id) return res.status(422).json({ error: 'form_id is required.' });
    if (!responses) return res.status(422).json({ error: 'responses is required.' });

    const form = Form.findById(form_id);
    if (!form) return res.status(404).json({ error: 'Form not found.' });

    let parsedResponses;
    try {
      parsedResponses = typeof responses === 'string' ? JSON.parse(responses) : responses;
    } catch {
      return res.status(422).json({ error: 'responses must be valid JSON.' });
    }
    if (!parsedResponses || typeof parsedResponses !== 'object' || Array.isArray(parsedResponses)) {
      return res.status(422).json({ error: 'responses must be an object.' });
    }

    const mediaFiles = files.map(({ fieldname, filename, mimetype, size }) => ({
      fieldname, filename, mimetype, size, url: `/api/media/${filename}`,
    }));
    const row = Submission.create({
      id: uuidv4(),
      form_id,
      responses: { ...parsedResponses, ...Object.fromEntries(mediaFiles.map((mf) => [mf.fieldname, mf.url])) },
      media_files: mediaFiles,
    });
    persisted = true;
    const submission = parseSubmissionRow(row);
    sendNewSubmissionNotification(form, submission).catch((err) => {
      console.error('New submission notification failed:', err.message);
    });
    res.status(201).json(submission);
  } catch (err) {
    console.error('createSubmission error:', err);
    res.status(500).json({ error: 'Failed to create submission.' });
  } finally {
    if (!persisted) {
      for (const file of files) {
        try {
          unlinkSync(file.path);
        } catch (err) {
          if (err.code !== 'ENOENT') console.error('Rejected upload cleanup failed:', err.message);
        }
      }
    }
  }
}

function updateSubmission(req, res) {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;
    const validStatuses = ['new', 'reviewed', 'archived'];
    if (status && !validStatuses.includes(status)) {
      return res.status(422).json({ error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` });
    }
    const submission = Submission.update(id, { status, notes });
    if (!submission) return res.status(404).json({ error: 'Submission not found.' });
    res.json(parseSubmissionRow(submission));
  } catch (err) {
    console.error('updateSubmission error:', err);
    res.status(500).json({ error: 'Failed to update submission.' });
  }
}

function parseSubmissionRow(row) {
  return {
    ...row,
    responses: typeof row.responses === 'string' ? JSON.parse(row.responses) : row.responses,
    media_files: typeof row.media_files === 'string' ? JSON.parse(row.media_files) : (row.media_files || []),
  };
}

module.exports = { listSubmissions, exportSubmissions, getSubmission, createSubmission, updateSubmission };

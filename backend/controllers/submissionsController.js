const { v4: uuidv4 } = require('uuid');
const Submission = require('../models/Submission');
const Form = require('../models/Form');

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
  try {
    const { form_id, responses } = req.body;

    if (!form_id) {
      return res.status(422).json({ error: 'form_id is required.' });
    }
    if (!responses) {
      return res.status(422).json({ error: 'responses is required.' });
    }

    const form = Form.findById(form_id);
    if (!form) {
      return res.status(404).json({ error: 'Form not found.' });
    }

    const submissionId = uuidv4();

    // Collect file references from multer uploads
    const mediaFiles = [];
    if (req.files && Array.isArray(req.files)) {
      req.files.forEach((file) => {
        mediaFiles.push({
          fieldname: file.fieldname,
          filename: file.filename,
          mimetype: file.mimetype,
          size: file.size,
          url: `/api/media/${file.filename}`,
        });
      });
    } else if (req.files && typeof req.files === 'object') {
      Object.values(req.files).forEach((fileArr) => {
        fileArr.forEach((file) => {
          mediaFiles.push({
            fieldname: file.fieldname,
            filename: file.filename,
            mimetype: file.mimetype,
            size: file.size,
            url: `/api/media/${file.filename}`,
          });
        });
      });
    }

    // Parse responses and inject file URLs for media fields
    let parsedResponses = typeof responses === 'string' ? JSON.parse(responses) : responses;
    mediaFiles.forEach((mf) => {
      parsedResponses[mf.fieldname] = mf.url;
    });

    const submission = Submission.create({
      id: submissionId,
      form_id,
      responses: parsedResponses,
      media_files: mediaFiles,
    });

    res.status(201).json(parseSubmissionRow(submission));
  } catch (err) {
    console.error('createSubmission error:', err);
    res.status(500).json({ error: 'Failed to create submission.' });
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
    if (!submission) {
      return res.status(404).json({ error: 'Submission not found.' });
    }

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

module.exports = { listSubmissions, getSubmission, createSubmission, updateSubmission };

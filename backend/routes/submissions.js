const express = require('express');
const router = express.Router();
const { requireApiKey } = require('../middleware/auth');
const { upload, multerErrorHandler } = require('../middleware/upload');
const {
  listSubmissions,
  getSubmission,
  createSubmission,
  updateSubmission,
} = require('../controllers/submissionsController');

router.get('/', requireApiKey, listSubmissions);
router.get('/:id', requireApiKey, getSubmission);

// Public submission endpoint — accepts multipart/form-data
router.post(
  '/',
  upload.any(),
  multerErrorHandler,
  createSubmission,
);

router.patch('/:id', requireApiKey, updateSubmission);

module.exports = router;

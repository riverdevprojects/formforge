const multer = require('multer');
const path = require('path');
const { UPLOAD_DIR } = require('../utils/storage');

const ALLOWED_MIME_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'audio/webm',
  'audio/mp4',
  'audio/wav',
  'audio/ogg',
  'video/webm',
  'video/mp4',
]);

const MAX_FILE_SIZE_MB = parseInt(process.env.MAX_FILE_SIZE_MB || '50', 10);
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;
const MAX_TOTAL_BYTES = 200 * 1024 * 1024;

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, UPLOAD_DIR);
  },
  filename: (req, file, cb) => {
    const submissionId = req.body.submission_id || req.params.submissionId || 'unknown';
    const timestamp = Date.now();
    const ext = path.extname(file.originalname) || mimeToExt(file.mimetype);
    const safeName = `${submissionId}_${file.fieldname}_${timestamp}${ext}`;
    cb(null, safeName);
  },
});

function fileFilter(_req, file, cb) {
  if (ALLOWED_MIME_TYPES.has(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      Object.assign(new Error(`File type not allowed: ${file.mimetype}`), { code: 'FILE_TYPE_NOT_ALLOWED' }),
      false,
    );
  }
}

function mimeToExt(mime) {
  const map = {
    'image/jpeg': '.jpg',
    'image/png': '.png',
    'image/webp': '.webp',
    'audio/webm': '.webm',
    'audio/mp4': '.m4a',
    'audio/wav': '.wav',
    'audio/ogg': '.ogg',
    'video/webm': '.webm',
    'video/mp4': '.mp4',
  };
  return map[mime] || '';
}

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: MAX_FILE_SIZE_BYTES,
    files: 20,
  },
});

function multerErrorHandler(err, req, res, next) {
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(413).json({
      error: `File too large. Maximum size is ${MAX_FILE_SIZE_MB}MB per file.`,
    });
  }
  if (err.code === 'FILE_TYPE_NOT_ALLOWED') {
    return res.status(400).json({ error: err.message });
  }
  if (err.code === 'LIMIT_FILE_COUNT') {
    return res.status(400).json({ error: 'Too many files uploaded.' });
  }
  if (err instanceof multer.MulterError) {
    return res.status(400).json({ error: err.message });
  }
  next(err);
}

module.exports = { upload, multerErrorHandler };

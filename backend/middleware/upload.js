const multer = require('multer');
const { randomUUID } = require('node:crypto');
const { UPLOAD_DIR } = require('../utils/storage');

const extensions = new Map(Object.entries({
  'image/jpeg': '.jpg', 'image/png': '.png', 'image/webp': '.webp',
  'audio/webm': '.webm', 'audio/mp4': '.m4a', 'audio/wav': '.wav', 'audio/ogg': '.ogg',
  'video/webm': '.webm', 'video/mp4': '.mp4',
}));

const MAX_FILE_SIZE_MB = parseInt(process.env.MAX_FILE_SIZE_MB || '50', 10);
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOAD_DIR),
  // Cleanup must only ever target a file owned by this upload.
  filename: (_req, file, cb) => cb(null, randomUUID() + extensions.get(file.mimetype)),
});

function fileFilter(_req, file, cb) {
  if (extensions.has(file.mimetype)) return cb(null, true);
  cb(Object.assign(new Error(`File type not allowed: ${file.mimetype}`), { code: 'FILE_TYPE_NOT_ALLOWED' }), false);
}

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: MAX_FILE_SIZE_MB * 1024 * 1024, files: 20 },
});

function multerErrorHandler(err, req, res, next) {
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(413).json({ error: `File too large. Maximum size is ${MAX_FILE_SIZE_MB}MB per file.` });
  }
  if (err.code === 'FILE_TYPE_NOT_ALLOWED') return res.status(400).json({ error: err.message });
  if (err.code === 'LIMIT_FILE_COUNT') return res.status(400).json({ error: 'Too many files uploaded.' });
  if (err instanceof multer.MulterError) return res.status(400).json({ error: err.message });
  next(err);
}

module.exports = { upload, multerErrorHandler };

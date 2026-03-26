const path = require('path');
const fs = require('fs');

const UPLOAD_DIR = process.env.UPLOAD_DIR
  ? path.resolve(process.env.UPLOAD_DIR)
  : path.join(__dirname, '..', 'uploads');

function ensureUploadDir() {
  if (!fs.existsSync(UPLOAD_DIR)) {
    fs.mkdirSync(UPLOAD_DIR, { recursive: true });
  }
}

function getUploadPath(filename) {
  return path.join(UPLOAD_DIR, filename);
}

function getUploadUrl(filename) {
  return `/api/media/${filename}`;
}

function deleteUploadedFile(filename) {
  const filePath = getUploadPath(filename);
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }
}

module.exports = { UPLOAD_DIR, ensureUploadDir, getUploadPath, getUploadUrl, deleteUploadedFile };

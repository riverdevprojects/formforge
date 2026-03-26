const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const { UPLOAD_DIR } = require('../utils/storage');

router.get('/:filename', (req, res) => {
  const filename = path.basename(req.params.filename); // Prevent path traversal
  const filePath = path.join(UPLOAD_DIR, filename);

  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: 'File not found.' });
  }

  res.sendFile(filePath);
});

module.exports = router;

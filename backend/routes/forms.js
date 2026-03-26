const express = require('express');
const router = express.Router();
const { requireApiKey } = require('../middleware/auth');
const {
  listForms,
  getFormBySlug,
  createForm,
  updateForm,
  deleteForm,
} = require('../controllers/formsController');

router.get('/', requireApiKey, listForms);
router.get('/:slug', getFormBySlug); // Public — clients load form by slug
router.post('/', requireApiKey, createForm);
router.put('/:id', requireApiKey, updateForm);
router.delete('/:id', requireApiKey, deleteForm);

module.exports = router;

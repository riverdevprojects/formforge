const { v4: uuidv4 } = require('uuid');
const Form = require('../models/Form');
const { validateFormDefinition } = require('../../shared/formSchema');

function listForms(req, res) {
  try {
    const forms = Form.findAll();
    res.json(forms.map(parseFormRow));
  } catch (err) {
    console.error('listForms error:', err);
    res.status(500).json({ error: 'Failed to list forms.' });
  }
}

function getFormBySlug(req, res) {
  try {
    const form = Form.findBySlug(req.params.slug);
    if (!form) {
      return res.status(404).json({ error: `Form not found: ${req.params.slug}` });
    }
    res.json(parseFormRow(form));
  } catch (err) {
    console.error('getFormBySlug error:', err);
    res.status(500).json({ error: 'Failed to retrieve form.' });
  }
}

function createForm(req, res) {
  try {
    const { name, description, slug, steps, business_name, accent_color, logo_url } = req.body;

    if (!name || !slug || !steps) {
      return res.status(422).json({ error: 'name, slug, and steps are required.' });
    }

    const parsedSteps = typeof steps === 'string' ? JSON.parse(steps) : steps;
    const { valid, errors } = validateFormDefinition({ name, slug, steps: parsedSteps });
    if (!valid) {
      return res.status(422).json({ error: 'Invalid form definition.', details: errors });
    }

    const form = Form.create({
      id: uuidv4(),
      name,
      description,
      slug,
      steps: parsedSteps,
      business_name,
      accent_color,
      logo_url,
    });

    res.status(201).json(parseFormRow(form));
  } catch (err) {
    if (err.message && err.message.includes('UNIQUE constraint')) {
      return res.status(409).json({ error: 'A form with this slug already exists.' });
    }
    console.error('createForm error:', err);
    res.status(500).json({ error: 'Failed to create form.' });
  }
}

function updateForm(req, res) {
  try {
    const { id } = req.params;
    const existing = Form.findById(id);
    if (!existing) {
      return res.status(404).json({ error: 'Form not found.' });
    }

    const updates = req.body;
    if (updates.steps && typeof updates.steps === 'string') {
      updates.steps = JSON.parse(updates.steps);
    }

    const form = Form.update(id, updates);
    res.json(parseFormRow(form));
  } catch (err) {
    if (err.message && err.message.includes('UNIQUE constraint')) {
      return res.status(409).json({ error: 'A form with this slug already exists.' });
    }
    console.error('updateForm error:', err);
    res.status(500).json({ error: 'Failed to update form.' });
  }
}

function deleteForm(req, res) {
  try {
    const { id } = req.params;
    const deleted = Form.remove(id);
    if (!deleted) {
      return res.status(404).json({ error: 'Form not found.' });
    }
    res.json({ success: true });
  } catch (err) {
    console.error('deleteForm error:', err);
    res.status(500).json({ error: 'Failed to delete form.' });
  }
}

function parseFormRow(row) {
  return {
    ...row,
    steps: typeof row.steps === 'string' ? JSON.parse(row.steps) : row.steps,
    is_active: row.is_active === 1 || row.is_active === true,
  };
}

module.exports = { listForms, getFormBySlug, createForm, updateForm, deleteForm };

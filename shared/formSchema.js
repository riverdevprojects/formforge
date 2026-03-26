/**
 * SmartForms — Shared Form Definition Schema
 *
 * A form is an object with an array of steps. Each step has a `type` and `config`.
 * This module is used by both the frontend (template definitions) and
 * backend (validation logic).
 *
 * Step types: text | photo | audio | video | multichoice | signature | conditional
 */

const STEP_TYPES = {
  TEXT: 'text',
  PHOTO: 'photo',
  AUDIO: 'audio',
  VIDEO: 'video',
  MULTICHOICE: 'multichoice',
  SIGNATURE: 'signature',
  CONDITIONAL: 'conditional',
};

const VALIDATION_TYPES = {
  NAME: 'name',
  EMAIL: 'email',
  PHONE: 'phone',
  TEXT: 'text',
};

const SUBMISSION_STATUSES = {
  NEW: 'new',
  REVIEWED: 'reviewed',
  ARCHIVED: 'archived',
};

/**
 * Validate a form definition object.
 * Returns { valid: boolean, errors: string[] }
 */
function validateFormDefinition(form) {
  const errors = [];

  if (!form.name || typeof form.name !== 'string') {
    errors.push('form.name is required and must be a string');
  }
  if (!form.slug || typeof form.slug !== 'string') {
    errors.push('form.slug is required and must be a string');
  }
  if (!Array.isArray(form.steps) || form.steps.length === 0) {
    errors.push('form.steps must be a non-empty array');
  } else {
    form.steps.forEach((step, i) => {
      if (!step.id) errors.push(`step[${i}].id is required`);
      if (!step.type || !Object.values(STEP_TYPES).includes(step.type)) {
        errors.push(`step[${i}].type must be one of: ${Object.values(STEP_TYPES).join(', ')}`);
      }
      if (!step.config || typeof step.config !== 'object') {
        errors.push(`step[${i}].config is required`);
      }
    });
  }

  return { valid: errors.length === 0, errors };
}

/**
 * Extract all required field names from a form definition.
 */
function getRequiredFields(form) {
  return form.steps
    .filter((step) => step.config && step.config.required && step.type !== STEP_TYPES.CONDITIONAL)
    .map((step) => step.config.field)
    .filter(Boolean);
}

/**
 * Resolve the active steps for a given set of responses (handles conditional steps).
 */
function resolveActiveSteps(steps, responses) {
  return steps.filter((step) => {
    if (step.type !== STEP_TYPES.CONDITIONAL) return true;
    const { dependsOn, matchValue } = step.config;
    const answer = responses[dependsOn];
    if (Array.isArray(answer)) return answer.includes(matchValue);
    return answer === matchValue;
  });
}

module.exports = {
  STEP_TYPES,
  VALIDATION_TYPES,
  SUBMISSION_STATUSES,
  validateFormDefinition,
  getRequiredFields,
  resolveActiveSteps,
};

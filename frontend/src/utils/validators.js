export function validateField(value, validation, required) {
  if (!value && !required) return null;
  if (!value && required) return 'This field is required.';

  switch (validation) {
    case 'email': {
      const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRe.test(value)) return 'Please enter a valid email address.';
      break;
    }
    case 'phone': {
      const phoneRe = /^[\d\s\-().+]{7,20}$/;
      if (!phoneRe.test(value)) return 'Please enter a valid phone number.';
      break;
    }
    case 'name': {
      if (value.trim().length < 2) return 'Name must be at least 2 characters.';
      break;
    }
    default:
      break;
  }

  return null;
}

export function isStepComplete(step, responses) {
  const { type, config } = step;

  if (type === 'conditional') {
    // Conditional steps are always "complete" — they either show their inner question or skip
    const { dependsOn, matchValue, required, field } = config;
    const parentAnswer = responses[dependsOn];
    const isVisible = Array.isArray(parentAnswer)
      ? parentAnswer.includes(matchValue)
      : parentAnswer === matchValue;

    if (!isVisible) return true;
    if (!required) return true;
    return Boolean(responses[field]);
  }

  if (!config.required) return true;

  const value = responses[config.field];
  if (value === undefined || value === null || value === '') return false;
  if (Array.isArray(value) && value.length === 0) return false;

  return true;
}

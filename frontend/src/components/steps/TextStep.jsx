import { useEffect, useRef, useState } from 'react';
import { validateField } from '../../utils/validators.js';

export default function TextStep({ config, value, onChange }) {
  const { label, placeholder, required, validation, multiline, hint } = config;
  const [error, setError] = useState(null);
  const [touched, setTouched] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const t = setTimeout(() => ref.current?.focus(), 80);
    return () => clearTimeout(t);
  }, [label]);

  function handleChange(e) {
    const v = e.target.value;
    onChange(v);
    if (touched) {
      setError(validateField(v, validation, required));
    }
  }

  function handleBlur() {
    setTouched(true);
    setError(validateField(value || '', validation, required));
  }

  const hasError = touched && error;

  return (
    <div>
      <p className="step-label">{label}</p>
      {hint && <p className="step-hint">{hint}</p>}

      {multiline ? (
        <textarea
          ref={ref}
          value={value || ''}
          onChange={handleChange}
          onBlur={handleBlur}
          placeholder={placeholder}
          rows={4}
          className={`form-input resize-none ${hasError ? 'error' : ''}`}
        />
      ) : (
        <input
          ref={ref}
          type={validation === 'email' ? 'email' : validation === 'phone' ? 'tel' : 'text'}
          value={value || ''}
          onChange={handleChange}
          onBlur={handleBlur}
          placeholder={placeholder}
          className={`form-input ${hasError ? 'error' : ''}`}
          autoComplete={
            validation === 'email' ? 'email' : validation === 'phone' ? 'tel' : validation === 'name' ? 'name' : 'off'
          }
        />
      )}

      {hasError && <p className="error-text">{error}</p>}
    </div>
  );
}

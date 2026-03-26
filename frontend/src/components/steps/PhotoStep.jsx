import { useRef, useState } from 'react';
import { fileSizeMB } from '../../utils/fileHelpers.js';

export default function PhotoStep({ config, value, onChange }) {
  const { label, hint, required, maxSizeMB = 10 } = config;
  const [preview, setPreview] = useState(value instanceof File ? URL.createObjectURL(value) : null);
  const [error, setError] = useState(null);
  const inputRef = useRef(null);

  function handleFile(file) {
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Please select an image file (JPG, PNG, or WebP).');
      return;
    }

    if (fileSizeMB(file.size) > maxSizeMB) {
      setError(`Image must be smaller than ${maxSizeMB}MB. Your file is ${fileSizeMB(file.size).toFixed(1)}MB.`);
      return;
    }

    setError(null);
    const url = URL.createObjectURL(file);
    setPreview(url);
    onChange(file);
  }

  function handleInputChange(e) {
    handleFile(e.target.files?.[0]);
  }

  function handleDrop(e) {
    e.preventDefault();
    handleFile(e.dataTransfer.files?.[0]);
  }

  function handleDragOver(e) {
    e.preventDefault();
  }

  function retake() {
    setPreview(null);
    onChange(null);
    setError(null);
    inputRef.current.value = '';
  }

  return (
    <div>
      <p className="step-label">{label}</p>
      {hint && <p className="step-hint">{hint}</p>}

      {preview ? (
        <div>
          <div className="rounded-2xl overflow-hidden mb-3" style={{ maxHeight: 280 }}>
            <img src={preview} alt="Preview" className="w-full h-full object-cover" />
          </div>
          <button
            type="button"
            onClick={retake}
            className="btn-secondary text-sm py-2"
            style={{ minHeight: 44 }}
          >
            Retake / Choose different photo
          </button>
        </div>
      ) : (
        <div>
          {/* Hidden input — triggers camera on mobile */}
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={handleInputChange}
          />

          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onClick={() => inputRef.current.click()}
            className="rounded-2xl border-2 border-dashed flex flex-col items-center justify-center p-10 cursor-pointer transition-all"
            style={{ borderColor: 'var(--border)', background: 'var(--surface-2)' }}
          >
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-3" style={{ background: 'var(--accent-light)' }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <circle cx="12" cy="13" r="4" stroke="var(--accent)" strokeWidth="2" />
              </svg>
            </div>
            <p className="font-semibold text-sm mb-1" style={{ color: 'var(--text-primary)' }}>
              Tap to take a photo
            </p>
            <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
              or drag and drop an image here
            </p>
            <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>
              Max {maxSizeMB}MB · JPG, PNG, WebP
            </p>
          </div>
        </div>
      )}

      {error && <p className="error-text">{error}</p>}
    </div>
  );
}

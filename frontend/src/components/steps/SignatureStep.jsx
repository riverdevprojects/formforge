import { useRef } from 'react';
import SignatureCanvas from 'react-signature-canvas';

export default function SignatureStep({ config, value, onChange }) {
  const { label, hint } = config;
  const sigRef = useRef(null);

  function handleEnd() {
    if (!sigRef.current) return;
    sigRef.current.getTrimmedCanvas().toBlob((blob) => {
      if (blob) onChange(blob);
    }, 'image/png');
  }

  function handleClear() {
    sigRef.current?.clear();
    onChange(null);
  }

  return (
    <div>
      <p className="step-label">{label}</p>
      {hint && <p className="step-hint">{hint}</p>}

      <div
        className="rounded-2xl border-2 overflow-hidden mb-3"
        style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}
      >
        <SignatureCanvas
          ref={sigRef}
          penColor="var(--text-primary)"
          canvasProps={{
            width: 440,
            height: 200,
            className: 'w-full',
            style: { display: 'block' },
          }}
          onEnd={handleEnd}
        />
      </div>

      <button
        type="button"
        onClick={handleClear}
        className="btn-secondary text-sm"
        style={{ minHeight: 44 }}
      >
        Clear signature
      </button>

      {value && (
        <p className="text-xs mt-2" style={{ color: 'var(--success)' }}>
          Signature captured
        </p>
      )}
    </div>
  );
}

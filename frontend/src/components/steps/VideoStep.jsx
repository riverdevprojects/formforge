import { useRef } from 'react';
import useMediaCapture from '../../hooks/useMediaCapture.js';
import { formatDuration } from '../../utils/fileHelpers.js';

export default function VideoStep({ config, value, onChange }) {
  const { label, hint, maxSeconds: configMax } = config;
  const {
    state, duration, blob, errorMessage,
    videoRef, requestCamera, startRecording, stopRecording, reset, maxSeconds,
  } = useMediaCapture({ maxSeconds: configMax || 60 });

  const videoPlaybackRef = useRef(null);

  const videoUrl = blob ? URL.createObjectURL(blob) : null;

  function handleStop() {
    stopRecording();
    if (blob && onChange) onChange(blob);
  }

  // Pass blob to parent when recording stops
  if (blob && !value) onChange(blob);

  return (
    <div>
      <p className="step-label">{label}</p>
      {hint && <p className="step-hint">{hint}</p>}

      {errorMessage && (
        <div className="rounded-xl p-3 mb-4 text-sm" style={{ background: '#fee2e2', color: 'var(--error)' }}>
          {errorMessage}
        </div>
      )}

      {/* Live camera preview */}
      {(state === 'previewing' || state === 'recording') && (
        <div className="mb-4">
          <div className="rounded-2xl overflow-hidden mb-3" style={{ background: '#000', position: 'relative' }}>
            <video ref={videoRef} autoPlay muted playsInline className="w-full" style={{ maxHeight: 280, display: 'block' }} />
            {state === 'recording' && (
              <div className="absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full text-white text-xs font-semibold" style={{ background: 'rgba(220,38,38,0.85)' }}>
                <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
                {formatDuration(duration)}
              </div>
            )}
          </div>

          {state === 'previewing' && (
            <button type="button" onClick={startRecording} className="btn-primary flex items-center justify-center gap-2">
              <span className="w-3 h-3 rounded-full" style={{ background: 'var(--error)' }} />
              Start Recording
            </button>
          )}

          {state === 'recording' && (
            <button type="button" onClick={stopRecording} className="btn-primary" style={{ background: 'var(--error)' }}>
              Stop Recording ({formatDuration(maxSeconds - duration)} left)
            </button>
          )}
        </div>
      )}

      {/* Playback */}
      {state === 'stopped' && videoUrl && (
        <div className="mb-4">
          <video ref={videoPlaybackRef} src={videoUrl} controls className="w-full rounded-2xl mb-3" style={{ maxHeight: 280 }} />
          <p className="text-xs mb-3" style={{ color: 'var(--text-secondary)' }}>
            Duration: {formatDuration(duration)}
          </p>
          <button type="button" onClick={() => { reset(); onChange(null); }} className="btn-secondary" style={{ minHeight: 44 }}>
            Re-record
          </button>
        </div>
      )}

      {state === 'idle' && (
        <button type="button" onClick={requestCamera} className="btn-primary flex items-center justify-center gap-2">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M15 10l4.553-2.277A1 1 0 0121 8.723v6.554a1 1 0 01-1.447.896L15 14M3 8a2 2 0 012-2h10a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Open Camera
        </button>
      )}

      {state === 'requesting' && (
        <div className="text-center py-4" style={{ color: 'var(--text-secondary)' }}>
          Requesting camera access...
        </div>
      )}
    </div>
  );
}

import { useEffect, useRef } from 'react';
import useAudioRecorder from '../../hooks/useAudioRecorder.js';
import { formatDuration } from '../../utils/fileHelpers.js';

export default function AudioStep({ config, value, onChange }) {
  const { label, hint, maxMinutes = 2 } = config;
  const { state, duration, blob, errorMessage, analyserData, start, stop, reset, maxSeconds } = useAudioRecorder({ maxMinutes });
  const canvasRef = useRef(null);
  const audioUrlRef = useRef(null);

  // Sync blob to form state
  useEffect(() => {
    if (blob) {
      if (audioUrlRef.current) URL.revokeObjectURL(audioUrlRef.current);
      audioUrlRef.current = URL.createObjectURL(blob);
      onChange(blob);
    }
  }, [blob]);

  // Draw waveform
  useEffect(() => {
    if (state !== 'recording') return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const W = canvas.width;
    const H = canvas.height;
    const bars = analyserData.length;
    const barW = W / bars;

    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = 'var(--accent)';

    analyserData.forEach((v, i) => {
      const barH = (v / 255) * H;
      ctx.fillRect(i * barW + 1, H - barH, barW - 2, barH);
    });
  }, [analyserData, state]);

  const audioUrl = blob ? audioUrlRef.current || URL.createObjectURL(blob) : null;

  return (
    <div>
      <p className="step-label">{label}</p>
      {hint && (
        <div className="rounded-xl p-3 mb-4 text-sm" style={{ background: 'var(--accent-light)', color: 'var(--accent)' }}>
          {hint}
        </div>
      )}

      {errorMessage && (
        <div className="rounded-xl p-3 mb-4 text-sm" style={{ background: '#fee2e2', color: 'var(--error)' }}>
          {errorMessage}
        </div>
      )}

      {state === 'recording' && (
        <div className="mb-4">
          <div className="rounded-2xl overflow-hidden mb-3" style={{ background: 'var(--surface-2)', height: 80 }}>
            <canvas ref={canvasRef} width={480} height={80} className="w-full h-full" />
          </div>
          <div className="flex items-center justify-between mb-3">
            <span className="font-mono text-sm font-semibold" style={{ color: 'var(--error)' }}>
              ● {formatDuration(duration)}
            </span>
            <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>
              Max {formatDuration(maxSeconds)}
            </span>
          </div>
          <button type="button" onClick={stop} className="btn-primary" style={{ background: 'var(--error)' }}>
            Stop Recording
          </button>
        </div>
      )}

      {state === 'stopped' && audioUrl && (
        <div className="mb-4">
          <audio controls src={audioUrl} className="w-full mb-3 rounded-xl" />
          <p className="text-xs mb-3" style={{ color: 'var(--text-secondary)' }}>
            Duration: {formatDuration(duration)}
          </p>
          <button type="button" onClick={reset} className="btn-secondary" style={{ minHeight: 44 }}>
            Re-record
          </button>
        </div>
      )}

      {(state === 'idle' || state === 'error') && (
        <button
          type="button"
          onClick={start}
          className="btn-primary flex items-center justify-center gap-2"
        >
          <span className="w-3 h-3 rounded-full" style={{ background: 'white' }} />
          Start Recording
        </button>
      )}

      {state === 'requesting' && (
        <div className="text-center py-4" style={{ color: 'var(--text-secondary)' }}>
          Requesting microphone access...
        </div>
      )}
    </div>
  );
}

export default function ProgressBar({ current, total, accentColor }) {
  const pct = total > 0 ? ((current + 1) / total) * 100 : 0;

  return (
    <div
      className="fixed top-0 left-0 right-0 h-1 z-50"
      style={{ background: 'var(--border)' }}
      role="progressbar"
      aria-valuenow={current + 1}
      aria-valuemin={1}
      aria-valuemax={total}
      aria-label={`Step ${current + 1} of ${total}`}
    >
      <div
        className="h-full transition-all duration-500 ease-out"
        style={{
          width: `${pct}%`,
          background: accentColor || 'var(--accent)',
        }}
      />
    </div>
  );
}

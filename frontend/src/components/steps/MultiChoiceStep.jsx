export default function MultiChoiceStep({ config, value, onChange }) {
  const { label, options = [], hint, multi } = config;
  const selected = Array.isArray(value) ? value : value ? [value] : [];

  function toggle(option) {
    if (multi) {
      const next = selected.includes(option)
        ? selected.filter((o) => o !== option)
        : [...selected, option];
      onChange(next);
    } else {
      onChange(option);
    }
  }

  const isSelected = (option) => (multi ? selected.includes(option) : value === option);

  return (
    <div>
      <p className="step-label">{label}</p>
      {hint && <p className="step-hint">{hint}</p>}

      <div className="flex flex-col gap-2 mt-1">
        {options.map((option) => {
          const sel = isSelected(option);
          return (
            <button
              key={option}
              type="button"
              onClick={() => toggle(option)}
              className="w-full text-left px-4 py-3.5 rounded-2xl border-2 text-base font-medium transition-all duration-150"
              style={{
                borderColor: sel ? 'var(--accent)' : 'var(--border)',
                background: sel ? 'var(--accent-light)' : 'var(--surface)',
                color: sel ? 'var(--accent)' : 'var(--text-primary)',
              }}
            >
              <span className="flex items-center gap-3">
                <span
                  className="w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all"
                  style={{
                    borderColor: sel ? 'var(--accent)' : 'var(--border)',
                    background: sel ? 'var(--accent)' : 'transparent',
                  }}
                >
                  {sel && (
                    <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                      <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </span>
                {option}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

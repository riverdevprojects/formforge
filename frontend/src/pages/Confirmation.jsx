import { Link, useLocation } from 'react-router-dom';

export default function Confirmation() {
  const { state } = useLocation();
  const formName = state?.formName;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4" style={{ background: 'var(--surface-2)' }}>
      <div className="step-card text-center">
        <div
          className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-5"
          style={{ background: '#dcfce7' }}
        >
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
            <path d="M20 6L9 17l-5-5" stroke="#16a34a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>

        <h1 className="text-2xl font-bold mb-2" style={{ fontFamily: 'Syne, sans-serif' }}>
          Submission received!
        </h1>

        <p className="mb-6 text-base" style={{ color: 'var(--text-secondary)' }}>
          {formName
            ? `Your ${formName} intake has been submitted successfully.`
            : 'Your intake form has been submitted successfully.'}
          {' '}We'll be in touch shortly.
        </p>

        <Link to="/" className="btn-primary block py-3 text-center rounded-2xl no-underline">
          Back to Home
        </Link>
      </div>
    </div>
  );
}

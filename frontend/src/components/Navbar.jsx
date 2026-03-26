import { Link, useLocation } from 'react-router-dom';

export default function Navbar() {
  const { pathname } = useLocation();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 no-print" style={{ background: 'var(--surface)', borderBottom: '1px solid var(--border)' }}>
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 font-heading font-bold text-lg" style={{ color: 'var(--text-primary)' }}>
          <svg width="24" height="24" viewBox="0 0 32 32" fill="none">
            <rect width="32" height="32" rx="8" fill="var(--accent)" />
            <path d="M8 10h16M8 16h12M8 22h8" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
          </svg>
          SmartForms
        </Link>

        <div className="flex items-center gap-1">
          <NavLink to="/" label="Home" current={pathname === '/'} />
          <NavLink to="/builder" label="Builder" current={pathname.startsWith('/builder')} />
          <NavLink to="/dashboard" label="Dashboard" current={pathname.startsWith('/dashboard')} />
        </div>
      </div>
    </nav>
  );
}

function NavLink({ to, label, current }) {
  return (
    <Link
      to={to}
      className="px-3 py-1.5 rounded-xl text-sm font-medium transition-colors"
      style={{
        color: current ? 'var(--accent)' : 'var(--text-secondary)',
        background: current ? 'var(--accent-light)' : 'transparent',
      }}
    >
      {label}
    </Link>
  );
}

import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar.jsx';

const templates = [
  {
    slug: 'device-repair',
    name: 'Device Repair',
    icon: '💻',
    description: 'Collect device photos, describe the problem, and capture essential info for repair intakes.',
    color: '#1d4ed8',
    bg: '#dbeafe',
  },
  {
    slug: 'data-recovery',
    name: 'Data Recovery',
    icon: '💾',
    description: 'Guide clients to record drive sounds, photograph labels, and answer diagnostic questions.',
    color: '#7c3aed',
    bg: '#ede9fe',
  },
];

const features = [
  { icon: '📸', title: 'Photo Capture', desc: 'Clients take photos right from the form — no attachments.' },
  { icon: '🎙️', title: 'Audio Recording', desc: 'Record ambient sounds, voice notes, or drive noises in-browser.' },
  { icon: '🎥', title: 'Video Recording', desc: 'Capture short videos of issues directly in the intake flow.' },
  { icon: '✍️', title: 'Digital Signatures', desc: 'Canvas-based signature capture with clear/redo support.' },
  { icon: '🔀', title: 'Conditional Logic', desc: 'Steps appear or hide based on prior answers — smart branching.' },
  { icon: '📊', title: 'Dashboard', desc: 'Review all submissions with media inline, add notes, change status.' },
];

export default function Home() {
  return (
    <div style={{ background: 'var(--surface-2)', minHeight: '100vh' }}>
      <Navbar />

      {/* Hero */}
      <section className="max-w-3xl mx-auto px-4 pt-28 pb-16 text-center">
        <div
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold mb-6"
          style={{ background: 'var(--accent-light)', color: 'var(--accent)' }}
        >
          Intelligent Business Intake Platform
        </div>

        <h1
          className="text-4xl sm:text-5xl font-bold mb-5 leading-tight"
          style={{ fontFamily: 'Syne, sans-serif', color: 'var(--text-primary)' }}
        >
          Forms that feel like<br /> a conversation
        </h1>

        <p className="text-lg mb-8 max-w-xl mx-auto" style={{ color: 'var(--text-secondary)', lineHeight: 1.7 }}>
          SmartForms guides your clients through a step-by-step intake that collects photos, audio,
          video, signatures, and more — all without leaving the browser.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            to="/form/device-repair"
            className="btn-primary px-8 py-3 text-base rounded-2xl no-underline text-center"
            style={{ width: 'auto', minWidth: 200 }}
          >
            Try the Demo Form
          </Link>
          <Link
            to="/builder"
            className="btn-secondary px-8 py-3 text-base rounded-2xl no-underline text-center"
            style={{ width: 'auto', minWidth: 180 }}
          >
            Build Your Own
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-5xl mx-auto px-4 pb-16">
        <h2 className="text-2xl font-bold text-center mb-8" style={{ fontFamily: 'Syne, sans-serif' }}>
          Everything you need, nothing you don't
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {features.map((f) => (
            <div
              key={f.title}
              className="rounded-2xl p-5"
              style={{ background: 'var(--surface)', boxShadow: '0 2px 12px rgba(15,23,42,0.06)' }}
            >
              <div className="text-2xl mb-3">{f.icon}</div>
              <h3 className="font-semibold text-base mb-1" style={{ fontFamily: 'Syne, sans-serif' }}>{f.title}</h3>
              <p className="text-sm" style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Templates */}
      <section className="max-w-4xl mx-auto px-4 pb-20">
        <h2 className="text-2xl font-bold text-center mb-2" style={{ fontFamily: 'Syne, sans-serif' }}>
          Pre-built templates
        </h2>
        <p className="text-center mb-8 text-sm" style={{ color: 'var(--text-secondary)' }}>
          Ready to use out of the box — or use them as a starting point.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {templates.map((t) => (
            <div
              key={t.slug}
              className="rounded-2xl p-6 flex flex-col"
              style={{ background: 'var(--surface)', boxShadow: '0 2px 12px rgba(15,23,42,0.06)' }}
            >
              <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl mb-4"
                style={{ background: t.bg }}
              >
                {t.icon}
              </div>
              <h3 className="font-bold text-lg mb-2" style={{ fontFamily: 'Syne, sans-serif' }}>{t.name}</h3>
              <p className="text-sm mb-5 flex-1" style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>{t.description}</p>
              <Link
                to={`/form/${t.slug}`}
                className="block text-center py-2.5 rounded-xl text-sm font-semibold transition-all no-underline"
                style={{ background: t.bg, color: t.color }}
              >
                Use This Template →
              </Link>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

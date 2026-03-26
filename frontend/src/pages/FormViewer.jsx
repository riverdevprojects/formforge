import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getFormBySlug, createSubmission } from '../utils/api.js';
import useFormSession from '../hooks/useFormSession.js';
import ProgressBar from '../components/ProgressBar.jsx';
import StepWrapper from '../components/StepWrapper.jsx';
import TextStep from '../components/steps/TextStep.jsx';
import PhotoStep from '../components/steps/PhotoStep.jsx';
import AudioStep from '../components/steps/AudioStep.jsx';
import VideoStep from '../components/steps/VideoStep.jsx';
import MultiChoiceStep from '../components/steps/MultiChoiceStep.jsx';
import SignatureStep from '../components/steps/SignatureStep.jsx';
import ConditionalStep from '../components/steps/ConditionalStep.jsx';

function StepRenderer({ step, value, onChange, responses }) {
  switch (step.type) {
    case 'text':
      return <TextStep config={step.config} value={value} onChange={onChange} />;
    case 'photo':
      return <PhotoStep config={step.config} value={value} onChange={onChange} />;
    case 'audio':
      return <AudioStep config={step.config} value={value} onChange={onChange} />;
    case 'video':
      return <VideoStep config={step.config} value={value} onChange={onChange} />;
    case 'multichoice':
      return <MultiChoiceStep config={step.config} value={value} onChange={onChange} />;
    case 'signature':
      return <SignatureStep config={step.config} value={value} onChange={onChange} />;
    case 'conditional':
      return <ConditionalStep config={step.config} value={value} onChange={onChange} responses={responses} />;
    default:
      return <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Unknown step type: {step.type}</p>;
  }
}

function ReviewSummary({ steps, responses, accentColor }) {
  return (
    <div>
      <h2 className="text-xl font-bold mb-1" style={{ fontFamily: 'Syne, sans-serif' }}>Review your answers</h2>
      <p className="text-sm mb-5" style={{ color: 'var(--text-secondary)' }}>
        Take a moment to review before submitting.
      </p>
      <div className="space-y-3">
        {steps.map((step) => {
          const field = step.config?.field;
          const val = field ? responses[field] : null;
          if (!val && val !== 0) return null;

          return (
            <div key={step.id} className="rounded-xl p-3" style={{ background: 'var(--surface-2)' }}>
              <p className="text-xs font-semibold mb-1" style={{ color: 'var(--text-secondary)' }}>
                {step.config.label}
              </p>
              <ReviewValue value={val} accentColor={accentColor} />
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ReviewValue({ value, accentColor }) {
  if (value instanceof Blob || value instanceof File) {
    const url = URL.createObjectURL(value);
    if (value.type.startsWith('image/')) {
      return <img src={url} alt="preview" className="rounded-xl w-full max-h-40 object-cover" />;
    }
    if (value.type.startsWith('audio/')) {
      return <audio controls src={url} className="w-full mt-1" />;
    }
    if (value.type.startsWith('video/')) {
      return <video controls src={url} className="w-full mt-1 rounded-xl" style={{ maxHeight: 200 }} />;
    }
    return <p className="text-sm">File ready to upload</p>;
  }
  if (Array.isArray(value)) {
    return (
      <div className="flex flex-wrap gap-1">
        {value.map((v) => (
          <span key={v} className="px-2.5 py-0.5 rounded-full text-xs font-medium" style={{ background: 'var(--accent-light)', color: 'var(--accent)' }}>
            {v}
          </span>
        ))}
      </div>
    );
  }
  return <p className="text-sm" style={{ color: 'var(--text-primary)' }}>{String(value)}</p>;
}

export default function FormViewer() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [showReview, setShowReview] = useState(false);

  const session = useFormSession(form?.steps || []);

  useEffect(() => {
    setLoading(true);
    getFormBySlug(slug)
      .then((data) => {
        setForm(data);
        // Apply accent color
        if (data.accent_color) {
          document.documentElement.style.setProperty('--accent', data.accent_color);
          // Compute light version (simple approach)
          document.documentElement.style.setProperty('--accent-light', hexToLight(data.accent_color));
        }
      })
      .catch((err) => {
        if (err.status === 404) setNotFound(true);
      })
      .finally(() => setLoading(false));

    return () => {
      // Reset accent color on unmount
      document.documentElement.style.removeProperty('--accent');
      document.documentElement.style.removeProperty('--accent-light');
    };
  }, [slug]);

  function hexToLight(hex) {
    // Simple lightening: mix with white at 85%
    try {
      const r = parseInt(hex.slice(1, 3), 16);
      const g = parseInt(hex.slice(3, 5), 16);
      const b = parseInt(hex.slice(5, 7), 16);
      const lr = Math.round(r + (255 - r) * 0.8);
      const lg = Math.round(g + (255 - g) * 0.8);
      const lb = Math.round(b + (255 - b) * 0.8);
      return `rgb(${lr},${lg},${lb})`;
    } catch {
      return '#dbeafe';
    }
  }

  async function handleSubmit() {
    setSubmitting(true);
    setSubmitError(null);

    try {
      await createSubmission(form.id, session.responses);
      navigate('/confirmation', { state: { formName: form.name } });
    } catch (err) {
      setSubmitError(err.message || 'Submission failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--surface-2)' }}>
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin mx-auto mb-3" style={{ borderColor: 'var(--accent)', borderTopColor: 'transparent' }} />
          <p style={{ color: 'var(--text-secondary)' }}>Loading form...</p>
        </div>
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4" style={{ background: 'var(--surface-2)' }}>
        <div className="step-card text-center">
          <p className="text-5xl mb-4">🔍</p>
          <h1 className="text-2xl font-bold mb-2" style={{ fontFamily: 'Syne, sans-serif' }}>Form not found</h1>
          <p className="mb-5" style={{ color: 'var(--text-secondary)' }}>
            The form "{slug}" doesn't exist or has been removed.
          </p>
          <a href="/" className="btn-primary block text-center py-3 rounded-2xl no-underline">Back to Home</a>
        </div>
      </div>
    );
  }

  const { currentStep, currentIndex, totalSteps, visibleSteps, responses, direction, isFirst, isLast, canProceed, setResponse, next, back } = session;

  if (showReview) {
    return (
      <div className="min-h-screen pb-10" style={{ background: 'var(--surface-2)' }}>
        <ProgressBar current={totalSteps - 1} total={totalSteps} accentColor={form.accent_color} />
        <div className="pt-8 px-4 max-w-[480px] mx-auto">
          {form.business_name && (
            <p className="text-center text-xs font-semibold mb-4" style={{ color: 'var(--text-secondary)' }}>
              {form.business_name}
            </p>
          )}
          <div className="step-card mb-4">
            <ReviewSummary steps={visibleSteps} responses={responses} accentColor={form.accent_color} />
          </div>

          {submitError && (
            <div className="rounded-xl p-3 mb-4 text-sm" style={{ background: '#fee2e2', color: 'var(--error)' }}>
              {submitError}
              <button onClick={handleSubmit} className="ml-3 underline font-semibold">Retry</button>
            </div>
          )}

          <div className="flex flex-col gap-3">
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="btn-primary py-4"
            >
              {submitting ? 'Submitting...' : 'Submit'}
            </button>
            <button
              onClick={() => setShowReview(false)}
              className="btn-secondary py-3"
              disabled={submitting}
            >
              Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!currentStep) return null;

  return (
    <div className="min-h-screen pb-10" style={{ background: 'var(--surface-2)' }}>
      <ProgressBar current={currentIndex} total={totalSteps} accentColor={form.accent_color} />

      <div className="pt-8 px-4 max-w-[480px] mx-auto">
        {form.business_name && (
          <p className="text-center text-xs font-semibold mb-4" style={{ color: 'var(--text-secondary)' }}>
            {form.business_name}
          </p>
        )}

        <StepWrapper stepKey={currentStep.id} direction={direction}>
          <div className="step-card mb-4">
            <p className="text-xs font-semibold mb-4" style={{ color: 'var(--text-secondary)' }}>
              Step {currentIndex + 1} of {totalSteps}
            </p>

            <StepRenderer
              step={currentStep}
              value={responses[currentStep.config?.field]}
              onChange={(val) => setResponse(currentStep.config?.field, val)}
              responses={responses}
            />
          </div>
        </StepWrapper>

        <div className="flex flex-col gap-3">
          <button
            onClick={isLast ? () => setShowReview(true) : next}
            disabled={!canProceed}
            className="btn-primary py-4"
          >
            {isLast ? 'Review & Submit' : 'Continue'}
          </button>

          {!isFirst && (
            <button onClick={back} className="btn-secondary py-3">
              Back
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

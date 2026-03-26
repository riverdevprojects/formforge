import { useState } from 'react';
import { isImageMime, isAudioMime, isVideoMime } from '../utils/fileHelpers.js';

export default function MediaPreview({ url, mime, filename, className = '' }) {
  const [lightboxOpen, setLightboxOpen] = useState(false);

  if (!url) return null;

  if (isImageMime(mime)) {
    return (
      <>
        <img
          src={url}
          alt={filename || 'media'}
          className={`rounded-2xl cursor-zoom-in object-cover ${className}`}
          onClick={() => setLightboxOpen(true)}
        />
        {lightboxOpen && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: 'rgba(0,0,0,0.85)' }}
            onClick={() => setLightboxOpen(false)}
          >
            <img
              src={url}
              alt={filename || 'media'}
              className="max-w-full max-h-full rounded-2xl object-contain"
              onClick={(e) => e.stopPropagation()}
            />
            <button
              className="absolute top-4 right-4 text-white text-2xl w-10 h-10 flex items-center justify-center rounded-full"
              style={{ background: 'rgba(255,255,255,0.15)' }}
              onClick={() => setLightboxOpen(false)}
            >
              ✕
            </button>
          </div>
        )}
      </>
    );
  }

  if (isAudioMime(mime)) {
    return (
      <audio controls className={`w-full rounded-xl ${className}`} src={url}>
        Your browser does not support audio playback.
      </audio>
    );
  }

  if (isVideoMime(mime)) {
    return (
      <video
        controls
        className={`w-full rounded-2xl ${className}`}
        src={url}
        style={{ maxHeight: 320 }}
      >
        Your browser does not support video playback.
      </video>
    );
  }

  return (
    <a href={url} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline text-sm">
      View file: {filename}
    </a>
  );
}

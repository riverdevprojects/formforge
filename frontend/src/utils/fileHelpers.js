export function formatBytes(bytes) {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

export function formatDuration(seconds) {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export function getMimeExtension(mimeType) {
  const map = {
    'audio/webm': '.webm',
    'audio/ogg': '.ogg',
    'audio/wav': '.wav',
    'audio/mp4': '.m4a',
    'video/webm': '.webm',
    'video/mp4': '.mp4',
    'image/jpeg': '.jpg',
    'image/png': '.png',
    'image/webp': '.webp',
  };
  return map[mimeType] || '';
}

export function blobToFile(blob, fieldName) {
  const ext = getMimeExtension(blob.type);
  return new File([blob], `${fieldName}${ext}`, { type: blob.type });
}

export function isImageMime(mime) {
  return mime && mime.startsWith('image/');
}

export function isAudioMime(mime) {
  return mime && mime.startsWith('audio/');
}

export function isVideoMime(mime) {
  return mime && mime.startsWith('video/');
}

export function fileSizeMB(bytes) {
  return bytes / (1024 * 1024);
}

import { useState, useRef, useCallback, useEffect } from 'react';

export default function useMediaCapture({ maxSeconds = 60 } = {}) {
  const [state, setState] = useState('idle'); // idle | requesting | previewing | recording | stopped | error
  const [duration, setDuration] = useState(0);
  const [blob, setBlob] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);

  const videoRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const streamRef = useRef(null);
  const chunksRef = useRef([]);
  const timerRef = useRef(null);

  const stopStream = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  }, []);

  const requestCamera = useCallback(async () => {
    setErrorMessage(null);
    setBlob(null);
    setDuration(0);
    chunksRef.current = [];

    if (!navigator.mediaDevices?.getUserMedia) {
      setErrorMessage('Video recording is not supported in this browser.');
      setState('error');
      return;
    }

    setState('requesting');

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
        audio: true,
      });
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.muted = true;
        videoRef.current.play().catch(() => {});
      }

      setState('previewing');
    } catch (err) {
      setState('error');
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setErrorMessage('Camera/microphone access denied. Please allow access in your browser settings.');
      } else {
        setErrorMessage(`Could not access camera: ${err.message}`);
      }
    }
  }, []);

  const startRecording = useCallback(() => {
    if (!streamRef.current) return;

    const mimeType = MediaRecorder.isTypeSupported('video/webm;codecs=vp9,opus')
      ? 'video/webm;codecs=vp9,opus'
      : MediaRecorder.isTypeSupported('video/webm')
      ? 'video/webm'
      : '';

    const recorder = new MediaRecorder(streamRef.current, mimeType ? { mimeType } : undefined);
    mediaRecorderRef.current = recorder;
    chunksRef.current = [];

    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) chunksRef.current.push(e.data);
    };

    recorder.onstop = () => {
      const videoBlob = new Blob(chunksRef.current, {
        type: mimeType || 'video/webm',
      });
      setBlob(videoBlob);
      setState('stopped');
      stopStream();
    };

    recorder.start(250);
    setState('recording');

    let elapsed = 0;
    timerRef.current = setInterval(() => {
      elapsed += 1;
      setDuration(elapsed);
      if (elapsed >= maxSeconds) {
        stopRecording();
      }
    }, 1000);
  }, [maxSeconds, stopStream]);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const reset = useCallback(() => {
    stopRecording();
    stopStream();
    setBlob(null);
    setDuration(0);
    setState('idle');
    setErrorMessage(null);
  }, [stopRecording, stopStream]);

  useEffect(() => {
    return () => {
      stopRecording();
      stopStream();
    };
  }, [stopRecording, stopStream]);

  return {
    state,
    duration,
    blob,
    errorMessage,
    videoRef,
    requestCamera,
    startRecording,
    stopRecording,
    reset,
    maxSeconds,
    isIdle: state === 'idle',
    isPreviewing: state === 'previewing',
    isRecording: state === 'recording',
    isStopped: state === 'stopped',
    isError: state === 'error',
  };
}

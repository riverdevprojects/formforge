import { useState, useRef, useEffect, useCallback } from 'react';

export default function useAudioRecorder({ maxMinutes = 2 } = {}) {
  const [state, setState] = useState('idle'); // idle | requesting | recording | stopped | error
  const [duration, setDuration] = useState(0);
  const [blob, setBlob] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);
  const [analyserData, setAnalyserData] = useState(new Uint8Array(64));

  const mediaRecorderRef = useRef(null);
  const streamRef = useRef(null);
  const chunksRef = useRef([]);
  const timerRef = useRef(null);
  const animFrameRef = useRef(null);
  const analyserRef = useRef(null);
  const audioCtxRef = useRef(null);

  const maxSeconds = maxMinutes * 60;

  const stopVisualization = useCallback(() => {
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }
  }, []);

  const startVisualization = useCallback((stream) => {
    try {
      const ctx = new AudioContext();
      audioCtxRef.current = ctx;
      const source = ctx.createMediaStreamSource(stream);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 128;
      source.connect(analyser);
      analyserRef.current = analyser;

      const data = new Uint8Array(analyser.frequencyBinCount);

      const tick = () => {
        analyser.getByteFrequencyData(data);
        setAnalyserData(new Uint8Array(data));
        animFrameRef.current = requestAnimationFrame(tick);
      };
      tick();
    } catch {
      // Visualization is non-critical; ignore errors
    }
  }, []);

  const stopStream = useCallback(() => {
    stopVisualization();
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    if (audioCtxRef.current) {
      audioCtxRef.current.close().catch(() => {});
      audioCtxRef.current = null;
    }
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, [stopVisualization]);

  const start = useCallback(async () => {
    setErrorMessage(null);
    setBlob(null);
    setDuration(0);
    chunksRef.current = [];

    if (!navigator.mediaDevices?.getUserMedia) {
      setErrorMessage('Audio recording is not supported in this browser.');
      setState('error');
      return;
    }

    setState('requesting');

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const mimeType = MediaRecorder.isTypeSupported('audio/webm')
        ? 'audio/webm'
        : MediaRecorder.isTypeSupported('audio/ogg')
        ? 'audio/ogg'
        : '';

      const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      recorder.onstop = () => {
        const audioBlob = new Blob(chunksRef.current, {
          type: mimeType || 'audio/webm',
        });
        setBlob(audioBlob);
        setState('stopped');
        stopStream();
      };

      recorder.start(250);
      setState('recording');
      startVisualization(stream);

      let elapsed = 0;
      timerRef.current = setInterval(() => {
        elapsed += 1;
        setDuration(elapsed);
        if (elapsed >= maxSeconds) {
          stop();
        }
      }, 1000);
    } catch (err) {
      setState('error');
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setErrorMessage('Microphone access denied. Please allow microphone access in your browser settings and try again.');
      } else {
        setErrorMessage(`Could not start recording: ${err.message}`);
      }
      stopStream();
    }
  }, [maxSeconds, startVisualization, stopStream]);

  const stop = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
  }, []);

  const reset = useCallback(() => {
    stop();
    stopStream();
    setBlob(null);
    setDuration(0);
    setState('idle');
    setErrorMessage(null);
    setAnalyserData(new Uint8Array(64));
  }, [stop, stopStream]);

  useEffect(() => {
    return () => {
      stop();
      stopStream();
    };
  }, [stop, stopStream]);

  return {
    state,
    duration,
    blob,
    errorMessage,
    analyserData,
    start,
    stop,
    reset,
    maxSeconds,
    isRecording: state === 'recording',
    isStopped: state === 'stopped',
    isError: state === 'error',
  };
}

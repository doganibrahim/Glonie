import { useState, useRef, useCallback } from 'react';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

// Normalise for comparison: lowercase, trim, strip punctuation
const normalise = (str = '') =>
  str.toLowerCase().trim().replace(/[.,!?;:'"-]/g, '');

/**
 * useSpeechRecognition — cross-browser implementation
 *
 * Strategy:
 *   1. Record audio with MediaRecorder (Firefox, Chrome, Safari, Arc — all supported)
 *   2. POST the audio blob to /api/transcribe (faster-whisper on backend)
 *   3. Compare returned transcript with targetText
 *
 * @param {{ targetText: string, lang: string, onResult: function }} options
 */
const useSpeechRecognition = ({ targetText = '', lang = 'en-US', onResult } = {}) => {
  // MediaRecorder is available in all modern browsers over localhost or HTTPS.
  // Firefox hides navigator.mediaDevices in non-secure contexts — check explicitly.
  const isSupported = Boolean(
    typeof window !== 'undefined' &&
    typeof window.MediaRecorder !== 'undefined' &&
    typeof navigator !== 'undefined' &&
    (navigator.mediaDevices != null
      ? typeof navigator.mediaDevices.getUserMedia === 'function'
      : false)
  );

  const [status, setStatus] = useState('idle'); // idle | listening | processing | done | error
  const [transcript, setTranscript] = useState('');
  const [isCorrect, setIsCorrect] = useState(null);
  const [permissionDenied, setPermissionDenied] = useState(false);
  const [isNetworkError, setIsNetworkError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const streamRef = useRef(null);
  const onResultRef = useRef(onResult);
  // Keep onResultRef up to date without re-running effects
  onResultRef.current = onResult;

  // Choose the best supported MIME type for MediaRecorder
  const getBestMimeType = () => {
    const candidates = [
      'audio/webm;codecs=opus',
      'audio/webm',
      'audio/ogg;codecs=opus',
      'audio/ogg',
      'audio/mp4',
    ];
    return candidates.find((t) => MediaRecorder.isTypeSupported(t)) || '';
  };

  const startListening = useCallback(async () => {
    if (!isSupported) return;
    if (status === 'listening') return;

    setStatus('listening');
    setTranscript('');
    setIsCorrect(null);
    setErrorMessage('');
    setPermissionDenied(false);
    setIsNetworkError(false);
    chunksRef.current = [];

    let stream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
    } catch {
      setPermissionDenied(true);
      setErrorMessage('micPermissionDenied');
      setStatus('error');
      return;
    }

    const mimeType = getBestMimeType();
    const options = mimeType ? { mimeType } : {};
    let recorder;

    try {
      recorder = new MediaRecorder(stream, options);
    } catch {
      // Retry without mimeType if the browser rejects it
      recorder = new MediaRecorder(stream);
    }

    mediaRecorderRef.current = recorder;

    recorder.ondataavailable = (e) => {
      if (e.data && e.data.size > 0) chunksRef.current.push(e.data);
    };

    recorder.onstop = async () => {
      // Stop mic tracks
      stream.getTracks().forEach((t) => t.stop());
      streamRef.current = null;

      const blob = new Blob(chunksRef.current, {
        type: recorder.mimeType || 'audio/webm',
      });

      await transcribeBlob(blob, recorder.mimeType || 'audio/webm');
    };

    recorder.onerror = () => {
      stream.getTracks().forEach((t) => t.stop());
      setErrorMessage('speechError');
      setStatus('error');
    };

    recorder.start();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSupported, status]);

  const stopListening = useCallback(() => {
    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state !== 'inactive'
    ) {
      mediaRecorderRef.current.stop();
      setStatus('processing');
    }
  }, []);

  const transcribeBlob = async (blob, mimeType) => {
    setStatus('processing');

    const formData = new FormData();
    // Extension hint helps the backend detect codec
    const ext = mimeType.includes('ogg') ? 'ogg' : mimeType.includes('mp4') ? 'mp4' : 'webm';
    formData.append('audio', blob, `recording.${ext}`);
    formData.append('lang', lang.split('-')[0]); // e.g. 'en'

    try {
      const res = await fetch(`${API_BASE}/api/transcribe`, {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.detail || `HTTP ${res.status}`);
      }

      const data = await res.json();
      const heard = (data.transcript || '').trim();
      setTranscript(heard);

      const correct = normalise(heard) === normalise(targetText);
      setIsCorrect(correct);
      setStatus('done');
      if (onResultRef.current) onResultRef.current(correct, heard);
    } catch (err) {
      if (err.message === 'Failed to fetch' || err.name === 'TypeError') {
        setIsNetworkError(true);
        setErrorMessage('networkError');
      } else {
        setErrorMessage('speechError');
      }
      setStatus('error');
    }
  };

  const reset = useCallback(() => {
    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state !== 'inactive'
    ) {
      mediaRecorderRef.current.stop();
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    mediaRecorderRef.current = null;
    chunksRef.current = [];
    setStatus('idle');
    setTranscript('');
    setIsCorrect(null);
    setErrorMessage('');
    setPermissionDenied(false);
    setIsNetworkError(false);
  }, []);

  return {
    isSupported,
    status,
    transcript,
    isCorrect,
    permissionDenied,
    isNetworkError,
    errorMessage,
    startListening,
    stopListening,
    reset,
  };
};

export default useSpeechRecognition;

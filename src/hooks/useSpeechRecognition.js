import { useState, useRef, useCallback } from 'react';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

// Normalise for comparison: lowercase, trim, strip punctuation
const normalise = (str = '') =>
  str.toLowerCase().trim().replace(/[.,!?;:'"¿¡-]/g, '');

// Levenshtein distance algorithm
const getLevenshteinDistance = (a, b) => {
  const matrix = [];
  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }
  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }
  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // substitution
          Math.min(matrix[i][j - 1] + 1, // insertion
          matrix[i - 1][j] + 1) // deletion
        );
      }
    }
  }
  return matrix[b.length][a.length];
};

const getSimilarityScore = (target, heard) => {
  const t = normalise(target);
  const h = normalise(heard);
  if (t.length === 0) return 0;
  if (t === h) return 100;
  
  const distance = getLevenshteinDistance(t, h);
  const maxLen = Math.max(t.length, h.length);
  const score = Math.max(0, 100 - (distance / maxLen) * 100);
  return Math.round(score);
};

const MAX_DURATION_MS   = 8000;  // hard cap: stop after 8 seconds
const SILENCE_THRESHOLD = 0.01;  // RMS amplitude below this = silence
const SILENCE_MS        = 1500;  // stop after this many ms of silence

/**
 * useSpeechRecognition — cross-browser implementation
 *
 * Strategy:
 *   1. Record audio with MediaRecorder (Firefox, Chrome, Safari, Arc — all supported)
 *   2. POST the audio blob to /api/transcribe (faster-whisper on backend)
 *   3. Compare returned transcript with targetText
 *
 * Auto-stop: 8s hard cap + 1.5s silence detection via AudioContext.
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

  const [status, setStatus]               = useState('idle'); // idle | listening | processing | done | error
  const [transcript, setTranscript]       = useState('');
  const [isCorrect, setIsCorrect]         = useState(null);
  const [similarityScore, setSimilarityScore] = useState(null);
  const [permissionDenied, setPermissionDenied] = useState(false);
  const [isNetworkError, setIsNetworkError]     = useState(false);
  const [errorMessage, setErrorMessage]   = useState('');
  const [isWarmingUp, setIsWarmingUp]     = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0); // 0–8 for progress bar

  const mediaRecorderRef = useRef(null);
  const chunksRef        = useRef([]);
  const streamRef        = useRef(null);
  const onResultRef      = useRef(onResult);
  const autoStopRef      = useRef(null); // { maxTimer, silenceInterval, countdownInterval, audioCtx }
  onResultRef.current = onResult;

  // ── Choose the best supported MIME type ─────────────────────
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

  // ── Clear all auto-stop timers & AudioContext ────────────────
  const clearAutoStop = () => {
    if (!autoStopRef.current) return;
    const { maxTimer, silenceInterval, countdownInterval, audioCtx } = autoStopRef.current;
    clearTimeout(maxTimer);
    clearInterval(silenceInterval);
    clearInterval(countdownInterval);
    try { audioCtx?.close(); } catch (_) {}
    autoStopRef.current = null;
  };

  // ── Start recording ──────────────────────────────────────────
  const startListening = useCallback(async () => {
    if (!isSupported) return;
    if (status === 'listening') return;

    setStatus('listening');
    setTranscript('');
    setIsCorrect(null);
    setSimilarityScore(null);
    setErrorMessage('');
    setPermissionDenied(false);
    setIsNetworkError(false);
    setRecordingSeconds(0);
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
    const options  = mimeType ? { mimeType } : {};
    let recorder;

    try {
      recorder = new MediaRecorder(stream, options);
    } catch {
      // Retry without explicit mimeType if browser rejects it
      recorder = new MediaRecorder(stream);
    }

    mediaRecorderRef.current = recorder;

    recorder.ondataavailable = (e) => {
      if (e.data && e.data.size > 0) chunksRef.current.push(e.data);
    };

    recorder.onstop = async () => {
      clearAutoStop();
      stream.getTracks().forEach((t) => t.stop());
      streamRef.current = null;

      const blob = new Blob(chunksRef.current, {
        type: recorder.mimeType || 'audio/webm',
      });
      await transcribeBlob(blob, recorder.mimeType || 'audio/webm');
    };

    recorder.onerror = () => {
      clearAutoStop();
      stream.getTracks().forEach((t) => t.stop());
      setErrorMessage('speechError');
      setStatus('error');
    };

    recorder.start();

    // ── Auto-stop: countdown + max duration + silence ────────
    const startTime = Date.now();

    // 1) Smooth countdown progress (every 100ms)
    const countdownInterval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      setRecordingSeconds(Math.min(elapsed / 1000, 8));
    }, 100);

    // 2) Hard max-duration cap
    const maxTimer = setTimeout(() => {
      if (mediaRecorderRef.current?.state !== 'inactive') {
        mediaRecorderRef.current.stop();
        setStatus('processing');
      }
    }, MAX_DURATION_MS);

    // 3) Silence detection via AudioContext
    let audioCtx = null;
    let silenceInterval = null;
    try {
      audioCtx = new AudioContext();
      const source   = audioCtx.createMediaStreamSource(stream);
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 256;
      source.connect(analyser);
      const dataArr = new Float32Array(analyser.fftSize);
      let silenceStart = null;

      silenceInterval = setInterval(() => {
        analyser.getFloatTimeDomainData(dataArr);
        const rms = Math.sqrt(
          dataArr.reduce((sum, v) => sum + v * v, 0) / dataArr.length
        );
        if (rms < SILENCE_THRESHOLD) {
          if (!silenceStart) silenceStart = Date.now();
          else if (Date.now() - silenceStart >= SILENCE_MS) {
            if (mediaRecorderRef.current?.state !== 'inactive') {
              mediaRecorderRef.current.stop();
              setStatus('processing');
            }
          }
        } else {
          silenceStart = null;
        }
      }, 100);
    } catch (_) {
      // AudioContext unavailable — skip silence detection, max timer still works
    }

    autoStopRef.current = { maxTimer, silenceInterval, countdownInterval, audioCtx };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSupported, status]);

  // ── Stop recording manually ──────────────────────────────────
  const stopListening = useCallback(() => {
    clearAutoStop();
    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state !== 'inactive'
    ) {
      mediaRecorderRef.current.stop();
      setStatus('processing');
    }
  }, []);

  // ── Send audio to Whisper ────────────────────────────────────
  const transcribeBlob = async (blob, mimeType) => {
    setStatus('processing');
    setRecordingSeconds(0);

    // First-time warmup notice (Whisper model may still be loading)
    const isFirst = !sessionStorage.getItem('whisper_warmed');
    if (isFirst) setIsWarmingUp(true);

    const formData = new FormData();
    const ext = mimeType.includes('ogg') ? 'ogg' : mimeType.includes('mp4') ? 'mp4' : 'webm';
    formData.append('audio', blob, `recording.${ext}`);
    formData.append('lang', lang.split('-')[0]); // e.g. 'en'

    try {
      const res = await fetch(`${API_BASE}/api/transcribe`, {
        method: 'POST',
        body: formData,
      });

      sessionStorage.setItem('whisper_warmed', '1');
      setIsWarmingUp(false);

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.detail || `HTTP ${res.status}`);
      }

      const data  = await res.json();
      const heard = (data.transcript || '').trim();
      setTranscript(heard);

      const score = getSimilarityScore(targetText, heard);
      // We consider it correct if similarity is >= 80%
      const correct = score >= 80;
      
      setSimilarityScore(score);
      setIsCorrect(correct);
      setStatus('done');
      if (onResultRef.current) onResultRef.current(correct, heard, score);
    } catch (err) {
      setIsWarmingUp(false);
      if (err.message === 'Failed to fetch' || err.name === 'TypeError') {
        setIsNetworkError(true);
        setErrorMessage('networkError');
      } else {
        setErrorMessage('speechError');
      }
      setStatus('error');
    }
  };

  // ── Reset to idle ────────────────────────────────────────────
  const reset = useCallback(() => {
    clearAutoStop();
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
    setSimilarityScore(null);
    setErrorMessage('');
    setPermissionDenied(false);
    setIsNetworkError(false);
    setIsWarmingUp(false);
    setRecordingSeconds(0);
  }, []);

  return {
    isSupported,
    status,
    transcript,
    isCorrect,
    similarityScore,
    permissionDenied,
    isNetworkError,
    errorMessage,
    isWarmingUp,
    recordingSeconds,
    startListening,
    stopListening,
    reset,
  };
};

export default useSpeechRecognition;

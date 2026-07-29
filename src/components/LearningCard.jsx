import { useState, useEffect, useCallback } from 'react';
import { useLocale } from '../hooks/useLocale';
import { CARD_TYPES, AUDIO } from '../constants/theme';
import useSpeechRecognition from '../hooks/useSpeechRecognition';
import { api } from '../services/api';

const LearningCard = ({ card, onNext, onPrevious, currentIndex, totalCards, onScoreUpdate }) => {
  const [showIPA, setShowIPA] = useState(false);
  const [audioElement, setAudioElement] = useState(null);
  const [fillBlankAnswer, setFillBlankAnswer] = useState('');
  const [fillBlankSubmitted, setFillBlankSubmitted] = useState(false);
  const [fillBlankCorrect, setFillBlankCorrect] = useState(false);
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [isShaking, setIsShaking] = useState(false);
  const [hint, setHint] = useState('');
  const [isHintLoading, setIsHintLoading] = useState(false);
  // Speech card state
  const [speechScoreReported, setSpeechScoreReported] = useState(false);
  const { t } = useLocale();

  const handleSpeechResult = useCallback(
    (correct, heard) => {
      if (!speechScoreReported) {
        setSpeechScoreReported(true);
        if (onScoreUpdate) onScoreUpdate(card.id, correct);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [card?.id, speechScoreReported]
  );

  const speech = useSpeechRecognition({
    targetText: card?.text_target || '',
    lang: 'en-US',
    onResult: handleSpeechResult,
  });

  // Auto-play audio when card loads (skip for SPEECH cards)
  useEffect(() => {
    if (card?.audio_url) {
      const audio = new Audio(card.audio_url);
      setAudioElement(audio);
      
      // Don't auto-play for SPEECH cards
      if (card.card_type === 'SPEECH') return;

      const playAudio = async () => {
        try {
          audio.volume = AUDIO.volume;
          await audio.play();
        } catch (error) {
          console.log('Auto-play blocked:', error.message);
        }
      };
      
      const timer = setTimeout(playAudio, AUDIO.autoPlayDelay);
      
      return () => {
        clearTimeout(timer);
        if (audio) {
          audio.pause();
          audio.currentTime = 0;
        }
      };
    }
  }, [card?.audio_url, card?.card_type]);

  // Reset fill-blank and speech state when card changes
  useEffect(() => {
    setFillBlankAnswer('');
    setFillBlankSubmitted(false);
    setFillBlankCorrect(false);
    setFailedAttempts(0);
    setIsShaking(false);
    setHint('');
    setSpeechScoreReported(false);
    speech.reset();
  // speech.reset is stable (useCallback with no deps), safe to include
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [card?.id, currentIndex]);

  const handleAudioPlay = () => {
    if (audioElement) {
      audioElement.currentTime = 0;
      audioElement.play().catch(error => {
        console.log('Audio play failed:', error);
      });
    }
  };

  const handleCardClick = () => {
    handleAudioPlay();
  };

  const handleFillBlankSubmit = (e) => {
    e.preventDefault();
    if (!fillBlankAnswer.trim()) return;
    const isCorrect = fillBlankAnswer.trim().toLowerCase() === (card.correct_answer || '').toLowerCase();
    setFillBlankCorrect(isCorrect);
    setFillBlankSubmitted(true);
    if (isCorrect) {
      // Report correct on first successful submission
      if (onScoreUpdate) onScoreUpdate(card.id, true);
    } else {
      const newAttempts = failedAttempts + 1;
      setFailedAttempts(newAttempts);
      setIsShaking(true);
      setTimeout(() => setIsShaking(false), 500);
      // After 2 failed attempts the answer is revealed — mark as incorrect
      if (newAttempts >= 2) {
        if (onScoreUpdate) onScoreUpdate(card.id, false);
      }
    }
  };

  const handleFillBlankRetry = () => {
    setFillBlankAnswer('');
    setFillBlankSubmitted(false);
    setFillBlankCorrect(false);
    // Don't reset hint on retry so they can still see it while typing
  };

  const handleGetHint = async (e) => {
    e.stopPropagation();
    setIsHintLoading(true);
    try {
      const data = await api.getHint(card.id, failedAttempts);
      setHint(data.hint);
    } catch (error) {
      console.error(error);
    } finally {
      setIsHintLoading(false);
    }
  };

  const renderCardContent = () => {
    if (card.card_type === 'FILL_BLANK') {
      const parts = card.text_target.split('{blank}');
      const showCorrectAnswer = !fillBlankCorrect && failedAttempts >= 2 && fillBlankSubmitted;
      return (
        <div className="text-center">
          <p className={`text-xl sm:text-2xl text-slate-800 dark:text-slate-100 leading-relaxed font-medium ${isShaking ? 'animate-shake' : ''}`}>
            {parts[0]}
            {fillBlankSubmitted ? (
              <span className={`inline-flex items-center px-1.5 py-0.5 sm:px-2 sm:py-1 mx-1 rounded-lg font-bold text-base sm:text-xl ${
                fillBlankCorrect 
                  ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-700' 
                  : 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400 border border-rose-300 dark:border-rose-700'
              }`}>
                {fillBlankAnswer}
                {fillBlankCorrect && (
                  <svg className="w-5 h-5 ml-1 text-emerald-600 dark:text-emerald-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                )}
              </span>
            ) : (
              <input
                type="text"
                value={fillBlankAnswer}
                onChange={(e) => setFillBlankAnswer(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') handleFillBlankSubmit(e); }}
                onClick={(e) => e.stopPropagation()}
                placeholder=""
                className="inline-block w-24 sm:w-32 h-9 px-2 mx-1 border-b-2 border-slate-300 dark:border-slate-600 rounded-none text-center text-base sm:text-lg font-medium focus:outline-none focus:border-emerald-500 dark:focus:border-emerald-400 bg-transparent text-slate-900 dark:text-white transition-colors"
                autoFocus
              />
            )}
            {parts[1]}
          </p>

          {/* Feedback */}
          {fillBlankSubmitted && (
            <div className={`mt-6 p-4 rounded-xl border ${
              fillBlankCorrect 
                ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800' 
                : 'bg-rose-50 dark:bg-rose-900/20 border-rose-200 dark:border-rose-800'
            }`}>
              {fillBlankCorrect ? (
                <div className="flex items-center justify-center">
                  <svg className="w-5 h-5 text-emerald-600 dark:text-emerald-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <p className="text-sm font-medium text-emerald-700 dark:text-emerald-300">{t('learning.correct')}</p>
                </div>
              ) : (
                <>
                  <p className="text-sm font-medium text-rose-700 dark:text-rose-300">
                    {showCorrectAnswer
                      ? t('learning.incorrect').replace('{answer}', card.correct_answer)
                      : t('learning.tryAgainHint').replace('{remaining}', String(2 - failedAttempts))}
                  </p>
                  
                  {hint && (
                    <div className="mt-4 mb-2 p-3 bg-violet-50 dark:bg-violet-900/20 border border-violet-200 dark:border-violet-800 rounded-lg text-violet-800 dark:text-violet-300 text-sm font-medium text-left shadow-sm">
                      💡 {hint}
                    </div>
                  )}

                  {!showCorrectAnswer && (
                    <div className="flex justify-center gap-3 mt-3">
                      <button
                        onClick={(e) => { e.stopPropagation(); handleFillBlankRetry(); }}
                        className="px-5 py-2 bg-white dark:bg-slate-800 border border-rose-200 dark:border-rose-700 hover:bg-rose-50 dark:hover:bg-rose-900/40 text-rose-700 dark:text-rose-400 rounded-lg text-sm font-medium transition-colors"
                      >
                        {t('learning.tryAgain')}
                      </button>
                      <button
                        onClick={handleGetHint}
                        disabled={isHintLoading}
                        className="px-5 py-2 bg-white dark:bg-slate-800 border border-violet-200 dark:border-violet-700 hover:bg-violet-50 dark:hover:bg-violet-900/40 text-violet-700 dark:text-violet-400 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                      >
                        {isHintLoading ? 'Yükleniyor...' : '💡 İpucu Al'}
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {/* Submit Button */}
          {!fillBlankSubmitted && fillBlankAnswer.trim() && (
            <button
              onClick={(e) => { e.stopPropagation(); handleFillBlankSubmit(e); }}
              className="mt-8 px-8 py-3 bg-slate-800 hover:bg-slate-900 dark:bg-emerald-600 dark:hover:bg-emerald-500 text-white rounded-xl text-sm font-bold tracking-wide transition-colors w-full sm:w-auto shadow-sm"
            >
              {t('learning.submit')}
            </button>
          )}
        </div>
      );
    }

    if (card.card_type === 'LISTENING') {
      const showCorrectAnswer = !fillBlankCorrect && failedAttempts >= 2 && fillBlankSubmitted;
      return (
        <div className="text-center w-full">
          <div className="mb-6">
            <button 
              onClick={(e) => { e.stopPropagation(); handleAudioPlay(); }}
              className="w-16 h-16 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-full flex items-center justify-center mx-auto hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors shadow-sm"
            >
              <svg className="w-8 h-8 ml-1" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
              </svg>
            </button>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-3">Dinle ve duyduğunu yaz</p>
          </div>
          
          <div className={isShaking ? 'animate-shake' : ''}>
            {fillBlankSubmitted && fillBlankCorrect ? (
              <p className="text-xl sm:text-2xl text-emerald-700 dark:text-emerald-400 font-bold bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 py-4 rounded-xl">
                {card.text_target}
              </p>
            ) : (
              <textarea
                value={fillBlankAnswer}
                onChange={(e) => setFillBlankAnswer(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleFillBlankSubmit(e); } }}
                onClick={(e) => e.stopPropagation()}
                placeholder="Duyduğunu buraya yaz..."
                className="w-full min-h-[100px] p-4 text-center text-lg font-medium border border-slate-300 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-400 dark:focus:ring-slate-500 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 resize-none transition-shadow"
                autoFocus
              />
            )}
          </div>

          {/* Feedback */}
          {fillBlankSubmitted && (
            <div className={`mt-6 p-4 rounded-xl border ${
              fillBlankCorrect 
                ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800' 
                : 'bg-rose-50 dark:bg-rose-900/20 border-rose-200 dark:border-rose-800'
            }`}>
              {fillBlankCorrect ? (
                <div className="flex items-center justify-center">
                  <svg className="w-5 h-5 text-emerald-600 dark:text-emerald-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <p className="text-sm font-medium text-emerald-700 dark:text-emerald-300">{t('learning.correct')}</p>
                </div>
              ) : (
                <>
                  <p className="text-sm font-medium text-rose-700 dark:text-rose-300">
                    {showCorrectAnswer
                      ? t('learning.incorrect').replace('{answer}', card.text_target)
                      : t('learning.tryAgainHint').replace('{remaining}', String(2 - failedAttempts))}
                  </p>
                  
                  {hint && (
                    <div className="mt-4 mb-2 p-3 bg-violet-50 dark:bg-violet-900/20 border border-violet-200 dark:border-violet-800 rounded-lg text-violet-800 dark:text-violet-300 text-sm font-medium text-left shadow-sm">
                      💡 {hint}
                    </div>
                  )}

                  {!showCorrectAnswer && (
                    <div className="flex justify-center gap-3 mt-3">
                      <button
                        onClick={(e) => { e.stopPropagation(); handleFillBlankRetry(); }}
                        className="px-5 py-2 bg-white dark:bg-slate-800 border border-rose-200 dark:border-rose-700 hover:bg-rose-50 dark:hover:bg-rose-900/40 text-rose-700 dark:text-rose-400 rounded-lg text-sm font-medium transition-colors"
                      >
                        {t('learning.tryAgain')}
                      </button>
                      <button
                        onClick={handleGetHint}
                        disabled={isHintLoading}
                        className="px-5 py-2 bg-white dark:bg-slate-800 border border-violet-200 dark:border-violet-700 hover:bg-violet-50 dark:hover:bg-violet-900/40 text-violet-700 dark:text-violet-400 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                      >
                        {isHintLoading ? 'Yükleniyor...' : '💡 İpucu Al'}
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {/* Submit Button */}
          {!fillBlankSubmitted && fillBlankAnswer.trim() && (
            <button
              onClick={(e) => { e.stopPropagation(); handleFillBlankSubmit(e); }}
              className="mt-8 px-8 py-3 bg-slate-800 hover:bg-slate-900 dark:bg-emerald-600 dark:hover:bg-emerald-500 text-white rounded-xl text-sm font-bold tracking-wide transition-colors w-full sm:w-auto shadow-sm"
            >
              {t('learning.submit')}
            </button>
          )}
        </div>
      );
    }

    return (
      <div className="text-center">
        <p className="text-xl sm:text-2xl text-slate-800 dark:text-slate-100 leading-relaxed font-medium">
          {card.text_target}
        </p>
        {card.card_type === 'SPEECH' && (
          <div className="mt-8" onClick={(e) => e.stopPropagation()}>
            {/* ── Unsupported browser fallback ── */}
            {!speech.isSupported ? (
              <div className="flex flex-col items-center gap-3">
                <p className="text-sm text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg px-4 py-3 text-center">
                  {t('learning.speechNotSupported')}
                </p>
                {!speechScoreReported && (
                  <button
                    onClick={() => {
                      setSpeechScoreReported(true);
                      if (onScoreUpdate) onScoreUpdate(card.id, true);
                    }}
                    className="px-6 py-2.5 bg-slate-800 hover:bg-slate-900 dark:bg-slate-700 dark:hover:bg-slate-600 text-white rounded-xl text-sm font-medium transition-colors"
                  >
                    {t('learning.manualVerify')}
                  </button>
                )}
                {speechScoreReported && (
                  <span className="text-sm text-emerald-700 dark:text-emerald-400 font-medium">✓ {t('learning.correctSpeech')}</span>
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center gap-4">
                {/* Hint text */}
                {speech.status === 'idle' && (
                  <p className="text-sm text-slate-500 dark:text-slate-400">{t('learning.speakNow')}</p>
                )}

                {/* Mic permission denied */}
                {speech.permissionDenied && (
                  <p className="text-sm text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800 rounded-lg px-4 py-3 text-center">
                    {t('learning.micPermissionDenied')}
                  </p>
                )}

                {/* Network error — prominent manual fallback */}
                {speech.isNetworkError && (
                  <div className="w-full p-5 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl text-center flex flex-col items-center gap-3">
                    <p className="text-sm font-medium text-amber-800 dark:text-amber-400">
                      🌐 {t('learning.networkError')}
                    </p>
                    {!speechScoreReported ? (
                      <button
                        onClick={() => {
                          setSpeechScoreReported(true);
                          if (onScoreUpdate) onScoreUpdate(card.id, true);
                        }}
                        className="px-6 py-2.5 bg-slate-800 hover:bg-slate-900 dark:bg-slate-700 dark:hover:bg-slate-600 text-white rounded-xl text-sm font-medium transition-colors"
                      >
                        {t('learning.manualVerify')}
                      </button>
                    ) : (
                      <span className="text-sm text-emerald-700 dark:text-emerald-400 font-medium">✓ {t('learning.correctSpeech')}</span>
                    )}
                  </div>
                )}

                {/* Other (non-network, non-permission) errors */}
                {speech.status === 'error' && !speech.permissionDenied && !speech.isNetworkError && speech.errorMessage && (
                  <p className="text-sm text-orange-700 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg px-4 py-3 text-center">
                    {t(`learning.${speech.errorMessage}`) || speech.errorMessage}
                  </p>
                )}

                {/* Animated mic button — hide when network error already showing manual fallback */}
                {speech.status !== 'done' && !speech.isNetworkError && (
                  <div className="flex flex-col items-center gap-3 w-full">
                    <button
                      disabled={speech.status === 'processing'}
                      onClick={speech.status === 'listening' ? speech.stopListening : speech.startListening}
                      className={`relative w-16 h-16 rounded-full flex items-center justify-center transition-all duration-300 focus:outline-none focus:ring-4 ${
                        speech.status === 'listening'
                          ? 'bg-rose-500 hover:bg-rose-600 focus:ring-rose-200 dark:focus:ring-rose-900 shadow-lg shadow-rose-200 dark:shadow-rose-900'
                          : speech.status === 'processing'
                            ? 'bg-slate-300 dark:bg-slate-600 cursor-not-allowed'
                            : 'bg-slate-800 dark:bg-slate-700 hover:bg-slate-900 dark:hover:bg-slate-600 focus:ring-slate-200 dark:focus:ring-slate-800 shadow-md'
                      }`}
                    >
                      {/* Pulse rings while listening */}
                      {speech.status === 'listening' && (
                        <>
                          <span className="absolute inset-0 rounded-full bg-rose-400 animate-ping opacity-40" />
                          <span className="absolute inset-[-6px] rounded-full border-2 border-rose-300 dark:border-rose-700 animate-pulse" />
                        </>
                      )}
                      <svg className="w-7 h-7 text-white relative z-10" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z" clipRule="evenodd" />
                      </svg>
                    </button>

                    {/* Countdown progress bar */}
                    {speech.status === 'listening' && (
                      <div className="w-24 h-1.5 bg-rose-100 dark:bg-rose-900/50 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-rose-500 rounded-full"
                          style={{ width: `${(speech.recordingSeconds / 8) * 100}%`, transition: 'width 0.1s linear' }}
                        />
                      </div>
                    )}

                    {/* Warmup notice — only on first-ever transcribe */}
                    {speech.status === 'processing' && speech.isWarmingUp && (
                      <p className="text-xs text-slate-400 dark:text-slate-500 italic text-center px-2">
                        {t('learning.warmingUp')}
                      </p>
                    )}
                  </div>
                )}

                {/* Status label — hide when network error or permission denied already shows its own message */}
                {!speech.isNetworkError && !speech.permissionDenied && (
                  <p className={`text-sm font-medium ${
                    speech.status === 'listening' ? 'text-rose-600 dark:text-rose-400' :
                    speech.status === 'done' && speech.isCorrect ? 'text-emerald-600 dark:text-emerald-400' :
                    speech.status === 'done' && !speech.isCorrect ? 'text-rose-600 dark:text-rose-400' :
                    'text-slate-500 dark:text-slate-400'
                  }`}>
                    {speech.status === 'idle'       && t('learning.tapToSpeak')}
                    {speech.status === 'listening'  && t('learning.listening')}
                    {speech.status === 'processing' && t('learning.processing')}
                    {speech.status === 'done' && speech.isCorrect  && t('learning.correctSpeech')}
                    {speech.status === 'done' && !speech.isCorrect && (
                      t('learning.incorrectSpeech').replace('{heard}', speech.transcript)
                    )}
                    {speech.status === 'error' && t('learning.tapToSpeak')}
                  </p>
                )}

                {/* Live transcript while listening */}
                {speech.status === 'listening' && speech.transcript && (
                  <p className="text-sm text-slate-500 dark:text-slate-400 italic">"{speech.transcript}"</p>
                )}

                {/* Result feedback & actions */}
                {speech.status === 'done' && (
                  <div className={`w-full p-4 rounded-xl border text-center ${
                    speech.isCorrect
                      ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800'
                      : speech.similarityScore >= 60
                        ? 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800'
                        : 'bg-rose-50 dark:bg-rose-900/20 border-rose-200 dark:border-rose-800'
                  }`}>
                    {speech.isCorrect ? (
                      <div className="flex items-center justify-center gap-2">
                        <svg className="w-5 h-5 text-emerald-600 dark:text-emerald-400" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        <span className="text-sm font-semibold text-emerald-700 dark:text-emerald-300">
                          {t('learning.correctSpeech')} {speech.similarityScore !== null && `(%${speech.similarityScore})`}
                        </span>
                      </div>
                    ) : speech.similarityScore >= 60 ? (
                      <div className="flex flex-col items-center gap-3">
                        <p className="text-sm text-amber-800 dark:text-amber-300 font-medium">
                          Neredeyse oldu! (%{speech.similarityScore})
                        </p>
                        <p className="text-sm text-amber-700 dark:text-amber-400/80 bg-white dark:bg-slate-900/50 px-3 py-1.5 rounded-lg border border-amber-100 dark:border-amber-800/50">
                          "{speech.transcript}"
                        </p>
                        <button
                          onClick={speech.reset}
                          className="px-5 py-2 bg-white dark:bg-slate-800 border border-amber-200 dark:border-amber-700 hover:bg-amber-50 dark:hover:bg-amber-900/40 text-amber-700 dark:text-amber-400 rounded-lg text-sm font-medium transition-colors mt-2"
                        >
                          {t('learning.tryAgainSpeech')}
                        </button>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-3">
                        <p className="text-sm text-rose-700 dark:text-rose-300 font-medium">
                          {t('learning.incorrectSpeech').replace('{heard}', speech.transcript)}
                        </p>
                        {speech.similarityScore !== null && (
                          <p className="text-xs text-rose-600 dark:text-rose-400">Eşleşme: %{speech.similarityScore}</p>
                        )}
                        <button
                          onClick={speech.reset}
                          className="px-5 py-2 bg-white dark:bg-slate-800 border border-rose-200 dark:border-rose-700 hover:bg-rose-50 dark:hover:bg-rose-900/40 text-rose-700 dark:text-rose-400 rounded-lg text-sm font-medium transition-colors mt-1"
                        >
                          {t('learning.tryAgainSpeech')}
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* Subtle manual fallback for non-network errors (e.g. no-speech) */}
                {speech.status === 'error' && !speech.permissionDenied && !speech.isNetworkError && !speechScoreReported && (
                  <button
                    onClick={() => {
                      setSpeechScoreReported(true);
                      if (onScoreUpdate) onScoreUpdate(card.id, true);
                    }}
                    className="text-xs text-slate-400 dark:text-slate-500 underline hover:text-slate-600 dark:hover:text-slate-300 transition-colors mt-2"
                  >
                    {t('learning.manualVerify')}
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  const getCardTypeConfig = (type) => {
    const config = CARD_TYPES[type] || CARD_TYPES.DEFAULT;
    return config;
  };

  const cardConfig = getCardTypeConfig(card.card_type);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex flex-col items-center justify-center px-4 py-6 sm:p-6 font-sans">
      <div className="w-full max-w-lg">
        {/* Progress Bar */}
        <div className="mb-4 sm:mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium">{t('learning.progress')}</span>
            <span className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium">
              {currentIndex + 1} / {totalCards}
            </span>
          </div>
          <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-2">
            <div
              className="bg-emerald-500 dark:bg-emerald-400 h-2 rounded-full transition-all duration-500"
              style={{ width: `${((currentIndex + 1) / totalCards) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Card */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden transform transition-all duration-200">
          {/* Card Header */}
          <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-100 dark:border-slate-700/50 bg-slate-50/50 dark:bg-slate-800/50">
            <div className="flex items-center min-w-0">
              <div className={`w-3 h-3 rounded-full mr-3 shrink-0 ${cardConfig.color}`}></div>
              <span className="font-semibold text-slate-700 dark:text-slate-300 text-sm sm:text-base truncate">{t(`cardTypes.${cardConfig.label}`)}</span>
            </div>
            <button
              onClick={() => setShowIPA(!showIPA)}
              className="text-xs sm:text-sm text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300 font-medium shrink-0 ml-3 transition-colors"
            >
              {showIPA ? t('learning.hideIPA') : t('learning.showIPA')}
            </button>
          </div>

          {/* Card Content */}
          <div 
            className="p-5 sm:p-8 cursor-pointer"
            onClick={handleCardClick}
          >
            {/* Image */}
            <div className="mb-6 sm:mb-8">
              <div className="w-full h-40 sm:h-52 bg-slate-50 dark:bg-slate-900/50 rounded-xl overflow-hidden border border-slate-100 dark:border-slate-800 flex items-center justify-center p-2">
                <img
                  src={card.image_url}
                  alt={card.text_target}
                  className="max-w-full max-h-full object-contain rounded-md"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'flex';
                  }}
                />
                <div className="w-full h-full flex items-center justify-center text-slate-400 dark:text-slate-600" style={{display: 'none'}}>
                  <div className="text-center">
                    <div className="text-4xl mb-3 opacity-50">📷</div>
                    <p className="text-sm font-medium">{card.text_target}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Text Content */}
            <div className="mb-2">
              {renderCardContent()}
              
              {/* IPA Transcription */}
              {showIPA && (
                <div className="mt-6 p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-200 dark:border-slate-800">
                  <div className="text-center">
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2">{t('learning.pronunciation')}</p>
                    <p className="text-slate-700 dark:text-slate-300 font-mono text-lg tracking-wide">
                      {card.text_ipa}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Navigation */}
          <div className="flex justify-between items-center p-4 sm:p-5 bg-slate-50/80 dark:bg-slate-900/30 border-t border-slate-100 dark:border-slate-700/50">
            <button
              onClick={onPrevious}
              disabled={currentIndex === 0}
              className="flex items-center px-2 py-1.5 sm:px-4 sm:py-2 text-sm sm:text-base text-slate-500 dark:text-slate-400 disabled:opacity-30 disabled:cursor-not-allowed hover:text-slate-800 dark:hover:text-slate-200 font-medium shrink-0 transition-colors"
            >
              <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              <span className="hidden sm:inline">Önceki</span>
            </button>

            <div className="flex flex-wrap justify-center gap-1 sm:gap-1.5 max-w-[40%] overflow-hidden px-2">
              {Array.from({ length: totalCards }).map((_, index) => (
                <div
                  key={index}
                  className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full transition-colors duration-300 ${
                    index === currentIndex 
                      ? 'bg-emerald-500 dark:bg-emerald-400' 
                      : index < currentIndex 
                        ? 'bg-emerald-200 dark:bg-emerald-900' 
                        : 'bg-slate-200 dark:bg-slate-700'
                  }`}
                />
              ))}
            </div>

            <button
              onClick={() => {
                onNext();
              }}
              className={`flex items-center px-2 py-1.5 sm:px-4 sm:py-2 text-sm sm:text-base font-semibold shrink-0 transition-colors ${
                currentIndex === totalCards - 1
                  ? 'text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300'
                  : 'text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <span className="hidden sm:inline">{currentIndex === totalCards - 1 ? t('learning.finish') : t('learning.next')}</span>
              <span className="sm:hidden">{currentIndex === totalCards - 1 ? 'Bitir' : 'İleri'}</span>
              {currentIndex !== totalCards - 1 && (
                <svg className="w-5 h-5 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Instructions */}
        <div className="mt-6 text-center text-sm font-medium text-slate-400 dark:text-slate-500">
          {t('learning.instructions')}
        </div>
      </div>
    </div>
  );
};

export default LearningCard;
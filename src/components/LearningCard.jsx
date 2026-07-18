import { useState, useEffect } from 'react';
import { useLocale } from '../hooks/useLocale';
import { CARD_TYPES, AUDIO } from '../constants/theme';

const LearningCard = ({ card, onNext, onPrevious, currentIndex, totalCards, onScoreUpdate }) => {
  const [showIPA, setShowIPA] = useState(false);
  const [audioElement, setAudioElement] = useState(null);
  const [fillBlankAnswer, setFillBlankAnswer] = useState('');
  const [fillBlankSubmitted, setFillBlankSubmitted] = useState(false);
  const [fillBlankCorrect, setFillBlankCorrect] = useState(false);
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [isShaking, setIsShaking] = useState(false);
  const { t } = useLocale();

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

  // Reset fill-blank state when card changes
  useEffect(() => {
    setFillBlankAnswer('');
    setFillBlankSubmitted(false);
    setFillBlankCorrect(false);
    setFailedAttempts(0);
    setIsShaking(false);
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
  };

  const renderCardContent = () => {
    if (card.card_type === 'FILL_BLANK') {
      const parts = card.text_target.split('{blank}');
      const showCorrectAnswer = !fillBlankCorrect && failedAttempts >= 2 && fillBlankSubmitted;
      return (
        <div className="text-center">
          <p className={`text-xl sm:text-2xl text-gray-800 leading-relaxed font-medium ${isShaking ? 'animate-shake' : ''}`}>
            {parts[0]}
            {fillBlankSubmitted ? (
              <span className={`inline-flex items-center px-1.5 py-0.5 sm:px-2 sm:py-1 mx-1 rounded-lg font-bold text-base sm:text-xl ${
                fillBlankCorrect 
                  ? 'bg-green-100 text-green-700 border border-green-300' 
                  : 'bg-red-100 text-red-700 border border-red-300'
              }`}>
                {fillBlankAnswer}
                {fillBlankCorrect && (
                  <svg className="w-5 h-5 ml-1 text-green-600" fill="currentColor" viewBox="0 0 20 20">
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
                className="inline-block w-24 sm:w-32 h-8 px-2 mx-1 border-2 border-blue-300 rounded-lg text-center text-sm sm:text-base focus:outline-none focus:border-blue-500 bg-blue-50"
                autoFocus
              />
            )}
            {parts[1]}
          </p>

          {/* Feedback */}
          {fillBlankSubmitted && (
            <div className={`mt-4 p-3 rounded-lg border ${
              fillBlankCorrect 
                ? 'bg-green-50 border-green-200' 
                : 'bg-red-50 border-red-200'
            }`}>
              {fillBlankCorrect ? (
                <div className="flex items-center justify-center">
                  <svg className="w-5 h-5 text-green-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <p className="text-sm font-medium text-green-700">{t('learning.correct')}</p>
                </div>
              ) : (
                <>
                  <p className="text-sm font-medium text-red-700">
                    {showCorrectAnswer
                      ? t('learning.incorrect').replace('{answer}', card.correct_answer)
                      : t('learning.tryAgainHint').replace('{remaining}', String(2 - failedAttempts))}
                  </p>
                  {!showCorrectAnswer && (
                    <button
                      onClick={(e) => { e.stopPropagation(); handleFillBlankRetry(); }}
                      className="mt-2 px-4 py-1.5 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg text-sm font-medium transition-colors"
                    >
                      {t('learning.tryAgain')}
                    </button>
                  )}
                </>
              )}
            </div>
          )}

          {/* Submit Button */}
          {!fillBlankSubmitted && fillBlankAnswer.trim() && (
            <button
              onClick={(e) => { e.stopPropagation(); handleFillBlankSubmit(e); }}
              className="mt-4 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
            >
              {t('learning.submit')}
            </button>
          )}
        </div>
      );
    }

    return (
      <div className="text-center">
        <p className="text-xl sm:text-2xl text-gray-800 leading-relaxed font-medium">
          {card.text_target}
        </p>
        {card.card_type === 'SPEECH' && (
          <div className="mt-4">
            <button
              onClick={(e) => { e.stopPropagation(); /* TODO: implement speech recognition */ }}
              className="inline-flex items-center bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm hover:bg-blue-100 transition-colors cursor-pointer"
            >
              <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z" clipRule="evenodd" />
              </svg>
              {t('learning.speakYourAnswer')}
            </button>
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
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-2 py-3 sm:p-4">
      <div className="w-full max-w-lg">
        {/* Progress Bar */}
        <div className="mb-4 sm:mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs sm:text-sm text-gray-600">{t('learning.progress')}</span>
            <span className="text-xs sm:text-sm text-gray-600">
              {currentIndex + 1} / {totalCards}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-green-500 h-2 rounded-full transition-all duration-500"
              style={{ width: `${((currentIndex + 1) / totalCards) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Card */}
        <div className="bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">
          {/* Card Header */}
          <div className="flex items-center justify-between p-3 sm:p-4 border-b border-gray-200">
            <div className="flex items-center min-w-0">
              <div className={`w-3 h-3 rounded-full mr-2 shrink-0 ${cardConfig.color}`}></div>
              <span className="font-medium text-gray-700 text-sm sm:text-base truncate">{t(`cardTypes.${cardConfig.label}`)}</span>
            </div>
            <button
              onClick={() => setShowIPA(!showIPA)}
              className="text-xs sm:text-sm text-blue-600 hover:text-blue-800 font-medium shrink-0 ml-2"
            >
              {showIPA ? t('learning.hideIPA') : t('learning.showIPA')}
            </button>
          </div>

          {/* Card Content */}
          <div 
            className="p-3 sm:p-6 cursor-pointer"
            onClick={handleCardClick}
          >
            {/* Image */}
            <div className="mb-4 sm:mb-6">
              <div className="w-full h-32 sm:h-48 bg-gray-100 rounded-lg overflow-hidden border border-gray-200">
                <img
                  src={card.image_url}
                  alt={card.text_target}
                  className="w-full h-full object-contain"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'flex';
                  }}
                />
                <div className="w-full h-full flex items-center justify-center text-gray-500" style={{display: 'none'}}>
                  <div className="text-center">
                    <div className="text-3xl mb-2">📷</div>
                    <p className="text-sm text-gray-600">{card.text_target}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Text Content */}
            <div className="mb-4 sm:mb-6">
              {renderCardContent()}
              
              {/* IPA Transcription */}
              {showIPA && (
                <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="text-center">
                    <p className="text-sm text-blue-700 mb-1">{t('learning.pronunciation')}</p>
                    <p className="text-blue-800 font-mono text-lg">
                      {card.text_ipa}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Navigation */}
          <div className="flex justify-between items-center p-2 sm:p-4 bg-gray-50 border-t border-gray-200">
            <button
              onClick={onPrevious}
              disabled={currentIndex === 0}
              className="flex items-center px-2 py-1.5 sm:px-4 sm:py-2 text-sm sm:text-base text-gray-600 disabled:text-gray-400 disabled:cursor-not-allowed hover:text-gray-800 font-medium shrink-0"
            >
              <svg className="w-4 h-4 mr-0.5 sm:mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              <span className="hidden sm:inline">Previous</span>
              <span className="sm:hidden">Prev</span>
            </button>

            <div className="flex flex-wrap justify-center gap-0.5 sm:gap-1 max-w-[40%] overflow-hidden">
              {Array.from({ length: totalCards }).map((_, index) => (
                <div
                  key={index}
                  className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full ${
                    index === currentIndex 
                      ? 'bg-green-500' 
                      : index < currentIndex 
                        ? 'bg-green-300' 
                        : 'bg-gray-300'
                  }`}
                />
              ))}
            </div>

            <button
              onClick={() => {
                onNext();
              }}
              className={`flex items-center px-2 py-1.5 sm:px-4 sm:py-2 text-sm sm:text-base font-medium shrink-0 ${
                currentIndex === totalCards - 1
                  ? 'text-green-600 hover:text-green-700'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              {currentIndex === totalCards - 1 ? t('learning.finish') : t('learning.next')}
              <svg className="w-4 h-4 ml-0.5 sm:ml-1" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </div>

        {/* Instructions */}
        <div className="mt-4 text-center text-sm text-gray-500">
          {t('learning.instructions')}
        </div>
      </div>
    </div>
  );
};

export default LearningCard;
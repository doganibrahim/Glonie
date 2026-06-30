import { useState, useEffect } from 'react';
import { useLocale } from '../hooks/useLocale';
import { CARD_TYPES, AUDIO } from '../constants/theme';

const LearningCard = ({ card, onNext, onPrevious, currentIndex, totalCards }) => {
  const [showIPA, setShowIPA] = useState(false);
  const [audioElement, setAudioElement] = useState(null);
  const { t } = useLocale();

  // Auto-play audio when card loads
  useEffect(() => {
    if (card?.audio_url) {
      const audio = new Audio(card.audio_url);
      setAudioElement(audio);
      
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
  }, [card?.audio_url]);

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

  const renderCardContent = () => {
    if (card.card_type === 'FILL_BLANK') {
      const parts = card.text_target.split('{blank}');
      return (
        <div className="text-center">
          <p className="text-2xl text-gray-800 leading-relaxed font-medium">
            {parts[0]}
            <span className="inline-block w-20 h-8 bg-blue-100 border-2 border-blue-300 mx-2 rounded-lg border-dashed"></span>
            {parts[1]}
          </p>
        </div>
      );
    }

    return (
      <div className="text-center">
        <p className="text-2xl text-gray-800 leading-relaxed font-medium">
          {card.text_target}
        </p>
        {card.card_type === 'SPEECH' && (
          <div className="mt-4">
            <div className="inline-flex items-center bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm">
              <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z" clipRule="evenodd" />
              </svg>
              Speak your answer
            </div>
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
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        {/* Progress Bar */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-gray-600">{t('learning.progress')}</span>
            <span className="text-sm text-gray-600">
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
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <div className="flex items-center">
              <div className={`w-3 h-3 rounded-full mr-2 ${cardConfig.color}`}></div>
              <span className="font-medium text-gray-700">{t(`cardTypes.${cardConfig.label}`)}</span>
            </div>
            <button
              onClick={() => setShowIPA(!showIPA)}
              className="text-sm text-blue-600 hover:text-blue-800 font-medium"
            >
              {showIPA ? t('learning.hideIPA') : t('learning.showIPA')}
            </button>
          </div>

          {/* Card Content */}
          <div 
            className="p-6 cursor-pointer"
            onClick={handleCardClick}
          >
            {/* Image */}
            <div className="mb-6">
              <div className="w-full h-48 bg-gray-100 rounded-lg overflow-hidden border border-gray-200">
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
            <div className="mb-6">
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
          <div className="flex justify-between items-center p-4 bg-gray-50 border-t border-gray-200">
            <button
              onClick={onPrevious}
              disabled={currentIndex === 0}
              className="flex items-center px-4 py-2 text-gray-600 disabled:text-gray-400 disabled:cursor-not-allowed hover:text-gray-800 font-medium"
            >
              <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              Previous
            </button>

            <div className="flex space-x-1">
              {Array.from({ length: totalCards }).map((_, index) => (
                <div
                  key={index}
                  className={`w-2 h-2 rounded-full ${
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
              disabled={currentIndex === totalCards - 1}
              className="flex items-center px-4 py-2 text-gray-600 disabled:text-gray-400 disabled:cursor-not-allowed hover:text-gray-800 font-medium"
            >
              {t('learning.next')}
              <svg className="w-4 h-4 ml-1" fill="currentColor" viewBox="0 0 20 20">
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
import { useState, useEffect, useMemo } from 'react';
import { api } from '../services/api';
import { useLocale } from '../hooks/useLocale';
import { AUDIO } from '../constants/theme';

const SHUFFLE_STORAGE_KEY = 'wordbank_shuffle';

// Fisher-Yates shuffle
const shuffleArray = (array) => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

const WordBank = ({ onBack }) => {
  const [lessons, setLessons] = useState([]);
  const [completedLessons, setCompletedLessons] = useState([]);
  const [selectedLessonId, setSelectedLessonId] = useState('all');
  const [shuffleMode, setShuffleMode] = useState(
    () => localStorage.getItem(SHUFFLE_STORAGE_KEY) === 'true'
  );
  const [shuffleSeed, setShuffleSeed] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [playingAudioId, setPlayingAudioId] = useState(null);
  const { t } = useLocale();

  useEffect(() => {
    const fetchLessons = async () => {
      try {
        setLoading(true);
        const data = await api.getLessons();

        // Filter to only lessons marked as done in localStorage
        const done = data.filter(
          (lesson) => localStorage.getItem(`lesson_done_${lesson.id}`) === 'true'
        );

        setLessons(data);
        setCompletedLessons(done);
      } catch (err) {
        setError('Failed to load word bank');
        console.error('Error fetching lessons:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchLessons();
  }, []);

  const handlePlayAudio = (audioUrl, cardId) => {
    const audio = new Audio(audioUrl);
    audio.volume = AUDIO.volume;
    setPlayingAudioId(cardId);
    audio.play().catch((err) => console.log('Audio play failed:', err));
    audio.addEventListener('ended', () => setPlayingAudioId(null));
  };

  const handleToggleShuffle = () => {
    const next = !shuffleMode;
    setShuffleMode(next);
    localStorage.setItem(SHUFFLE_STORAGE_KEY, String(next));
    // Trigger a new shuffle order
    if (next) setShuffleSeed((s) => s + 1);
  };

  // Gather all word entries from completed lessons
  const getFilteredEntries = () => {
    const source =
      selectedLessonId === 'all'
        ? completedLessons
        : completedLessons.filter((l) => l.id === Number(selectedLessonId));

    // Collect cards, deduplicate by text_target
    const seen = new Set();
    const entries = [];

    for (const lesson of source) {
      for (const card of lesson.cards || []) {
        // Skip fill-blank exercise cards that have template text
        if (card.text_target.includes('{blank}')) continue;
        if (seen.has(card.text_target.toLowerCase())) continue;
        seen.add(card.text_target.toLowerCase());
        entries.push({ ...card, lessonTitle: lesson.title });
      }
    }

    return entries;
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const entries = useMemo(() => {
    const raw = getFilteredEntries();
    return shuffleMode ? shuffleArray(raw) : raw;
  }, [completedLessons, selectedLessonId, shuffleMode, shuffleSeed]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-gray-300 border-t-emerald-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-2xl mx-auto px-6 py-6">
          <div className="flex items-center mb-4">
            <button
              onClick={onBack}
              className="text-gray-600 hover:text-gray-800 mr-4 flex items-center font-medium"
            >
              <svg className="w-5 h-5 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
              {t('learning.back')}
            </button>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">{t('wordBank.title')}</h1>
          <p className="text-gray-500 mt-2 text-lg">{t('wordBank.subtitle')}</p>
        </div>
      </div>

      {/* Filter & Shuffle Controls */}
      <div className="max-w-2xl mx-auto px-6 pt-6 flex flex-wrap items-center gap-3">
        <select
          value={selectedLessonId}
          onChange={(e) => setSelectedLessonId(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
          aria-label={t('wordBank.filterLabel')}
        >
          <option value="all">{t('wordBank.allLessons')}</option>
          {completedLessons.map((lesson) => (
            <option key={lesson.id} value={lesson.id}>
              {lesson.title}
            </option>
          ))}
        </select>

        <button
          onClick={handleToggleShuffle}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg border font-medium text-sm transition-colors ${
            shuffleMode
              ? 'bg-emerald-50 border-emerald-300 text-emerald-700'
              : 'bg-white border-gray-300 text-gray-600 hover:bg-gray-50'
          }`}
          aria-pressed={shuffleMode}
          aria-label={t('wordBank.shuffle')}
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path d="M3 3a1 1 0 011 1v.5h1.586a2 2 0 011.414.586l1.828 1.828A4.016 4.016 0 008 8.5H4V9a1 1 0 01-2 0V4a1 1 0 011-1zm14 0a1 1 0 011 1v5a1 1 0 11-2 0v-.5h-1.586a2 2 0 01-1.414-.586L11.172 6.086A4.016 4.016 0 0012 4.5H16V4a1 1 0 011-1zM3 11a1 1 0 011 1v.5h4a4.016 4.016 0 00.828-1.586l1.828 1.828A2 2 0 019.586 13.5H4V14a1 1 0 11-2 0v-5a1 1 0 011-1h1zm14 0a1 1 0 011 1v5a1 1 0 11-2 0v-.5h-4a4.016 4.016 0 01-.828 1.586l-1.828-1.828a2 2 0 011.07-.758H16v-.5a1 1 0 011-1z" />
          </svg>
          {t('wordBank.shuffle')}
        </button>
      </div>

      {/* Word List */}
      <div className="max-w-2xl mx-auto px-6 py-6">
        {completedLessons.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-4xl mb-4">📚</div>
            <p className="text-gray-600 text-lg">{t('wordBank.noCompleted')}</p>
          </div>
        ) : entries.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-gray-500">{t('wordBank.noEntries')}</p>
          </div>
        ) : (
          <div className="space-y-3">
            {entries.map((entry) => (
              <div
                key={`${entry.lesson_id}-${entry.id}`}
                className="bg-white rounded-xl border border-gray-200 p-4 flex items-center gap-4 hover:shadow-sm transition-shadow"
              >
                {/* Thumbnail */}
                <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100 border border-gray-200 shrink-0">
                  <img
                    src={entry.image_url}
                    alt={entry.text_target}
                    className="w-full h-full object-contain"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'flex';
                    }}
                  />
                  <div
                    className="w-full h-full items-center justify-center text-gray-400 text-xl"
                    style={{ display: 'none' }}
                  >
                    📷
                  </div>
                </div>

                {/* Text */}
                <div className="flex-1 min-w-0">
                  <p className="text-lg font-semibold text-gray-900 truncate">
                    {entry.text_target}
                  </p>
                  <p className="text-sm text-blue-700 font-mono truncate">
                    {entry.text_ipa}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">{entry.lessonTitle}</p>
                </div>

                {/* Audio Button */}
                <button
                  onClick={() => handlePlayAudio(entry.audio_url, entry.id)}
                  className={`shrink-0 w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                    playingAudioId === entry.id
                      ? 'bg-emerald-100 text-emerald-700'
                      : 'bg-gray-100 text-gray-600 hover:bg-emerald-50 hover:text-emerald-600'
                  }`}
                  aria-label={`${t('wordBank.playAudio')} ${entry.text_target}`}
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default WordBank;

import { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useLocale } from '../hooks/useLocale';
import { LESSON_COLORS } from '../constants/theme';

const LessonSelect = ({ onLessonSelect, onOpenWordBank }) => {
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { t } = useLocale();

  useEffect(() => {
    const fetchLessons = async () => {
      try {
        setLoading(true);
        const data = await api.getLessons();
        setLessons(data);
      } catch (err) {
        setError('Failed to load lessons');
        console.error('Error fetching lessons:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchLessons();
  }, []);

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
        <div className="max-w-2xl mx-auto px-4 py-4 sm:px-6 sm:py-6">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 truncate">{t('lessons.title')}</h1>
              <p className="text-gray-500 mt-1 sm:mt-2 text-base sm:text-lg">{t('lessons.subtitle')}</p>
            </div>
            <button
              onClick={onOpenWordBank}
              className="shrink-0 flex items-center gap-1.5 sm:gap-2 px-3 py-1.5 sm:px-4 sm:py-2 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg hover:bg-emerald-100 transition-colors font-medium text-xs sm:text-sm"
              aria-label={t('wordBank.title')}
            >
              <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z" />
              </svg>
              <span className="hidden xs:inline">{t('wordBank.title')}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Lessons */}
      <div className="max-w-2xl mx-auto px-4 py-6 sm:px-6 sm:py-8">
        <div className="space-y-3 sm:space-y-4">
          {lessons.map((lesson, index) => {
            // First lesson always open; others unlock when the previous lesson is done
            const isLocked = index > 0 && localStorage.getItem(`lesson_done_${lessons[index - 1]?.id}`) !== 'true';
            const color = LESSON_COLORS[index % LESSON_COLORS.length];
            const totalCards = lesson.cards?.length || 0;
            const savedProgress = localStorage.getItem(`lesson_progress_${lesson.id}`);
            const progressCount = savedProgress !== null ? Math.min(Number(savedProgress), totalCards) : 0;
            const isCompleted = progressCount >= totalCards && totalCards > 0;

            return (
              <div
                key={lesson.id}
                className={`
                  rounded-2xl border p-4 sm:p-6 transition-all duration-200
                  ${isLocked
                    ? 'bg-gray-50 border-gray-200 cursor-not-allowed opacity-60'
                    : `${color.bg} ${color.border} ${color.hover} cursor-pointer`
                  }
                `}
                onClick={() => !isLocked && onLessonSelect(lesson.id)}
              >
                <div className="flex items-center">
                  {/* Circle */}
                  <div className={`
                    w-10 h-10 sm:w-14 sm:h-14 rounded-full flex items-center justify-center text-white font-bold text-sm sm:text-lg mr-3 sm:mr-5 shrink-0
                    ${isLocked ? 'bg-gray-300' : color.circle}
                  `}>
                    {isLocked ? (
                      <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                      </svg>
                    ) : (
                      <span>{lesson.order_index}</span>
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-base sm:text-xl font-semibold text-gray-900 truncate">
                      {lesson.title}
                    </h3>
                    <p className="text-gray-500 mt-0.5 sm:mt-1 text-sm sm:text-base">
                      {lesson.cards?.length || 0} {t('lessons.exercises')}
                    </p>
                  </div>

                  {/* Badge */}
                  {!isLocked && isCompleted && (
                    <div className="bg-emerald-500 text-white px-2.5 py-1 sm:px-4 sm:py-2 rounded-full text-xs sm:text-sm font-semibold shrink-0 ml-2">
                      ✓ {totalCards}/{totalCards}
                    </div>
                  )}
                  {!isLocked && !isCompleted && progressCount > 0 && (
                    <div className="bg-amber-500 text-white px-2.5 py-1 sm:px-4 sm:py-2 rounded-full text-xs sm:text-sm font-semibold shrink-0 ml-2">
                      {progressCount}/{totalCards}
                    </div>
                  )}
                  {!isLocked && !isCompleted && progressCount === 0 && (
                    <div className="bg-emerald-500 text-white px-2.5 py-1 sm:px-4 sm:py-2 rounded-full text-xs sm:text-sm font-semibold shrink-0 ml-2">
                      {t('lessons.start')}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default LessonSelect;
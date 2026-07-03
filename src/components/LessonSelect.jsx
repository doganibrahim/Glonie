import { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useLocale } from '../hooks/useLocale';
import { LESSON_COLORS } from '../constants/theme';

const LessonSelect = ({ onLessonSelect }) => {
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
        <div className="max-w-2xl mx-auto px-6 py-6">
          <h1 className="text-3xl font-bold text-gray-900">{t('lessons.title')}</h1>
          <p className="text-gray-500 mt-2 text-lg">{t('lessons.subtitle')}</p>
        </div>
      </div>

      {/* Lessons */}
      <div className="max-w-2xl mx-auto px-6 py-8">
        <div className="space-y-4">
          {lessons.map((lesson, index) => {
            const isActive = index === 0;
            const isLocked = index > 0;
            const color = LESSON_COLORS[index % LESSON_COLORS.length];

            return (
              <div
                key={lesson.id}
                className={`
                  rounded-2xl border p-6 transition-all duration-200
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
                    w-14 h-14 rounded-full flex items-center justify-center text-white font-bold text-lg mr-5 shrink-0
                    ${isLocked ? 'bg-gray-300' : color.circle}
                  `}>
                    {isLocked ? (
                      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                      </svg>
                    ) : (
                      <span>{lesson.order_index}</span>
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-xl font-semibold text-gray-900">
                      {lesson.title}
                    </h3>
                    <p className="text-gray-500 mt-1">
                      {lesson.cards?.length || 0} {t('lessons.exercises')}
                    </p>
                  </div>

                  {/* Badge */}
                  {isActive && (
                    <div className="bg-emerald-500 text-white px-4 py-2 rounded-full text-sm font-semibold shrink-0">
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
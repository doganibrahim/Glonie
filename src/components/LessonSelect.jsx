import { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useLocale } from '../hooks/useLocale';
import { LESSON_STATES } from '../constants/theme';

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
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading lessons...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Clean Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-2xl mx-auto px-6 py-4">
          <h1 className="text-2xl font-semibold text-gray-900">{t('lessons.title')}</h1>
          <p className="text-gray-600 mt-1">{t('lessons.subtitle')}</p>
        </div>
      </div>

      {/* Lesson Path */}
      <div className="max-w-lg mx-auto px-6 py-8">
        <div className="space-y-6">
          {lessons.map((lesson, index) => {
            const isActive = index === 0;
            const isLocked = index > 0;
            
            return (
              <div key={lesson.id} className="relative">
                {/* Connecting line */}
                {index < lessons.length - 1 && (
                  <div className="absolute left-6 top-12 w-0.5 h-6 bg-gray-200"></div>
                )}
                
                <div 
                  className={`flex items-center p-4 rounded-lg border transition-all duration-200 ${
                    isActive 
                      ? 'bg-green-50 border-green-200 cursor-pointer hover:bg-green-100' 
                      : isLocked
                        ? 'bg-gray-50 border-gray-200 cursor-not-allowed'
                        : 'bg-white border-gray-200 cursor-pointer hover:bg-gray-50'
                  }`}
                  onClick={() => !isLocked && onLessonSelect(lesson.id)}
                >
                  {/* Lesson Icon */}
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-semibold mr-4 ${
                    isActive 
                      ? 'bg-green-500' 
                      : isLocked 
                        ? 'bg-gray-300'
                        : 'bg-gray-400'
                  }`}>
                    {isLocked ? (
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                      </svg>
                    ) : (
                      <span>{lesson.order_index}</span>
                    )}
                  </div>
                  
                  {/* Lesson Content */}
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">{lesson.title}</h3>
                    <p className="text-sm text-gray-600 mt-1">
                      {lesson.cards?.length || 0} {t('lessons.exercises')}
                    </p>
                  </div>

                  {/* Status */}
                  {isActive && (
                    <div className="bg-green-500 text-white px-3 py-1 rounded-full text-xs font-medium">
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
import { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useLocale } from '../hooks/useLocale';
import LearningCard from './LearningCard';

const LessonLearning = ({ lessonId, onBackToLessons }) => {
  const [lesson, setLesson] = useState(null);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lessonComplete, setLessonComplete] = useState(false);
  const { t } = useLocale();

  useEffect(() => {
    const fetchLesson = async () => {
      try {
        setLoading(true);
        const data = await api.getLesson(lessonId);
        setLesson(data);

        // Restore progress from localStorage
        const saved = localStorage.getItem(`lesson_progress_${lessonId}`);
        if (saved !== null) {
          const savedIndex = Number(saved);
          if (savedIndex >= 0 && savedIndex < data.cards.length) {
            setCurrentCardIndex(savedIndex);
          }
        }
      } catch (err) {
        setError('Failed to load lesson');
        console.error('Error fetching lesson:', err);
      } finally {
        setLoading(false);
      }
    };

    if (lessonId) {
      fetchLesson();
    }
  }, [lessonId]);

  const handleNext = () => {
    if (currentCardIndex < lesson.cards.length - 1) {
      const nextIndex = currentCardIndex + 1;
      setCurrentCardIndex(nextIndex);
      localStorage.setItem(`lesson_progress_${lessonId}`, String(nextIndex));
    } else {
      // Lesson complete — save total length to mark full completion
      localStorage.setItem(`lesson_progress_${lessonId}`, String(lesson.cards.length));
      setLessonComplete(true);
    }
  };

  const handlePrevious = () => {
    if (currentCardIndex > 0) {
      setCurrentCardIndex(currentCardIndex - 1);
    }
  };

  const handleRestart = () => {
    setCurrentCardIndex(0);
    setLessonComplete(false);
    localStorage.setItem(`lesson_progress_${lessonId}`, '0');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading lesson...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={onBackToLessons}
            className="bg-gray-900 text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors"
          >
            Back to Lessons
          </button>
        </div>
      </div>
    );
  }

  if (lessonComplete) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center border border-gray-200">
          <div className="text-4xl mb-4">🎉</div>
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">
            {t('completion.title')}
          </h2>
          <h3 className="text-lg text-gray-600 mb-4">
            {lesson.title}
          </h3>
          <p className="text-gray-600 mb-6">
            {t('completion.message', { count: lesson.cards.length })}
          </p>
          
          <div className="space-y-3">
            <button
              onClick={handleRestart}
              className="w-full bg-green-500 text-white py-3 rounded-lg font-medium hover:bg-green-600 transition-colors"
            >
              {t('completion.practiceAgain')}
            </button>
            
            <button
              onClick={onBackToLessons}
              className="w-full bg-gray-100 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-200 transition-colors"
            >
              {t('completion.chooseAnother')}
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!lesson || !lesson.cards || lesson.cards.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center max-w-md mx-auto">
          <p className="text-gray-600 mb-4">No exercises found in this lesson.</p>
          <button
            onClick={onBackToLessons}
            className="bg-gray-900 text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors"
          >
            {t('learning.backToLessons')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Clean Header */}
      <div className="absolute top-4 left-4 right-4 z-10">
        <div className="flex items-center justify-between">
          <button
            onClick={onBackToLessons}
            className="bg-white text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors border border-gray-200 font-medium flex items-center"
          >
            <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            {t('learning.back')}
          </button>
          
          <div className="bg-white px-4 py-2 rounded-lg border border-gray-200">
            <div className="text-center">
              <h2 className="font-semibold text-gray-900">{lesson.title}</h2>
              <p className="text-xs text-gray-600">Lesson {lesson.order_index}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Learning Card */}
      <LearningCard
        card={lesson.cards[currentCardIndex]}
        onNext={handleNext}
        onPrevious={handlePrevious}
        currentIndex={currentCardIndex}
        totalCards={lesson.cards.length}
      />
    </div>
  );
};

export default LessonLearning;
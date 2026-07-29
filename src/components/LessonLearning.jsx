import { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { api } from '../services/api';
import { useLocale } from '../hooks/useLocale';
import LearningCard from './LearningCard';
import { useUser } from '../contexts/UserContext';
import { getSessionId } from '../utils/session';

const LessonLearning = ({ lessonId, customLesson, onBackToLessons }) => {
  const [lesson, setLesson] = useState(null);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lessonComplete, setLessonComplete] = useState(false);
  const [score, setScore] = useState({ correct: 0, incorrect: 0, answered: {} });
  const [xpEarned, setXpEarned] = useState(0);
  const { t } = useLocale();
  const { addXP, recordMistake, recordSuccess } = useUser();

  useEffect(() => {
    if (customLesson) {
      setLesson(customLesson);
      setLoading(false);
      return;
    }

    const fetchLesson = async () => {
      try {
        setLoading(true);
        const data = await api.getAdaptiveLesson(lessonId, getSessionId());
        setLesson(data);

        // Restore progress from localStorage
        const saved = localStorage.getItem(`lesson_progress_${lessonId}`);
        if (saved !== null) {
          const savedIndex = Number(saved);
          if (savedIndex >= 0 && savedIndex < data.cards.length) {
            setCurrentCardIndex(savedIndex);
          }
        }

        // Restore score from localStorage
        const savedScore = localStorage.getItem(`lesson_score_${lessonId}`);
        if (savedScore) {
          try {
            setScore(JSON.parse(savedScore));
          } catch (_) {
            // ignore corrupted data
          }
        }
      } catch (err) {
        setError('Failed to load lesson');
        console.error('Error fetching lesson:', err);
      } finally {
        setLoading(false);
      }
    };

    if (lessonId && !customLesson) {
      fetchLesson();
    }
  }, [lessonId, customLesson]);

  const handleScoreUpdate = (cardId, isCorrect) => {
    // Prevent double-counting the same card
    if (score.answered[cardId] !== undefined) return;

    // Side effects OUTSIDE of setState updater to avoid setState-during-render
    if (isCorrect) recordSuccess(cardId);
    else recordMistake(cardId);

    // Send to backend SM-2
    api.submitAnswer(cardId, isCorrect, getSessionId()).catch(console.error);

    setScore((prev) => {
      if (prev.answered[cardId] !== undefined) return prev;
      const updated = {
        correct: prev.correct + (isCorrect ? 1 : 0),
        incorrect: prev.incorrect + (isCorrect ? 0 : 1),
        answered: { ...prev.answered, [cardId]: isCorrect },
      };
      if (!customLesson) {
        localStorage.setItem(`lesson_score_${lessonId}`, JSON.stringify(updated));
      }
      return updated;
    });
  };

  const handleNext = () => {
    if (currentCardIndex < lesson.cards.length - 1) {
      const nextIndex = currentCardIndex + 1;
      setCurrentCardIndex(nextIndex);
      if (!customLesson) localStorage.setItem(`lesson_progress_${lessonId}`, String(nextIndex));
    } else {
      if (!customLesson) {
        // Lesson complete — save total length to mark full completion
        localStorage.setItem(`lesson_progress_${lessonId}`, String(lesson.cards.length));
        // Mark lesson as done to unlock the next lesson
        localStorage.setItem(`lesson_done_${lessonId}`, 'true');
      }
      
      // Calculate and award XP (10 base + 5 per correct)
      // Custom lessons (weak review) give flat 5 XP per correct, 0 base
      const baseXP = customLesson ? 0 : 10;
      const gained = baseXP + (score.correct * 5);
      
      setXpEarned(gained);
      addXP(gained);
      
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
    setXpEarned(0);
    setScore({ correct: 0, incorrect: 0, answered: {} });
    if (!customLesson) {
      localStorage.setItem(`lesson_progress_${lessonId}`, '0');
      localStorage.removeItem(`lesson_score_${lessonId}`);
    }
  };

  // Fire confetti when lesson is completed
  useEffect(() => {
    if (!lessonComplete) return;

    const duration = 350;
    const end = Date.now() + duration;

    const frame = () => {
      confetti({
        particleCount: 3,
        angle: 60,
        spread: 55,
        origin: { x: 0, y: 0.6 },
        colors: ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6'],
      });
      confetti({
        particleCount: 3,
        angle: 120,
        spread: 55,
        origin: { x: 1, y: 0.6 },
        colors: ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6'],
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    };

    frame();
  }, [lessonComplete]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
        {/* Header skeleton */}
        <div className="absolute top-0 left-0 right-0 p-4">
          <div className="max-w-lg mx-auto flex items-center justify-between gap-2">
            <div className="h-10 w-24 bg-slate-200 dark:bg-slate-800 rounded-lg animate-pulse"></div>
            <div className="bg-white dark:bg-slate-800 px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700">
              <div className="h-4 w-32 bg-slate-200 dark:bg-slate-700 rounded animate-pulse mx-auto"></div>
              <div className="h-2 w-20 bg-slate-200 dark:bg-slate-700 rounded animate-pulse mx-auto mt-2"></div>
            </div>
          </div>
        </div>

        {/* Card skeleton */}
        <div className="flex items-center justify-center min-h-screen px-4">
          <div className="max-w-lg w-full bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 sm:p-8">
            {/* Image placeholder */}
            <div className="w-full h-48 sm:h-56 bg-slate-100 dark:bg-slate-900/50 rounded-xl animate-pulse mb-6"></div>
            {/* Text lines */}
            <div className="space-y-4">
              <div className="h-6 bg-slate-100 dark:bg-slate-900/50 rounded-lg w-3/4 animate-pulse"></div>
              <div className="h-5 bg-slate-100 dark:bg-slate-900/50 rounded-lg w-1/2 animate-pulse"></div>
            </div>
            {/* Button placeholder */}
            <div className="mt-8 flex justify-between items-center">
              <div className="h-4 w-16 bg-slate-100 dark:bg-slate-900/50 rounded animate-pulse"></div>
              <div className="h-10 w-24 bg-slate-100 dark:bg-slate-900/50 rounded-lg animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <p className="text-rose-600 dark:text-rose-400 mb-4">{error}</p>
          <button
            onClick={onBackToLessons}
            className="bg-slate-900 dark:bg-slate-700 text-white px-4 py-2 rounded-lg hover:bg-slate-800 dark:hover:bg-slate-600 transition-colors"
          >
            Back to Lessons
          </button>
        </div>
      </div>
    );
  }

  if (lessonComplete) {
    const totalAnswered = score.correct + score.incorrect;
    const pct = totalAnswered > 0 ? Math.round((score.correct / totalAnswered) * 100) : 0;
    const ringColor = pct >= 80 ? '#10b981' : pct >= 50 ? '#f59e0b' : '#ef4444'; // emerald, amber, rose
    const perfKey = pct >= 80 ? 'completion.excellent' : pct >= 50 ? 'completion.good' : 'completion.keepPracticing';
    const circumference = 2 * Math.PI * 15.9;

    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center px-4 py-6 sm:p-6 font-sans">
        <div className="max-w-md w-full bg-white dark:bg-slate-800 rounded-2xl shadow-sm p-6 sm:p-8 text-center border border-slate-200 dark:border-slate-700">
          <div className="text-4xl sm:text-5xl mb-4">🎉</div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-2">
            {t('completion.title')}
          </h2>
          <h3 className="text-base sm:text-lg text-slate-600 dark:text-slate-400 mb-6 font-medium">
            {lesson.title}
          </h3>

          {/* Score ring + breakdown */}
          {totalAnswered > 0 && (
            <div className="mb-6 flex flex-col items-center gap-4">
              {/* SVG ring gauge */}
              <div className="relative w-32 h-32">
                <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                  <circle
                    cx="18" cy="18" r="15.9"
                    fill="none" stroke="currentColor" className="text-slate-100 dark:text-slate-700/50" strokeWidth="2.5"
                  />
                  <circle
                    cx="18" cy="18" r="15.9"
                    fill="none"
                    stroke={ringColor}
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeDasharray={`${(pct / 100) * circumference} ${circumference}`}
                    style={{ transition: 'stroke-dasharray 1s ease-out' }}
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-3xl font-bold text-slate-900 dark:text-slate-100">{pct}%</span>
                </div>
              </div>

              {/* Correct / incorrect breakdown */}
              <div className="flex gap-6 text-sm font-bold tracking-wide">
                <span className="text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 px-3 py-1 rounded-lg">✓ {score.correct} doğru</span>
                <span className="text-rose-500 dark:text-rose-400 bg-rose-50 dark:bg-rose-900/20 px-3 py-1 rounded-lg">✗ {score.incorrect} yanlış</span>
              </div>

              {/* Performance message */}
              <p className="text-sm text-slate-600 dark:text-slate-400 font-medium mt-1">{t(perfKey)}</p>

              {/* Gamification XP gained */}
              <div className="mt-2 bg-amber-100 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-400 px-5 py-2 rounded-xl font-bold animate-bounce shadow-sm">
                +{xpEarned} XP ⚡
              </div>
            </div>
          )}

          <div className="space-y-3 mt-8">
            <button
              onClick={handleRestart}
              className="w-full bg-emerald-500 hover:bg-emerald-600 text-white py-3 rounded-xl font-bold tracking-wide transition-colors text-sm sm:text-base shadow-sm"
            >
              {t('completion.practiceAgain')}
            </button>

            <button
              onClick={onBackToLessons}
              className="w-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 py-3 rounded-xl font-bold tracking-wide transition-colors text-sm sm:text-base"
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
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center p-4">
        <div className="text-center max-w-md mx-auto">
          <p className="text-slate-600 dark:text-slate-400 mb-4">No exercises found in this lesson.</p>
          <button
            onClick={onBackToLessons}
            className="bg-slate-900 dark:bg-slate-700 text-white px-4 py-2 rounded-lg hover:bg-slate-800 transition-colors"
          >
            {t('learning.backToLessons')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative bg-slate-50 dark:bg-slate-900 min-h-screen">
      {/* Clean Header - Constrained to max-w-lg to align perfectly with the card */}
      <div className="absolute top-0 left-0 right-0 z-10 p-4">
        <div className="max-w-lg mx-auto flex items-center justify-between gap-2">
          <button
            onClick={onBackToLessons}
            className="bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-3 py-2 sm:px-4 sm:py-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 transition-all border border-slate-200 dark:border-slate-700 shadow-sm font-semibold flex items-center text-sm sm:text-base shrink-0"
          >
            <svg className="w-5 h-5 mr-1 sm:mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span className="hidden sm:inline">{t('learning.back')}</span>
            <span className="sm:hidden">Geri</span>
          </button>
          
          <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-md px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm min-w-0">
            <div className="text-center">
              <h2 className="font-bold text-slate-900 dark:text-slate-100 text-sm sm:text-base truncate">{lesson.title}</h2>
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider mt-0.5">Ders {lesson.order_index}</p>
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
        onScoreUpdate={handleScoreUpdate}
      />
    </div>
  );
};

export default LessonLearning;
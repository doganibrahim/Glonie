import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { api } from '../services/api';
import { useLocale } from '../hooks/useLocale';
import { useUser } from '../contexts/UserContext';
import ThemeToggle from './ThemeToggle';

const UNIT_METADATA = [
  { title: "Ünite 1: Temel Aile", desc: "Aileni tanıtmayı ve saymayı öğren" },
  { title: "Ünite 2: Zaman Kavramları", desc: "Aylar, haftalar ve günler" },
  { title: "Ünite 3: İsimler ve Sahiplik", desc: "Kimin neye sahip olduğunu ifade et" },
  { title: "Ünite 4: İleri Seviye", desc: "Daha karmaşık yapılar" }
];

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.15 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } }
};

const LessonSelect = ({ onLessonSelect, onOpenWordBank, onOpenDashboard, onOpenStories }) => {
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { t } = useLocale();
  const { userData } = useUser();

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
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <p className="text-red-600 font-medium">{error}</p>
      </div>
    );
  }

  // Dynamic grouping logic based on "Exercises" keyword to form units
  const units = [];
  let currentUnitLessons = [];
  let currentUnitIndex = 0;

  lessons.forEach((lesson) => {
    currentUnitLessons.push(lesson);
    // When a lesson represents the end of a chapter (Exercises), we seal the unit
    if (lesson.title.toLowerCase().includes("exercises")) {
      units.push({
        metadata: UNIT_METADATA[currentUnitIndex] || { title: `Ünite ${currentUnitIndex + 1}`, desc: "Yeni konular" },
        lessons: currentUnitLessons
      });
      currentUnitLessons = [];
      currentUnitIndex++;
    }
  });

  // If there are leftover lessons that didn't end with an "Exercises" lesson
  if (currentUnitLessons.length > 0) {
    units.push({
      metadata: UNIT_METADATA[currentUnitIndex] || { title: `Ünite ${currentUnitIndex + 1}`, desc: "Yeni konular" },
      lessons: currentUnitLessons
    });
  }

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-900 text-slate-900 dark:text-slate-100 pb-20 font-sans">
      
      {/* Top Bar */}
      <div className="sticky top-0 z-30 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-3xl mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex gap-5">
            <motion.div whileHover={{ scale: 1.05 }} className="flex items-center gap-2 font-semibold text-orange-600 dark:text-orange-400 cursor-default">
              <span className="text-xl">🔥</span> 
              <span>{userData.streak}</span>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }} className="flex items-center gap-2 font-semibold text-blue-600 dark:text-blue-400 cursor-default">
              <span className="text-xl">⚡</span> 
              <span>{userData.xp}</span>
            </motion.div>
          </div>
          
          <div className="flex items-center gap-3">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={onOpenWordBank}
              className="p-2 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              title={t('wordBank.title')}
            >
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z" />
              </svg>
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onOpenDashboard}
              className="w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 flex items-center justify-center font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
              title="Profil"
            >
              👤
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onOpenStories}
              className="w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 flex items-center justify-center font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
              title="Hikayelerim"
            >
              📚
            </motion.button>
            <ThemeToggle />
          </div>
        </div>
      </div>

      {/* Header Area */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="max-w-3xl mx-auto px-4 pt-10 pb-4"
      >
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          {t('lessons.title')}
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">
          {t('lessons.subtitle')}
        </p>
      </motion.div>

      {/* Units & Lessons Journey */}
      <div className="max-w-3xl mx-auto px-4 py-4">
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="space-y-8"
        >
          {units.map((unit, unitIndex) => {
            // Check if unit is locked (if its first lesson is locked)
            const firstLesson = unit.lessons[0];
            const isUnitLocked = firstLesson && firstLesson.order_index > 1 && localStorage.getItem(`lesson_done_${lessons[firstLesson.order_index - 2]?.id}`) !== 'true';

            return (
              <motion.div key={unitIndex} variants={itemVariants} className="w-full">
                {/* Unit Card */}
                <div className={`rounded-3xl overflow-hidden border shadow-sm transition-all duration-300 ${isUnitLocked ? 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800/50 opacity-75' : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700'}`}>
                  
                  {/* Unit Header */}
                  <div className={`p-6 sm:p-8 ${isUnitLocked ? 'bg-slate-100/50 dark:bg-slate-900/50' : 'bg-blue-50/50 dark:bg-blue-900/10'} border-b border-slate-200 dark:border-slate-700/50`}>
                    <div className="flex items-center justify-between">
                      <div>
                        <h2 className={`text-2xl sm:text-3xl font-extrabold ${isUnitLocked ? 'text-slate-500 dark:text-slate-400' : 'text-slate-900 dark:text-white'} tracking-tight`}>
                          {unit.metadata.title}
                        </h2>
                        <p className={`mt-1.5 text-base sm:text-lg ${isUnitLocked ? 'text-slate-400 dark:text-slate-500' : 'text-slate-600 dark:text-slate-300'}`}>
                          {unit.metadata.desc}
                        </p>
                      </div>
                      {isUnitLocked && (
                        <div className="hidden sm:flex items-center justify-center w-12 h-12 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-400">
                          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Lessons List inside Unit Card */}
                  <div className="divide-y divide-slate-100 dark:divide-slate-700/50">
                    {unit.lessons.map((lesson) => {
                      const isLocked = lesson.order_index > 1 && localStorage.getItem(`lesson_done_${lessons[lesson.order_index - 2]?.id}`) !== 'true';
                      const totalCards = lesson.cards?.length || 0;
                      const savedProgress = localStorage.getItem(`lesson_progress_${lesson.id}`);
                      const progressCount = savedProgress !== null ? Math.min(Number(savedProgress), totalCards) : 0;
                      const isCompleted = progressCount >= totalCards && totalCards > 0;

                      return (
                        <div 
                          key={lesson.id} 
                          onClick={() => !isLocked && onLessonSelect(lesson.id)}
                          className={`
                            p-4 sm:p-5 flex items-center transition-colors
                            ${isLocked ? 'cursor-not-allowed' : 'cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700/30'}
                          `}
                        >
                          {/* Progress Circle / Status Icon */}
                          <div className="relative flex-shrink-0 mr-4 sm:mr-5">
                            {isLocked ? (
                              <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 flex items-center justify-center">
                                <span className="text-slate-400 font-bold">{lesson.order_index}</span>
                              </div>
                            ) : isCompleted ? (
                              <div className="w-12 h-12 rounded-full bg-green-500 text-white flex items-center justify-center shadow-sm">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                </svg>
                              </div>
                            ) : (
                              <div className="w-12 h-12 rounded-full border-2 border-blue-500 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
                                {lesson.order_index}
                                {/* Partial progress ring could go here */}
                              </div>
                            )}
                          </div>

                          {/* Lesson Info */}
                          <div className="flex-1 min-w-0">
                            <h3 className={`text-lg font-bold truncate ${isLocked ? 'text-slate-400 dark:text-slate-500' : 'text-slate-800 dark:text-slate-100'}`}>
                              {lesson.title}
                            </h3>
                            <div className="flex items-center gap-2 mt-0.5">
                              {isLocked ? (
                                <span className="text-sm text-slate-400">Kilitli</span>
                              ) : isCompleted ? (
                                <span className="text-sm font-medium text-green-600 dark:text-green-400">Tamamlandı</span>
                              ) : (
                                <span className="text-sm font-medium text-blue-600 dark:text-blue-400">{progressCount} / {totalCards} adım</span>
                              )}
                            </div>
                          </div>

                          {/* Arrow */}
                          {!isLocked && (
                            <div className="flex-shrink-0 ml-4 text-slate-300 dark:text-slate-600">
                              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                              </svg>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </div>
  );
};

export default LessonSelect;
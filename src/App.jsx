import { useState } from 'react';
import LessonSelect from './components/LessonSelect';
import LessonLearning from './components/LessonLearning';
import WordBank from './components/WordBank';
import Dashboard from './components/Dashboard';

function App() {
  const [currentView, setCurrentView] = useState('lessons');
  const [selectedLessonId, setSelectedLessonId] = useState(null);
  const [dynamicLessonData, setDynamicLessonData] = useState(null);

  const handleLessonSelect = (lessonId) => {
    setSelectedLessonId(lessonId);
    setDynamicLessonData(null);
    setCurrentView('learning');
  };

  const handleStartDynamicLesson = (lessonData) => {
    setDynamicLessonData(lessonData);
    setSelectedLessonId('dynamic');
    setCurrentView('learning');
  };

  const handleBackToLessons = () => {
    setCurrentView('lessons');
    setSelectedLessonId(null);
    setDynamicLessonData(null);
  };

  const handleOpenWordBank = () => {
    setCurrentView('wordbank');
  };

  const handleOpenDashboard = () => {
    setCurrentView('dashboard');
  };

  return (
    <div className="min-h-screen w-full">
      {currentView === 'lessons' && (
        <LessonSelect 
          onLessonSelect={handleLessonSelect} 
          onOpenWordBank={handleOpenWordBank} 
          onOpenDashboard={handleOpenDashboard}
        />
      )}
      {currentView === 'learning' && (
        <LessonLearning 
          lessonId={selectedLessonId} 
          customLesson={dynamicLessonData}
          onBackToLessons={handleBackToLessons} 
        />
      )}
      {currentView === 'wordbank' && (
        <WordBank 
          onBack={handleBackToLessons} 
          onStartDynamicLesson={handleStartDynamicLesson}
        />
      )}
      {currentView === 'dashboard' && (
        <Dashboard onBack={handleBackToLessons} />
      )}
    </div>
  );
}

export default App;

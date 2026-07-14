import { useState } from 'react';
import LessonSelect from './components/LessonSelect';
import LessonLearning from './components/LessonLearning';
import WordBank from './components/WordBank';

function App() {
  const [currentView, setCurrentView] = useState('lessons');
  const [selectedLessonId, setSelectedLessonId] = useState(null);

  const handleLessonSelect = (lessonId) => {
    setSelectedLessonId(lessonId);
    setCurrentView('learning');
  };

  const handleBackToLessons = () => {
    setCurrentView('lessons');
    setSelectedLessonId(null);
  };

  const handleOpenWordBank = () => {
    setCurrentView('wordbank');
  };

  return (
    <div className="min-h-screen w-full">
      {currentView === 'lessons' && (
        <LessonSelect onLessonSelect={handleLessonSelect} onOpenWordBank={handleOpenWordBank} />
      )}
      {currentView === 'learning' && (
        <LessonLearning 
          lessonId={selectedLessonId} 
          onBackToLessons={handleBackToLessons} 
        />
      )}
      {currentView === 'wordbank' && (
        <WordBank onBack={handleBackToLessons} />
      )}
    </div>
  );
}

export default App;

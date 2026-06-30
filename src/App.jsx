import { useState } from 'react';
import LessonSelect from './components/LessonSelect';
import LessonLearning from './components/LessonLearning';

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

  return (
    <div className="min-h-screen w-full">
      {currentView === 'lessons' ? (
        <LessonSelect onLessonSelect={handleLessonSelect} />
      ) : (
        <LessonLearning 
          lessonId={selectedLessonId} 
          onBackToLessons={handleBackToLessons} 
        />
      )}
    </div>
  );
}

export default App;

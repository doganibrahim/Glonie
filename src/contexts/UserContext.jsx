import { createContext, useContext, useState, useEffect } from 'react';

const UserContext = createContext(null);

const STORAGE_KEY = 'glonie_user_data';

const defaultUserData = {
  xp: 0,
  streak: 0,
  lastActivityDate: null,
  activityLog: {}, // { '2023-10-27': 150, ... }
  badges: [],
  weakWords: {}, // { cardId: errorCount }
};

const getTodayString = () => {
  const d = new Date();
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().split('T')[0]; // YYYY-MM-DD in local time
};

export const UserProvider = ({ children }) => {
  const [userData, setUserData] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return { ...defaultUserData, ...parsed };
      } catch (e) {
        console.error('Error parsing user data', e);
      }
    }
    return defaultUserData;
  });

  // Calculate streak on load
  useEffect(() => {
    const today = getTodayString();
    setUserData((prev) => {
      const { lastActivityDate, streak } = prev;
      
      if (!lastActivityDate) return prev;
      if (lastActivityDate === today) return prev;

      // Check if yesterday was active
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      yesterday.setMinutes(yesterday.getMinutes() - yesterday.getTimezoneOffset());
      const yesterdayStr = yesterday.toISOString().split('T')[0];

      if (lastActivityDate === yesterdayStr) {
        // Streak is maintained, will be incremented when they actually do activity today
        return prev;
      } else {
        // Streak broken
        return { ...prev, streak: 0 };
      }
    });
  }, []);

  // Save to localStorage whenever userData changes
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(userData));
  }, [userData]);

  const addXP = (amount) => {
    if (amount <= 0) return;
    const today = getTodayString();

    setUserData((prev) => {
      let newStreak = prev.streak;
      let newBadges = [...prev.badges];
      
      // Update streak
      if (prev.lastActivityDate !== today) {
        newStreak += 1;
        // Check for streak badges
        if (newStreak === 3 && !newBadges.includes('streak_3')) newBadges.push('streak_3');
        if (newStreak === 7 && !newBadges.includes('streak_7')) newBadges.push('streak_7');
        if (newStreak === 30 && !newBadges.includes('streak_30')) newBadges.push('streak_30');
      }

      // First lesson badge
      if (prev.xp === 0 && !newBadges.includes('first_lesson')) {
        newBadges.push('first_lesson');
      }

      const todayXP = (prev.activityLog[today] || 0) + amount;

      return {
        ...prev,
        xp: prev.xp + amount,
        streak: newStreak,
        lastActivityDate: today,
        activityLog: {
          ...prev.activityLog,
          [today]: todayXP,
        },
        badges: newBadges,
      };
    });
  };

  const getBadges = () => {
    // Return full badge metadata based on unlocked IDs
    const badgeMap = {
      'first_lesson': { id: 'first_lesson', icon: '🌟', title: 'İlk Adım', desc: 'İlk dersini tamamladın.' },
      'streak_3': { id: 'streak_3', icon: '🔥', title: '3 Günlük Seri', desc: '3 gün üst üste çalıştın.' },
      'streak_7': { id: 'streak_7', icon: '⚡', title: '7 Günlük Seri', desc: 'Bir hafta boyunca her gün çalıştın.' },
      'streak_30': { id: 'streak_30', icon: '🏆', title: 'Aylık Efsane', desc: '30 gün hiç aksatmadan çalıştın.' },
    };
    
    return userData.badges.map(id => badgeMap[id]).filter(Boolean);
  };

  const recordMistake = (cardId) => {
    setUserData((prev) => {
      const currentMistakes = prev.weakWords?.[cardId] || 0;
      return {
        ...prev,
        weakWords: {
          ...(prev.weakWords || {}),
          [cardId]: currentMistakes + 1
        }
      };
    });
  };

  const recordSuccess = (cardId) => {
    setUserData((prev) => {
      if (!prev.weakWords?.[cardId]) return prev;
      
      const currentMistakes = prev.weakWords[cardId];
      const nextMistakes = Math.max(0, currentMistakes - 1);
      
      const newWeakWords = { ...prev.weakWords };
      if (nextMistakes === 0) {
        delete newWeakWords[cardId];
      } else {
        newWeakWords[cardId] = nextMistakes;
      }

      return {
        ...prev,
        weakWords: newWeakWords
      };
    });
  };

  return (
    <UserContext.Provider value={{ userData, addXP, getBadges, recordMistake, recordSuccess }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);

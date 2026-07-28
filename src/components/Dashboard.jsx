import { useUser } from '../contexts/UserContext';
import { useLocale } from '../hooks/useLocale';

// Helper to generate last 90 days array for heatmap
const generateHeatmapDays = () => {
  const days = [];
  const today = new Date();
  today.setMinutes(today.getMinutes() - today.getTimezoneOffset());
  
  // Go back 89 days (90 days total including today)
  for (let i = 89; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    days.push(d.toISOString().split('T')[0]);
  }
  return days;
};

const Dashboard = ({ onBack }) => {
  const { userData, getBadges } = useUser();
  const { t } = useLocale();
  const badges = getBadges();
  const heatmapDays = generateHeatmapDays();

  // Color intensity for heatmap based on XP
  const getHeatmapColor = (xp) => {
    if (!xp) return 'bg-slate-100 dark:bg-slate-700';
    if (xp < 50) return 'bg-emerald-200 dark:bg-emerald-900/40';
    if (xp < 100) return 'bg-emerald-300 dark:bg-emerald-700/60';
    if (xp < 200) return 'bg-emerald-500 dark:bg-emerald-500';
    return 'bg-emerald-700 dark:bg-emerald-400';
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 pb-10 transition-colors">
      {/* Header */}
      <div className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
        <div className="max-w-2xl mx-auto px-4 py-4 sm:px-6 sm:py-6">
          <div className="flex items-center mb-4">
            <button
              onClick={onBack}
              className="text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white flex items-center font-medium transition-colors"
            >
              <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              {t('learning.back')}
            </button>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-slate-100">Profilin</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1 font-medium">İlerlemeni ve başarılarını takip et.</p>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 sm:px-6 pt-6">
        
        {/* Stats Row */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-5 flex flex-col items-center justify-center text-center shadow-sm">
            <span className="text-3xl mb-2">🔥</span>
            <span className="text-2xl font-bold text-slate-900 dark:text-slate-100">{userData.streak}</span>
            <span className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Günlük Seri</span>
          </div>
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-5 flex flex-col items-center justify-center text-center shadow-sm">
            <span className="text-3xl mb-2">⚡</span>
            <span className="text-2xl font-bold text-amber-500 dark:text-amber-400">{userData.xp}</span>
            <span className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Toplam XP</span>
          </div>
        </div>

        {/* Heatmap */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-5 mb-8 shadow-sm">
          <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-4">Aktivite Haritası</h3>
          <div className="flex flex-wrap gap-1">
            {heatmapDays.map((dayStr) => {
              const xp = userData.activityLog[dayStr] || 0;
              return (
                <div 
                  key={dayStr}
                  title={`${dayStr}: ${xp} XP`}
                  className={`w-3.5 h-3.5 rounded-sm ${getHeatmapColor(xp)} hover:ring-2 hover:ring-slate-300 dark:hover:ring-slate-500 transition-all cursor-help`}
                />
              );
            })}
          </div>
          <div className="flex justify-end items-center gap-2 mt-4 text-xs font-medium text-slate-500 dark:text-slate-400">
            <span>Az</span>
            <div className="flex gap-1">
              <div className="w-3.5 h-3.5 rounded-sm bg-slate-100 dark:bg-slate-700"></div>
              <div className="w-3.5 h-3.5 rounded-sm bg-emerald-200 dark:bg-emerald-900/40"></div>
              <div className="w-3.5 h-3.5 rounded-sm bg-emerald-500 dark:bg-emerald-500"></div>
              <div className="w-3.5 h-3.5 rounded-sm bg-emerald-700 dark:bg-emerald-400"></div>
            </div>
            <span>Çok</span>
          </div>
        </div>

        {/* Badges */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-5 shadow-sm">
          <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-4">Rozetler ({badges.length})</h3>
          {badges.length === 0 ? (
            <p className="text-slate-500 dark:text-slate-400 text-center py-6 font-medium">Henüz bir rozet kazanmadın. Derslere devam et!</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {badges.map((badge) => (
                <div key={badge.id} className="flex items-center gap-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl p-3 border border-slate-100 dark:border-slate-800">
                  <div className="w-12 h-12 rounded-full bg-white dark:bg-slate-800 flex items-center justify-center text-2xl shadow-sm border border-slate-200 dark:border-slate-700 shrink-0">
                    {badge.icon}
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-slate-100 text-sm">{badge.title}</h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-medium">{badge.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default Dashboard;

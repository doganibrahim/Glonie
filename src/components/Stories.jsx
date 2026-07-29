import { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { api } from '../services/api';
import { getSessionId } from '../utils/session';

const Stories = ({ onBack }) => {
  const [stories, setStories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchStories();
  }, []);

  const fetchStories = async () => {
    setIsLoading(true);
    try {
      const data = await api.getStories(getSessionId());
      setStories(data);
    } catch (err) {
      setError('Hikayeler yüklenemedi.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    setError(null);
    try {
      const newStory = await api.generateStory(getSessionId());
      setStories([newStory, ...stories]);
    } catch (err) {
      setError(err.message || 'Hikaye oluşturulamadı.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 font-sans px-4 py-8">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <button
              onClick={onBack}
              className="p-2 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors shadow-sm"
            >
              <svg className="w-6 h-6 text-slate-600 dark:text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Senin Hikayelerin</h1>
          </div>
          <button
            onClick={handleGenerate}
            disabled={isGenerating}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl font-bold transition-colors disabled:opacity-50"
          >
            {isGenerating ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Yazılıyor...
              </>
            ) : (
              <>
                <span>✨</span> Yeni Hikaye
              </>
            )}
          </button>
        </div>

        {error && (
          <div className="bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-400 p-4 rounded-xl mb-6">
            {error}
          </div>
        )}

        {isLoading ? (
          <div className="space-y-4">
            {[1, 2].map(i => (
              <div key={i} className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 h-48 animate-pulse">
                <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/4 mb-4"></div>
                <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-full mb-2"></div>
                <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-full mb-2"></div>
                <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-3/4"></div>
              </div>
            ))}
          </div>
        ) : stories.length === 0 ? (
          <div className="bg-white dark:bg-slate-800 p-12 rounded-2xl border border-slate-200 dark:border-slate-700 text-center shadow-sm">
            <span className="text-6xl mb-4 block">📚</span>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Henüz hikayen yok</h3>
            <p className="text-slate-500 dark:text-slate-400 mb-6 max-w-md mx-auto">Öğrendiğin kelimelerden sana özel İngilizce kısa hikayeler oluşturabilirsin. Hemen bir tane oluştur!</p>
            <button
              onClick={handleGenerate}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl font-bold transition-colors shadow-sm"
            >
              İlk Hikayemi Oluştur
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {stories.map(story => (
              <div key={story.id} className="bg-white dark:bg-slate-800 p-6 sm:p-8 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm transition-all hover:shadow-md">
                <div className="text-sm text-slate-400 dark:text-slate-500 mb-4 font-medium flex items-center gap-2">
                  <span>📅</span> {new Date(story.created_at).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute:'2-digit' })}
                </div>
                <div className="prose dark:prose-invert prose-indigo prose-lg max-w-none text-slate-800 dark:text-slate-200 leading-relaxed">
                  <ReactMarkdown>{story.content}</ReactMarkdown>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Stories;

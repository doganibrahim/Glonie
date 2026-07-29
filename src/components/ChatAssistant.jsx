import { useState, useRef, useEffect } from 'react';
import { api } from '../services/api';

const ChatAssistant = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'assistant', text: 'Merhaba! İngilizce öğreniminle ilgili takıldığın bir şey var mı?' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMessage }]);
    setIsLoading(true);

    try {
      const data = await api.sendChat(userMessage);
      setMessages(prev => [...prev, { role: 'assistant', text: data.response }]);
    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, { role: 'assistant', text: 'Bir hata oluştu. Lütfen tekrar dene.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-6 right-6 w-14 h-14 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full flex items-center justify-center shadow-lg transition-transform hover:scale-110 z-40 ${isOpen ? 'hidden' : 'block'}`}
      >
        <span className="text-2xl">🤖</span>
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 w-80 sm:w-96 h-[500px] bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-2xl flex flex-col z-50 overflow-hidden">
          <div className="bg-indigo-600 p-4 flex justify-between items-center text-white">
            <div className="flex items-center gap-2">
              <span className="text-xl">🤖</span>
              <h3 className="font-bold">Öğretmen</h3>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-white hover:text-indigo-200">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <div className="flex-1 p-4 overflow-y-auto bg-slate-50 dark:bg-slate-900 space-y-4">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] p-3 rounded-2xl text-sm ${msg.role === 'user' ? 'bg-indigo-600 text-white rounded-br-none' : 'bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-600 rounded-bl-none shadow-sm'}`}>
                  {msg.text}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="max-w-[80%] p-3 rounded-2xl bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-bl-none shadow-sm flex gap-1 items-center">
                  <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                  <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{animationDelay: '0.4s'}}></div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <form onSubmit={handleSend} className="p-3 bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Bir soru sor..."
              className="flex-1 bg-slate-100 dark:bg-slate-900 border border-transparent focus:border-indigo-500 focus:bg-white dark:focus:bg-slate-800 rounded-xl px-4 py-2 text-sm text-slate-900 dark:text-white outline-none transition-all"
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl text-sm font-semibold transition-colors disabled:opacity-50"
            >
              Gönder
            </button>
          </form>
        </div>
      )}
    </>
  );
};

export default ChatAssistant;

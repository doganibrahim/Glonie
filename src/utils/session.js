export const getSessionId = () => {
  let sessionId = localStorage.getItem('glonie_session_id');
  if (!sessionId) {
    sessionId = 'session_' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    localStorage.setItem('glonie_session_id', sessionId);
  }
  return sessionId;
};

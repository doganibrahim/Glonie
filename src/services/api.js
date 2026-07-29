const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

export const api = {
  // Get all lessons
  getLessons: async () => {
    const response = await fetch(`${API_BASE_URL}/api/lessons`);
    if (!response.ok) {
      throw new Error('Failed to fetch lessons');
    }
    return response.json();
  },

  // Get specific lesson with cards
  getLesson: async (lessonId) => {
    const response = await fetch(`${API_BASE_URL}/api/lessons/${lessonId}`);
    if (!response.ok) {
      throw new Error('Failed to fetch lesson');
    }
    return response.json();
  },

  // Get adaptive lesson
  getAdaptiveLesson: async (lessonId, sessionId) => {
    const response = await fetch(`${API_BASE_URL}/api/lessons/${lessonId}/adaptive?session_id=${sessionId}`);
    if (!response.ok) {
      throw new Error('Failed to fetch adaptive lesson');
    }
    return response.json();
  },

  // Submit card answer
  submitAnswer: async (cardId, correct, sessionId) => {
    const response = await fetch(`${API_BASE_URL}/api/cards/${cardId}/answer`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ correct, session_id: sessionId }),
    });
    if (!response.ok) {
      throw new Error('Failed to submit answer');
    }
    return response.json();
  },

  // Get intelligent hint
  getHint: async (cardId, attempt) => {
    const response = await fetch(`${API_BASE_URL}/api/cards/${cardId}/hint`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ attempt }),
    });
    if (!response.ok) {
      throw new Error('Failed to get hint');
    }
    return response.json();
  },

  // Send chat message to Socratic RAG Assistant
  sendChat: async (message) => {
    const response = await fetch(`${API_BASE_URL}/api/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ message }),
    });
    if (!response.ok) {
      throw new Error('Failed to send chat message');
    }
    return response.json();
  },

  // Generate new personalized story
  generateStory: async (sessionId) => {
    const response = await fetch(`${API_BASE_URL}/api/stories/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ session_id: sessionId }),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to generate story');
    }
    return response.json();
  },

  // Get user's stories
  getStories: async (sessionId) => {
    const response = await fetch(`${API_BASE_URL}/api/stories?session_id=${sessionId}`);
    if (!response.ok) {
      throw new Error('Failed to fetch stories');
    }
    return response.json();
  }
};
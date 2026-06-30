import { API_BASE_URL } from '../constants/theme';

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
  }
};
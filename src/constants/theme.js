// Card type visual configurations
export const CARD_TYPES = {
  STORY: {
    label: 'story',
    color: 'bg-green-500',
  },
  FILL_BLANK: {
    label: 'fillBlank',
    color: 'bg-blue-500',
  },
  SPEECH: {
    label: 'speech',
    color: 'bg-purple-500',
  },
  DEFAULT: {
    label: 'learning',
    color: 'bg-gray-500',
  },
};

// Lesson states
export const LESSON_STATES = {
  ACTIVE: {
    container: 'bg-green-50 border-green-200 cursor-pointer hover:bg-green-100',
    circle: 'bg-green-500',
  },
  LOCKED: {
    container: 'bg-gray-50 border-gray-200 cursor-not-allowed',
    circle: 'bg-gray-300',
  },
  COMPLETED: {
    container: 'bg-white border-gray-200 cursor-pointer hover:bg-gray-50',
    circle: 'bg-gray-400',
  },
};

// Audio settings
export const AUDIO = {
  volume: 0.8,
  autoPlayDelay: 300, // ms
};

// API
export const API_BASE_URL = 'http://localhost:8000';
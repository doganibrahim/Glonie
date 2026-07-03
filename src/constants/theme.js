// Card type visual configurations
export const CARD_TYPES = {
  STORY: {
    label: 'story',
    color: 'bg-emerald-500',
  },
  FILL_BLANK: {
    label: 'fillBlank',
    color: 'bg-sky-500',
  },
  SPEECH: {
    label: 'speech',
    color: 'bg-violet-500',
  },
  DEFAULT: {
    label: 'learning',
    color: 'bg-gray-500',
  },
};

// Lesson color palette (pastel, cycled per lesson)
export const LESSON_COLORS = [
  { bg: 'bg-emerald-50', border: 'border-emerald-200', circle: 'bg-emerald-500', hover: 'hover:bg-emerald-100' },
  { bg: 'bg-sky-50', border: 'border-sky-200', circle: 'bg-sky-500', hover: 'hover:bg-sky-100' },
  { bg: 'bg-violet-50', border: 'border-violet-200', circle: 'bg-violet-500', hover: 'hover:bg-violet-100' },
  { bg: 'bg-amber-50', border: 'border-amber-200', circle: 'bg-amber-500', hover: 'hover:bg-amber-100' },
];

// Audio settings
export const AUDIO = {
  volume: 0.8,
  autoPlayDelay: 300, // ms
};

// API
export const API_BASE_URL = 'http://localhost:8000';
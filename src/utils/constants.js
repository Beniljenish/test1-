// Application constants

export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  DASHBOARD: '/dashboard',
  TASKS: '/tasks',
  SETTINGS: '/settings'
};

export const STORAGE_KEYS = {
  USER: 'organizo_user',
  TASKS: 'organizo_tasks',
  THEME: 'organizo_theme'
};

export const COLORS = {
  PRIMARY: '#FFD93D',
  SECONDARY: '#f5f5f5',
  ACCENT: '#333',
  SUCCESS: '#059669',
  WARNING: '#f59e0b',
  ERROR: '#dc2626',
  INFO: '#3b82f6'
};

export const TASK_STATUS = {
  PENDING: 'pending',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled'
};

export const CATEGORY_COLORS = [
  '#8B5A3C',
  '#4F46E5',
  '#059669',
  '#DC2626',
  '#7C3AED',
  '#EA580C',
  '#0891B2'
];

export const TIME_FORMATS = {
  SHORT: 'HH:mm',
  LONG: 'HH:mm:ss',
  FULL: 'YYYY-MM-DD HH:mm:ss'
};
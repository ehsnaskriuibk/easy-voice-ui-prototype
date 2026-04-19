export const TEAL = {
  50: '#f0fdfa',
  100: '#ccfbf1',
  200: '#99f6e4',
  300: '#5eead4',
  400: '#2dd4bf',
  500: '#14b8a6',
  600: '#0d9488',
  700: '#0f766e',
  800: '#115e59',
  900: '#134e4a',
};

export const CHART_COLORS = {
  teal: '#14b8a6',
  blue: '#3b82f6',
  green: '#10b981',
  amber: '#f59e0b',
  red: '#ef4444',
  purple: '#8b5cf6',
};

export const STATUS_COLORS = {
  New: { bg: 'bg-blue-100', text: 'text-blue-800', dot: 'bg-blue-500' },
  Done: { bg: 'bg-emerald-100', text: 'text-emerald-800', dot: 'bg-emerald-500' },
  ToDo: { bg: 'bg-amber-100', text: 'text-amber-800', dot: 'bg-amber-500' },
};

export const PIE_COLORS = [CHART_COLORS.blue, CHART_COLORS.green, CHART_COLORS.amber];

export const PAGE_SIZE_OPTIONS = [10, 25, 50];

export const DAYS_OF_WEEK = [
  'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday',
] as const;
export type DayOfWeek = (typeof DAYS_OF_WEEK)[number];

export const INPUT_CLASS =
  'w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition placeholder:text-slate-400';

export const SMALL_INPUT_CLASS =
  'px-3 py-1.5 bg-white border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent';

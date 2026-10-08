export const PRESET_COLORS = [
  { label: 'Azul', value: '#3B82F6', bgClass: 'bg-blue-50', textClass: 'text-blue-700', borderClass: 'border-blue-200' },
  { label: 'Esmeralda', value: '#10B981', bgClass: 'bg-emerald-50', textClass: 'text-emerald-700', borderClass: 'border-emerald-200' },
  { label: 'Ámbar', value: '#F59E0B', bgClass: 'bg-amber-50', textClass: 'text-amber-700', borderClass: 'border-amber-200' },
  { label: 'Rojo', value: '#EF4444', bgClass: 'bg-red-50', textClass: 'text-red-700', borderClass: 'border-red-200' },
  { label: 'Púrpura', value: '#8B5CF6', bgClass: 'bg-purple-50', textClass: 'text-purple-700', borderClass: 'border-purple-200' },
  { label: 'Rosa', value: '#EC4899', bgClass: 'bg-pink-50', textClass: 'text-pink-700', borderClass: 'border-pink-200' },
  { label: 'Cian', value: '#06B6D4', bgClass: 'bg-cyan-50', textClass: 'text-cyan-700', borderClass: 'border-cyan-200' },
  { label: 'Gris', value: '#64748B', bgClass: 'bg-slate-100', textClass: 'text-slate-700', borderClass: 'border-slate-300' },
];

export const FILTER_CHIP_BASE =
  'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border shadow-xs transition-all duration-150';

export const OPERATOR_LABELS: Record<string, string> = {
  contains: 'contiene',
  equals: 'es igual a',
  startsWith: 'empieza con',
  endsWith: 'termina con',
  gt: 'mayor que (>)',
  gte: 'mayor o igual (≥)',
  lt: 'menor que (<)',
  lte: 'menor o igual (≤)',
  between: 'entre',
  before: 'antes de',
  after: 'después de',
  in: 'en lista',
  asc: 'Ascendente',
  desc: 'Descendente',
  none: 'Sin orden',
};

export const ACTION_BASE =
  'inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border transition-all duration-150 cursor-pointer select-none outline-none focus-visible:ring-2 focus-visible:ring-[#3B82F6] focus-visible:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed';

export const ACTION_VARIANT: Record<string, string> = {
  primary: 'bg-blue-50 text-[#1D4ED8] border-blue-200 hover:bg-blue-100 active:bg-blue-200',
  secondary: 'bg-gray-100 text-gray-800 border-gray-200 hover:bg-gray-200 active:bg-gray-300',
  brand: 'bg-emerald-50 text-[#15803D] border-emerald-200 hover:bg-emerald-100 active:bg-emerald-200',
  danger: 'bg-red-50 text-[#B91C1C] border-red-200 hover:bg-red-100 active:bg-red-200',
  ghost: 'bg-transparent text-gray-600 border-transparent hover:bg-gray-100 hover:text-gray-900',
  warning: 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100 active:bg-amber-200',
  info: 'bg-sky-50 text-sky-700 border-sky-200 hover:bg-sky-100 active:bg-sky-200',
  default: 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50 active:bg-gray-100 shadow-xs',
};
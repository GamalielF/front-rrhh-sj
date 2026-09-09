import { DropdownItemVariant, DropdownPlacement } from '../dropdown/dropdown.model';

export const USER_PROFILE_TRIGGER_BASE = [
  'group inline-flex items-center gap-2.5',
  'rounded-full sm:rounded-xl',
  'p-1 sm:px-3 sm:py-1.5',
  'text-sm font-medium',
  'transition-all duration-200 outline-none cursor-pointer',
  'border border-white/20 bg-white/10 text-white',
  'hover:bg-white/20 hover:border-white/30',
  'focus-visible:ring-2 focus-visible:ring-white/50 focus-visible:ring-offset-1 focus-visible:ring-offset-[#002e4f]',
].join(' ');

export const USER_PROFILE_TRIGGER_OPEN_CLASS = 'bg-white/25 border-white/40 ring-2 ring-white/30';

export const USER_PROFILE_PANEL_BASE = [
  'absolute z-50 w-72 origin-top-right rounded-2xl bg-white p-2',
  'shadow-2xl ring-1 ring-black/5 border border-slate-100',
  'animate-in fade-in-0 zoom-in-95 duration-150 ease-out',
].join(' ');

export const USER_PROFILE_PLACEMENT_CLASSES: Record<DropdownPlacement, string> = {
  'bottom-end': 'right-0 top-full mt-2 origin-top-right',
  'bottom-start': 'left-0 top-full mt-2 origin-top-left',
  'bottom-center': 'left-1/2 -translate-x-1/2 top-full mt-2 origin-top',
  'top-end': 'right-0 bottom-full mb-2 origin-bottom-right',
  'top-start': 'left-0 bottom-full mb-2 origin-bottom-left',
  'top-center': 'left-1/2 -translate-x-1/2 bottom-full mb-2 origin-bottom',
};

export const USER_PROFILE_ITEM_BASE = [
  'w-full flex items-center gap-3 px-3 py-2 text-xs font-medium',
  'rounded-lg transition-colors text-left outline-none',
].join(' ');

export const USER_PROFILE_ITEM_DISABLED_CLASS = 'text-gray-400 cursor-not-allowed opacity-60';

export const USER_PROFILE_ITEM_VARIANTS: Record<DropdownItemVariant, string> = {
  danger: 'text-red-600 hover:bg-red-50 hover:text-red-700 active:bg-red-100',
  brand: 'text-[#0061A1] hover:bg-blue-50 hover:text-[#004e82] active:bg-blue-100',
  primary: 'text-[#3B82F6] hover:bg-blue-50 hover:text-[#2563EB] active:bg-blue-100',
  warning: 'text-amber-600 hover:bg-amber-50 hover:text-amber-700 active:bg-amber-100',
  info: 'text-sky-600 hover:bg-sky-50 hover:text-sky-700 active:bg-sky-100',
  default: 'text-slate-700 hover:bg-slate-100 hover:text-slate-900 active:bg-slate-200/60',
};

export const USER_PROFILE_ITEM_ICON_VARIANTS: Record<DropdownItemVariant, string> = {
  danger: 'text-red-500',
  brand: 'text-[#0061A1]',
  primary: 'text-[#3B82F6]',
  warning: 'text-amber-500',
  info: 'text-sky-500',
  default: 'text-slate-400 group-hover:text-slate-600',
};

import { DropdownTriggerVariant, DropdownTriggerSize } from './dropdown.model';

export const TRIGGER_BASE =
  'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-150 cursor-pointer select-none outline-none focus-visible:ring-2 focus-visible:ring-[#3B82F6] focus-visible:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed';

export const TRIGGER_VARIANTS: Record<DropdownTriggerVariant, string> = {
  ghost: 'bg-transparent text-gray-500 hover:text-gray-800 hover:bg-gray-100 active:bg-gray-200',
  secondary: 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50 active:bg-gray-100 shadow-xs',
  primary: 'bg-[#3B82F6] text-white hover:bg-[#2563EB] active:bg-[#1D4ED8] shadow-xs',
  brand: 'bg-[#0061A1] text-white hover:bg-[#004e82] active:bg-[#003d66] shadow-xs',
  outline: 'bg-transparent text-gray-700 border border-gray-300 hover:bg-gray-50 active:bg-gray-100',
};

export const TRIGGER_SIZES: Record<DropdownTriggerSize, string> = {
  xs: 'h-7 px-2 text-xs gap-1',
  sm: 'h-8 px-2.5 text-xs gap-1.5',
  md: 'h-9 px-3.5 text-sm gap-2',
  lg: 'h-10 px-4 text-base gap-2',
};

export const TRIGGER_ICON_SIZES: Record<DropdownTriggerSize, string> = {
  xs: 'h-7 w-7 p-0',
  sm: 'h-8 w-8 p-0',
  md: 'h-9 w-9 p-0',
  lg: 'h-10 w-10 p-0',
};

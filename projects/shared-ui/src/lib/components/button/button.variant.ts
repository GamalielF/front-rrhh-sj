import { ButtonSize, ButtonVariant } from "./button.model";

export const BASE = [
  'flex w-full items-center justify-center',
  'font-medium font-sans',
  'border rounded-lg',
  'cursor-pointer select-none whitespace-nowrap',
  'transition-all duration-150 ease-in-out',
  'outline-none focus-visible:ring-2 focus-visible:ring-[#3B82F6] focus-visible:ring-offset-2',
  'disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none',
  'relative',
].join(' ');

export const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  primary:    'bg-[#3B82F6] text-white border-[#3B82F6] shadow-xs hover:bg-[#2563EB] hover:border-[#2563EB] active:bg-[#1D4ED8]',
  brand:      'bg-[#4CA42F] text-white border-[#4CA42F] shadow-xs hover:bg-[#3b8723] hover:border-[#3b8723] active:bg-[#2f6c1e]',
  'brand-blue': 'bg-[#0061A1] text-white border-[#0061A1] shadow-xs hover:bg-[#005087] hover:border-[#005087] active:bg-[#00406d]',
  secondary:  'bg-white text-gray-800 border-gray-300 shadow-xs hover:bg-gray-50 hover:border-gray-400 hover:text-gray-900 active:bg-gray-100',
  outline:    'bg-transparent text-[#3B82F6] border-[#3B82F6]/60 hover:bg-[#3B82F6]/10 active:bg-[#3B82F6]/20',
  ghost:      'bg-transparent text-gray-700 border-transparent hover:bg-gray-100 hover:text-gray-900 active:bg-gray-200',
  light:      'bg-gray-100 text-gray-800 border-transparent hover:bg-gray-200 active:bg-gray-300',
  danger:     'bg-[#DC2626] text-white border-[#DC2626] shadow-xs hover:bg-[#B91C1C] hover:border-[#B91C1C] active:bg-[#991B1B]',
  success:    'bg-[#16A34A] text-white border-[#16A34A] shadow-xs hover:bg-[#15803D] hover:border-[#15803D] active:bg-[#166534]',
};

export const SIZE_CLASSES: Record<ButtonSize, string> = {
  xs:   'px-2.5 py-1.5  text-xs    min-h-[32px] gap-1.5',
  sm:   'px-3   py-2    text-xs    min-h-[36px] gap-1.5',
  md:   'px-4   py-2.5  text-sm    min-h-[44px] gap-2',
  lg:   'px-6   py-3    text-base  min-h-[48px] gap-2.5',
  icon: 'p-2.5          text-sm    min-h-[44px] min-w-[44px]',
};

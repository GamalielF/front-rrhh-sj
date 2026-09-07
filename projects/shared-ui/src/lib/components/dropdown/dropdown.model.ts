export type DropdownPlacement =
  | 'bottom-end'
  | 'bottom-start'
  | 'bottom-center'
  | 'top-end'
  | 'top-start'
  | 'top-center';

export type DropdownTriggerVariant = 'ghost' | 'secondary' | 'primary' | 'outline' | 'brand';

export type DropdownTriggerSize = 'xs' | 'sm' | 'md' | 'lg';

export type DropdownItemVariant = 'default' | 'primary' | 'brand' | 'warning' | 'danger' | 'info';

export type DropdownBadgeVariant = 'info' | 'warning' | 'danger' | 'success' | 'neutral';

export interface DropdownItem<T = any> {
  id?: string;
  label: string;
  icon?: string;
  description?: string;
  variant?: DropdownItemVariant;
  badge?: string;
  badgeVariant?: DropdownBadgeVariant;
  disabled?: boolean;
  hidden?: boolean;
  divider?: boolean;
  data?: T;
  onClick?: (item: DropdownItem<T>) => void;
}

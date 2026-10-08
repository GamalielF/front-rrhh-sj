import { DropdownBadgeVariant } from '../dropdown/dropdown.model';

export type ColumnType = 'text' | 'badge' | 'currency' | 'date' | 'number' | 'avatar' | 'custom';
export type BadgeVariantFn<T> = (row: T) => 'info' | 'warning' | 'danger' | 'success' | 'neutral';
export type CustomRowValueFn<T> = (row: T) => string;
export type TableActionsLayout = 'dropdown' | 'buttons' | 'auto';

export interface TableColumn<T = any> {
  key: keyof T & string;
  title: string;
  /** Tipo de renderizado */
  type?: ColumnType;
  /** función que retorna la variante semántica según el valor */
  badgeVariant?: BadgeVariantFn<T>;
  /** Sufijo a mostrar luego del valor */
  suffix?: string;
  /** Prefijo a mostrar antes del valor */
  prefix?: string;
  /** Ancho CSS fijo */
  width?: string;
  sortable?: boolean;
}

export interface TableAction<T = any> {
  /** Etiqueta del botón */
  label: string;
  /** Icono opcional del botón (@tui.*) */
  icon?: string;
  description?: string;
  /** Variante del botón */
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'brand' | 'warning' | 'info' | 'default';
  badge?: string | ((row: T) => string);
  badgeVariant?: DropdownBadgeVariant | ((row: T) => DropdownBadgeVariant);
  disabled?: boolean | ((row: T) => boolean);
  /** Si se oculta condicionalmente */
  hidden?: (row: T) => boolean;
  divider?: boolean;
  onClick?: (row: T) => void;
}

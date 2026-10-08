import { ColumnType, BadgeVariantFn, CustomRowValueFn } from '../table/table.model';
import { SelectOption } from '../form/form.model';

export interface RangePreset {
  label: string;
  min: number;
  max: number;
  color?: string;
}

export type FilterType =
  | 'text'
  | 'number'
  | 'number-range'
  | 'date'
  | 'date-range'
  | 'select'
  | 'boolean'
  | 'sort'
  | 'custom'
  | 'dropdown-range';

export type FilterOperator =
  | 'contains'
  | 'equals'
  | 'startsWith'
  | 'endsWith'
  | 'gt'
  | 'gte'
  | 'lt'
  | 'lte'
  | 'between'
  | 'before'
  | 'after'
  | 'in'
  | 'asc'
  | 'desc'
  | 'none'
  | 'custom';

export interface FilterTexts {
  valueLabel?: string;
  placeholder?: string;
  placeholderEnd?: string;
  selectPlaceholder?: string;
  customRangeLabel?: string;
}

export interface ColumnFilterDefinition<T = any> {
  type: FilterType;
  label?: string;
  paramName?: string;
  paramNameEnd?: string;
  operators?: FilterOperator[];
  defaultOperator?: FilterOperator;
  defaultValue?: any;
  defaultValueEnd?: any;
  defaultEnabled?: boolean;
  locked?: boolean;
  options?: SelectOption[];
  defaultColor?: string;
  allowMultiple?: boolean;
  highlightPredicate?: (cellValue: any, filterValue: DataTableFilterValue, row: T) => boolean;
  presetRanges?: RangePreset[];
  texts?: FilterTexts;
}

export interface DataTableFilterValue {
  id: string;
  columnKey: string;
  columnTitle: string;
  type: FilterType;
  operator: FilterOperator;
  value: any;
  valueEnd?: any;
  paramName: string;
  paramNameEnd?: string;
  color?: string;
  enabled: boolean;
  locked?: boolean;
  label?: string;
  instanceIndex?: number;
}

export interface DataTableColumn<T = any> {
  key: keyof T & string;
  title: string;
  type?: ColumnType;
  badgeVariant?: BadgeVariantFn<T>;
  customRowValue?: CustomRowValueFn<T>;
  suffix?: string;
  prefix?: string;
  width?: string;
  sortable?: boolean;
  filters?: ColumnFilterDefinition<T>[];
  allowColorHighlight?: boolean;
}

export interface SpringPageResponse<T = any> {
  content: T[];
  totalElements?: number;
  totalPages?: number;
  size?: number;
  number?: number;
  numberOfElements?: number;
  first?: boolean;
  last?: boolean;
  empty?: boolean;
  pageable?: {
    pageNumber: number;
    pageSize: number;
    offset?: number;
  };

  // Just for compatibility for current backend API
  pageNumber?: number;
  pageSize?: number;
  totalPage?: number;
}

export interface DataTableState {
  page: number;
  pageSize: number;
  filters: DataTableFilterValue[];
  queryParams: Record<string, any>;
}

export type HighlightMode = 'auto' | 'row' | 'cell' | 'none';

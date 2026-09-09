import { TemplateRef } from '@angular/core';
import { ValidatorFn, AsyncValidatorFn } from '@angular/forms';
import { ButtonVariant } from '../button/button.model';
import { GridCols, GridGap } from '../grid/grid.model';
import { GridSpan, GridSpanNumber } from '../grid/grid-item/grid-item.model';
import { InputType } from '../input/input.model';

export type DynamicFieldType =
  | InputType
  | 'select'
  | 'textarea'
  | 'checkbox'
  | 'switch'
  | 'date'
  | 'custom';

export interface SelectOption<T = any> {
  label: string;
  value: T;
  disabled?: boolean;
  hint?: string;
  icon?: string;
}

export interface FormFieldConfig<T = any> {
  name: string;
  label?: string;
  type: DynamicFieldType;
  placeholder?: string;
  defaultValue?: any;
  hint?: string;
  prefixIcon?: string;
  suffixIcon?: string;
  disabled?: boolean;
  readonly?: boolean;
  required?: boolean;
  options?: SelectOption[];
  rows?: number;
  min?: number | string;
  max?: number | string;
  step?: number;
  validators?: ValidatorFn[];
  asyncValidators?: AsyncValidatorFn[];
  customErrorMessages?: Record<string, string>;
  colSpan?: GridSpan;
  colSpanSm?: GridSpanNumber;
  colSpanMd?: GridSpanNumber;
  colSpanLg?: GridSpanNumber;
  colSpanXl?: GridSpanNumber;
  visible?: boolean | ((formValue: T) => boolean);
  dependsOn?: {
    field: string;
    value?: any;
    condition?: (value: any, formValue: T) => boolean;
  };
  customClass?: string;
  customTemplate?: TemplateRef<{ $implicit: FormFieldConfig<T>; control: any }>;
}

export interface FormSectionConfig<T = any> {
  id?: string;
  title?: string;
  description?: string;
  icon?: string;
  divider?: boolean;
  fields: FormFieldConfig<T>[];
  gridCols?: GridCols;
  gap?: GridGap;
  customClass?: string;
}

export interface FormActionConfig {
  submitText?: string;
  submitIcon?: string;
  submitVariant?: ButtonVariant;
  showCancel?: boolean;
  cancelText?: string;
  cancelVariant?: ButtonVariant;
  showReset?: boolean;
  resetText?: string;
  align?: 'start' | 'center' | 'end' | 'between';
  customClass?: string;
}

export interface FormSchema<T = any> {
  sections?: FormSectionConfig<T>[];
  fields?: FormFieldConfig<T>[];
  actions?: FormActionConfig;
  gridCols?: GridCols;
  gap?: GridGap;
  customClass?: string;
}

export type FormErrorMap = Record<string, string | ((error: any) => string)>;

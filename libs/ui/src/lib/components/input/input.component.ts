import {
  Component,
  Input,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  inject,
  OnInit,
  OnDestroy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ControlValueAccessor,
  NgControl,
  ReactiveFormsModule,
} from '@angular/forms';
import { Subscription } from 'rxjs';
import { IconComponent } from '../icon/icon.component';
import { InputSize, InputType } from './input.model';
import { FormErrorsService } from '../form/form-errors.service';

@Component({
  selector: 'ui-input',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './input.component.html',
  styleUrls: ['./input.component.css'],
})
export class InputComponent implements ControlValueAccessor, OnInit, OnDestroy {
  private cdr = inject(ChangeDetectorRef);
  private formErrorsService = inject(FormErrorsService, { optional: true });
  public ngControl = inject(NgControl, { optional: true, self: true });
  private statusSub?: Subscription;

  private static idCounter = 0;

  @Input() label = '';
  @Input() placeholder = '';
  @Input() type: InputType = 'text';
  @Input() size: InputSize = 'md';
  @Input() hint = '';
  @Input() errorMessage = '';
  @Input() customErrorMessages?: Record<string, string>;
  @Input() prefixIcon = '';
  @Input() suffixIcon = '';
  @Input() min?: number | string;
  @Input() max?: number | string;
  @Input() step?: number;
  @Input() required = false;
  @Input() readonly = false;
  @Input() showErrorsWhen: 'touched' | 'dirty' | 'always' = 'touched';

  readonly inputId = `ui-input-${++InputComponent.idCounter}`;
  readonly hintId = `ui-input-hint-${InputComponent.idCounter}`;
  readonly errorId = `ui-input-err-${InputComponent.idCounter}`;

  innerValue: string | number = '';
  isDisabled = false;

  onChange: (value: any) => void = () => {};
  onTouched: () => void = () => {};

  constructor() {
    if (this.ngControl) {
      this.ngControl.valueAccessor = this;
    }
  }

  ngOnInit(): void {
    if (this.ngControl?.statusChanges) {
      this.statusSub = this.ngControl.statusChanges.subscribe(() => {
        this.cdr.markForCheck();
      });
    }
  }

  ngOnDestroy(): void {
    this.statusSub?.unsubscribe();
  }

  get isRequired(): boolean {
    if (this.required) return true;
    if (this.ngControl?.control?.validator) {
      const validator = this.ngControl.control.validator({} as any);
      return !!(validator && validator['required']);
    }
    return false;
  }

  get currentErrorMessage(): string {
    if (this.errorMessage) {
      return this.errorMessage;
    }
    if (!this.ngControl?.control) {
      return '';
    }

    const control = this.ngControl.control;
    const shouldShow =
      this.showErrorsWhen === 'always' ||
      (this.showErrorsWhen === 'touched' && control.touched) ||
      (this.showErrorsWhen === 'dirty' && control.dirty);

    if (shouldShow && control.invalid && control.errors) {
      if (this.formErrorsService) {
        return this.formErrorsService.getErrorMessage(control, this.customErrorMessages);
      }
      const firstKey = Object.keys(control.errors)[0];
      if (this.customErrorMessages && this.customErrorMessages[firstKey]) {
        return this.customErrorMessages[firstKey];
      }
      return 'Campo inválido';
    }

    return '';
  }

  get hasError(): boolean {
    return !!this.currentErrorMessage;
  }

  get inputClasses(): string {
    const py =
      this.size === 'sm'
        ? 'py-1.5 text-xs min-h-[36px]'
        : this.size === 'lg'
        ? 'py-3 text-base min-h-[48px]'
        : 'py-2.5 text-sm min-h-[44px]';

    const baseBorder = this.hasError
      ? 'border-[#DC2626] focus:ring-2 focus:ring-[#DC2626]/20 focus:border-[#DC2626]'
      : 'border-gray-300 focus:ring-2 focus:ring-[#3B82F6]/25 focus:border-[#3B82F6]';

    const pl = this.prefixIcon ? (this.size === 'sm' ? 'pl-9' : 'pl-10') : 'pl-3.5';
    const pr = this.suffixIcon ? (this.size === 'sm' ? 'pr-9' : 'pr-10') : 'pr-3.5';

    return [py, baseBorder, pl, pr].filter(Boolean).join(' ');
  }

  writeValue(value: any): void {
    this.innerValue = value ?? '';
    this.cdr.markForCheck();
  }

  registerOnChange(fn: (value: any) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.isDisabled = isDisabled;
    this.cdr.markForCheck();
  }

  onInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    const value = this.type === 'number' ? (input.valueAsNumber || input.value) : input.value;
    this.innerValue = value;
    this.onChange(value);
  }

  onBlur(): void {
    this.onTouched();
    this.cdr.markForCheck();
  }
}

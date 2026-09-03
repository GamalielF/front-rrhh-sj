import {
  Component,
  Input,
  forwardRef,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ControlValueAccessor,
  NG_VALUE_ACCESSOR,
  ReactiveFormsModule,
} from '@angular/forms';
import { IconComponent } from '../icon/icon.component';
import { InputSize, InputType } from './input.model';

@Component({
  selector: 'ui-input',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => InputComponent),
      multi: true,
    },
  ],
  templateUrl: './input.component.html',
  styleUrls: ['./input.component.scss'],
})
export class InputComponent implements ControlValueAccessor {
  private cdr = inject(ChangeDetectorRef);
  private static idCounter = 0;

  @Input() label = '';
  @Input() placeholder = '';
  @Input() type: InputType = 'text';
  @Input() size: InputSize = 'md';
  @Input() hint = '';
  @Input() errorMessage = '';
  @Input() prefixIcon = '';
  @Input() suffixIcon = '';
  @Input() min?: number | string;
  @Input() max?: number | string;

  readonly inputId = `ui-input-${++InputComponent.idCounter}`;
  readonly hintId = `ui-input-hint-${InputComponent.idCounter}`;
  readonly errorId = `ui-input-err-${InputComponent.idCounter}`;

  innerValue: string | number = '';
  isDisabled = false;

  onChange: (value: any) => void = () => {};
  onTouched: () => void = () => {};

  get hasError(): boolean {
    return !!this.errorMessage;
  }

  get inputClasses(): string {
    const py = this.size === 'sm' ? 'py-1.5 text-xs min-h-[36px]' : this.size === 'lg' ? 'py-3 text-base min-h-[48px]' : 'py-2.5 text-sm min-h-[44px]';
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
}

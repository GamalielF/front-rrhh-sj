import {
  Component,
  Input,
  Output,
  EventEmitter,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  inject,
  OnInit,
  AfterViewInit,
  OnDestroy,
  OnChanges,
  SimpleChanges,
  ViewChildren,
  QueryList,
  ElementRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ControlValueAccessor,
  NgControl,
  ReactiveFormsModule,
} from '@angular/forms';
import { Subscription } from 'rxjs';
import { PinInputSize, PinInputType } from './pin-input.model';
import { FormErrorsService } from '../form/form-errors.service';

@Component({
  selector: 'ui-pin-input',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './pin-input.component.html',
  styleUrls: ['./pin-input.component.css'],
})
export class PinInputComponent
  implements ControlValueAccessor, OnInit, AfterViewInit, OnDestroy, OnChanges
{
  private cdr = inject(ChangeDetectorRef);
  private formErrorsService = inject(FormErrorsService, { optional: true });
  public ngControl = inject(NgControl, { optional: true, self: true });
  private statusSub?: Subscription;
  private focusTimeout?: any;

  private static idCounter = 0;

  @Input() length = 6;
  @Input() type: PinInputType = 'number';
  @Input() size: PinInputSize = 'md';
  @Input() label = '';
  @Input() hint = '';
  @Input() placeholder = '';
  @Input() errorMessage = '';
  @Input() customErrorMessages?: Record<string, string>;
  @Input() required = false;
  @Input() readonly = false;
  @Input() autofocus = false;
  @Input() mask = false;
  @Input() uppercase = true;
  @Input() splitAt?: number | number[];
  @Input() showErrorsWhen: 'touched' | 'dirty' | 'always' = 'touched';

  @Output() completed = new EventEmitter<string>();
  @Output() valueChange = new EventEmitter<string>();

  @ViewChildren('cellInput') cellInputs!: QueryList<ElementRef<HTMLInputElement>>;

  readonly pinId = `ui-pin-${++PinInputComponent.idCounter}`;
  readonly hintId = `ui-pin-hint-${PinInputComponent.idCounter}`;
  readonly errorId = `ui-pin-err-${PinInputComponent.idCounter}`;

  digits: string[] = [];
  isDisabled = false;
  isFocused = false;

  onChange: (value: any) => void = () => {};
  onTouched: () => void = () => {};

  constructor() {
    if (this.ngControl) {
      this.ngControl.valueAccessor = this;
    }
  }

  ngOnInit(): void {
    this.initDigits();
    if (this.ngControl?.statusChanges) {
      this.statusSub = this.ngControl.statusChanges.subscribe(() => {
        this.cdr.markForCheck();
      });
    }
  }

  ngAfterViewInit(): void {
    if (this.autofocus) {
      this.focusTimeout = setTimeout(() => {
        this.focus(0);
      }, 50);
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['length'] && !changes['length'].firstChange) {
      this.initDigits();
    }
  }

  ngOnDestroy(): void {
    this.statusSub?.unsubscribe();
    if (this.focusTimeout) {
      clearTimeout(this.focusTimeout);
    }
  }

  // Track cells by index to prevent DOM destruction and preserve focus
  trackByIndex(index: number): number {
    return index;
  }

  public focus(index = 0): void {
    this.focusIndex(index);
  }

  private initDigits(): void {
    if (this.digits.length !== this.length) {
      this.digits = Array(this.length).fill('');
    }
  }

  isSplitIndex(index: number): boolean {
    if (this.splitAt === undefined) {
      return this.length === 6 && index === 3;
    }
    if (typeof this.splitAt === 'number') {
      return this.splitAt > 0 && index === this.splitAt;
    }
    if (Array.isArray(this.splitAt)) {
      return this.splitAt.includes(index);
    }
    return false;
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

    // Do not show errors while actively interacting
    if (this.isFocused) {
      return '';
    }

    const control = this.ngControl.control;
    const fullCode = this.digits.join('');

    const shouldShow =
      this.showErrorsWhen === 'always' ||
      (this.showErrorsWhen === 'touched' && control.touched) ||
      (this.showErrorsWhen === 'dirty' && control.dirty);

    if (shouldShow && control.invalid && control.errors) {
      // Suppress error while code is partially filled
      if (control.errors['pattern'] && fullCode.length > 0 && fullCode.length < this.length) {
        return '';
      }

      if (this.formErrorsService) {
        return this.formErrorsService.getErrorMessage(
          control,
          this.customErrorMessages
        );
      }
      const firstKey = Object.keys(control.errors)[0];
      if (this.customErrorMessages && this.customErrorMessages[firstKey]) {
        return this.customErrorMessages[firstKey];
      }
      return 'Código inválido';
    }

    return '';
  }

  get hasError(): boolean {
    return !this.isFocused && !!this.currentErrorMessage;
  }

  get cellDimensionClasses(): string {
    switch (this.size) {
      case 'sm':
        return 'w-9 h-10 text-sm sm:w-10 sm:h-11';
      case 'lg':
        return 'w-12 h-14 text-xl sm:w-14 sm:h-16';
      case 'md':
      default:
        return 'w-10 h-12 text-lg sm:w-11 sm:h-13';
    }
  }

  getCellClasses(index: number): string {
    const isErr = this.hasError;

    const baseBorder = isErr
      ? 'border-red-400 text-red-700 bg-red-50/40 focus:border-red-500 focus:ring-1 focus:ring-red-500'
      : 'border-gray-300 text-gray-900 bg-white hover:border-gray-400 focus:border-[#0061A1] focus:ring-1 focus:ring-[#0061A1]';

    return `${this.cellDimensionClasses} ${baseBorder}`;
  }

  getInputType(): string {
    if (this.mask || this.type === 'password') return 'password';
    return this.type === 'number' ? 'tel' : 'text';
  }

  getInputMode(): string {
    if (this.type === 'number') return 'numeric';
    return 'text';
  }

  writeValue(value: any): void {
    if (value === null || value === undefined || value === '') {
      this.digits = Array(this.length).fill('');
    } else {
      const strVal = String(value);
      this.digits = Array.from({ length: this.length }, (_, i) => strVal[i] || '');
    }
    this.digits.forEach((digit, i) => this.syncCellInput(i, digit));
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

  onKeyDown(event: KeyboardEvent, index: number): void {
    if (this.isDisabled || this.readonly) return;
    if (this.focusTimeout) {
      clearTimeout(this.focusTimeout);
    }

    if (event.key === 'Backspace') {
      event.preventDefault();
      if (this.digits[index]) {
        this.digits[index] = '';
        this.syncCellInput(index, '');
        this.updateValue();
        if (index > 0) {
          this.focusIndex(index - 1);
        }
      } else if (index > 0) {
        this.digits[index - 1] = '';
        this.syncCellInput(index - 1, '');
        this.updateValue();
        this.focusIndex(index - 1);
      }
      return;
    }

    if (event.key === 'Delete') {
      event.preventDefault();
      this.digits[index] = '';
      this.syncCellInput(index, '');
      this.updateValue();
      return;
    }

    if (event.key === 'ArrowLeft') {
      if (index > 0) {
        event.preventDefault();
        this.focusIndex(index - 1);
      }
      return;
    }

    if (event.key === 'ArrowRight') {
      if (index < this.length - 1) {
        event.preventDefault();
        this.focusIndex(index + 1);
      }
      return;
    }
  }

  onInput(event: Event, index: number): void {
    if (this.focusTimeout) {
      clearTimeout(this.focusTimeout);
    }

    const input = event.target as HTMLInputElement;
    const rawVal = input.value || '';

    if (!rawVal) {
      this.digits[index] = '';
      this.updateValue();
      if (index > 0) {
        this.focusIndex(index - 1);
      }
      return;
    }

    let char = rawVal.charAt(rawVal.length - 1);

    if (this.type === 'number') {
      if (!/^\d$/.test(char)) {
        input.value = this.digits[index] || '';
        return;
      }
    } else if (this.type === 'alphanumeric') {
      if (!/^[a-zA-Z0-9]$/.test(char)) {
        input.value = this.digits[index] || '';
        return;
      }
      if (this.uppercase) {
        char = char.toUpperCase();
      }
    }

    this.digits[index] = char;
    input.value = char;
    this.updateValue();

    // Safely defer focus transition after current input event cycle completes
    if (index < this.length - 1) {
      this.focusTimeout = setTimeout(() => {
        this.focusIndex(index + 1);
      }, 0);
    }
  }

  onPaste(event: ClipboardEvent, startIndex = 0): void {
    event.preventDefault();
    if (this.isDisabled || this.readonly) return;
    if (this.focusTimeout) {
      clearTimeout(this.focusTimeout);
    }

    const clipboardData = event.clipboardData?.getData('text') || '';
    if (!clipboardData) return;

    let cleanData = clipboardData.trim();
    if (this.type === 'number') {
      cleanData = cleanData.replace(/\D/g, '');
    } else if (this.type === 'alphanumeric') {
      cleanData = cleanData.replace(/[^a-zA-Z0-9]/g, '');
    }

    if (this.uppercase && this.type !== 'password' && this.type !== 'number') {
      cleanData = cleanData.toUpperCase();
    }

    if (!cleanData) return;

    const pasteFrom = cleanData.length >= this.length ? 0 : startIndex;
    const chars = cleanData.split('');
    let targetIdx = pasteFrom;

    for (let i = 0; i < chars.length && targetIdx < this.length; i++) {
      this.digits[targetIdx] = chars[i];
      this.syncCellInput(targetIdx, chars[i]);
      targetIdx++;
    }

    this.updateValue();

    const nextFocus = Math.min(targetIdx, this.length - 1);
    this.focusTimeout = setTimeout(() => {
      this.focusIndex(nextFocus);
    }, 0);
  }

  onFocusIn(): void {
    this.isFocused = true;
    this.cdr.markForCheck();
  }

  onFocusOut(event: FocusEvent): void {
    const currentTarget = event.currentTarget as HTMLElement;
    const relatedTarget = event.relatedTarget as HTMLElement;

    if (!currentTarget || !currentTarget.contains(relatedTarget)) {
      this.isFocused = false;
      this.onTouched();
      this.cdr.markForCheck();
    }
  }

  onCellFocus(event: FocusEvent): void {
    const input = event.target as HTMLInputElement;
    input.select();
  }

  private syncCellInput(index: number, val: string): void {
    const inputsArray = this.cellInputs?.toArray();
    if (inputsArray && inputsArray[index]) {
      inputsArray[index].nativeElement.value = val;
    }
  }

  private focusIndex(index: number): void {
    const inputsArray = this.cellInputs?.toArray();
    if (inputsArray && inputsArray[index]) {
      inputsArray[index].nativeElement.focus();
      inputsArray[index].nativeElement.select();
    }
  }

  private updateValue(): void {
    const fullCode = this.digits.join('');
    this.onChange(fullCode);
    this.valueChange.emit(fullCode);

    if (fullCode.length === this.length) {
      this.completed.emit(fullCode);
    }
    this.cdr.markForCheck();
  }
}

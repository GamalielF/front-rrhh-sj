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
import { AbstractControl } from '@angular/forms';
import { Subscription } from 'rxjs';
import { FormErrorsService } from '../form-errors.service';

@Component({
  selector: 'ui-form-field',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './form-field.component.html',
})
export class FormFieldComponent implements OnInit, OnDestroy {
  private cdr = inject(ChangeDetectorRef);
  private formErrorsService = inject(FormErrorsService);
  private statusSub?: Subscription;

  private static idCounter = 0;

  @Input() label = '';
  @Input() forId = '';
  @Input() hint = '';
  @Input() errorMessage = '';
  @Input() customErrorMessages?: Record<string, string>;
  @Input() required = false;
  @Input() control?: AbstractControl | null;
  @Input() showErrorsWhen: 'touched' | 'dirty' | 'always' = 'touched';
  @Input() customClass = '';

  readonly fieldId = `ui-ff-${++FormFieldComponent.idCounter}`;
  readonly hintId = `ui-ff-hint-${FormFieldComponent.idCounter}`;
  readonly errorId = `ui-ff-err-${FormFieldComponent.idCounter}`;

  ngOnInit(): void {
    if (this.control?.statusChanges) {
      this.statusSub = this.control.statusChanges.subscribe(() => {
        this.cdr.markForCheck();
      });
    }
  }

  ngOnDestroy(): void {
    this.statusSub?.unsubscribe();
  }

  get isRequired(): boolean {
    if (this.required) return true;
    if (this.control?.validator) {
      const validator = this.control.validator({} as any);
      return !!(validator && validator['required']);
    }
    return false;
  }

  get currentErrorMessage(): string {
    if (this.errorMessage) {
      return this.errorMessage;
    }
    if (!this.control) {
      return '';
    }

    const shouldShow =
      this.showErrorsWhen === 'always' ||
      (this.showErrorsWhen === 'touched' && this.control.touched) ||
      (this.showErrorsWhen === 'dirty' && this.control.dirty);

    if (shouldShow && this.control.invalid && this.control.errors) {
      return this.formErrorsService.getErrorMessage(this.control, this.customErrorMessages);
    }
    return '';
  }

  get hasError(): boolean {
    return !!this.currentErrorMessage;
  }
}

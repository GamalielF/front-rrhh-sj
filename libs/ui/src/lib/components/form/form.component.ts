import {
  Component,
  Input,
  Output,
  EventEmitter,
  ChangeDetectionStrategy,
  ElementRef,
  inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { IconComponent } from '../icon/icon.component';

@Component({
  selector: 'ui-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './form.component.html',
})
export class FormComponent {
  private el = inject(ElementRef);

  @Input({ required: true }) formGroup!: FormGroup;
  @Input() errorMessage = '';
  @Input() successMessage = '';
  @Input() customClass = '';
  @Input() autoFocusError = true;

  @Output() formSubmit = new EventEmitter<any>();
  @Output() formCancel = new EventEmitter<void>();

  onSubmit(event: Event): void {
    event.preventDefault();

    if (this.formGroup.invalid) {
      this.formGroup.markAllAsTouched();
      if (this.autoFocusError) {
        this.focusFirstError();
      }
      return;
    }

    this.formSubmit.emit(this.formGroup.value);
  }

  onCancel(): void {
    this.formCancel.emit();
  }

  private focusFirstError(): void {
    setTimeout(() => {
      const invalidElement = this.el.nativeElement.querySelector(
        'input.border-\\[\\#DC2626\\], input[aria-invalid="true"], select.border-\\[\\#DC2626\\], textarea.border-\\[\\#DC2626\\], .ng-invalid:not(form)'
      ) as HTMLElement;
      if (invalidElement) {
        invalidElement.focus();
        invalidElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 50);
  }
}

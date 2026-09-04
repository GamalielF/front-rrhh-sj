import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IconComponent } from '../../icon/icon.component';

@Component({
  selector: 'ui-form-section',
  standalone: true,
  imports: [CommonModule, IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './form-section.component.html',
})
export class FormSectionComponent {
  @Input() title = '';
  @Input() description = '';
  @Input() icon = '';
  @Input() divider = true;
  @Input() customClass = '';
}

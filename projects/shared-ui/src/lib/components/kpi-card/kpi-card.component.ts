import {
  Component,
  Input,
  ChangeDetectionStrategy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { IconComponent } from '../icon/icon.component';
import { KpiColor, KpiTrend } from './kpi-card.model';

const ICON_BG_CLASSES: Record<KpiColor, string> = {
  blue:    'bg-blue-50 text-[#3B82F6] border border-blue-100',
  green:   'bg-emerald-50 text-[#16A34A] border border-emerald-100',
  warning: 'bg-amber-50 text-[#D97706] border border-amber-100',
  danger:  'bg-red-50 text-[#DC2626] border border-red-100',
  info:    'bg-sky-50 text-sky-600 border border-sky-100',
  purple:  'bg-purple-50 text-[#8B5CF6] border border-purple-100',
};

@Component({
  selector: 'ui-kpi-card',
  standalone: true,
  imports: [CommonModule, IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './kpi-card.component.html',
  styleUrls: ['./kpi-card.component.scss'],
})
export class KpiCardComponent {
  @Input() label = '';
  @Input() value: string | number = '';
  @Input() icon = '';
  @Input() trend?: KpiTrend;
  @Input() description = '';
  @Input() accentColor: KpiColor = 'blue';

  get iconContainerClass(): string {
    return ICON_BG_CLASSES[this.accentColor] || ICON_BG_CLASSES['blue'];
  }
}

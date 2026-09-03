export interface KpiTrend {
  value: number;
  direction: 'up' | 'down';
  label?: string;
}

export type KpiColor = 'blue' | 'green' | 'warning' | 'danger' | 'info' | 'purple';

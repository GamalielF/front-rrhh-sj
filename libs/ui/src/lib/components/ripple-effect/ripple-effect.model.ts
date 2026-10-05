export interface RippleConfig {
  resolution: number;
  dropRadius: number;
  perturbance: number;
  damping: number;
  interactive: boolean;
}

export const DEFAULT_RIPPLE_CONFIG: RippleConfig = {
  resolution: 512,
  dropRadius: 25,
  perturbance: 0.015,
  damping: 0.90,
  interactive: true,
};

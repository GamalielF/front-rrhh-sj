import { sumarMeses } from './rrhh.util';

describe('sumarMeses', () => {
  it('suma meses cruzando el cambio de año', () => {
    expect(sumarMeses('2026-10', 1)).toBe('2026-11');
    expect(sumarMeses('2026-11', 3)).toBe('2027-02');
    expect(sumarMeses('2026-12', 1)).toBe('2027-01');
    expect(sumarMeses('2026-10', 12)).toBe('2027-10');
  });

  it('también resta, y cero lo deja igual', () => {
    expect(sumarMeses('2026-01', -1)).toBe('2025-12');
    expect(sumarMeses('2026-10', 0)).toBe('2026-10');
  });
});

import { mensajeFueraDeRango } from './rrhh.model';
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

describe('mensajeFueraDeRango', () => {
  it('con un mes de margen habla del próximo mes; con más, dice cuántos', () => {
    expect(mensajeFueraDeRango(1)).toBe('Use un mes entre enero de 2020 y el próximo mes');
    expect(mensajeFueraDeRango(12)).toBe('Use un mes entre enero de 2020 y hasta 12 meses por delante del actual');
  });
});

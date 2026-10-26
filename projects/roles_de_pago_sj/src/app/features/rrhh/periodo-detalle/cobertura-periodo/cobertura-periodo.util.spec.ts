import { porcentajeLeido } from './cobertura-periodo.util';

describe('porcentajeLeido', () => {
  it('redondea y no divide entre cero', () => {
    expect(porcentajeLeido(1, 3)).toBe(33);
    expect(porcentajeLeido(3, 3)).toBe(100);
    expect(porcentajeLeido(0, 0)).toBe(0);
  });
});

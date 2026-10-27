import { env as desarrollo } from './env.dev';
import { env as produccion } from './env.prod';

describe('entornos', () => {
  it('producción solo deja abrir un período hasta el mes siguiente', () => {
    expect(produccion.mesesFuturosPermitidos).toBe(1);
  });

  it('desarrollo deja abrir meses por delante para poder ensayar, pero con un tope', () => {
    expect(desarrollo.mesesFuturosPermitidos).toBeGreaterThan(1);
    expect(desarrollo.mesesFuturosPermitidos).toBeLessThanOrEqual(24);
  });

  it('los dos entornos apuntan al mismo contrato de claves', () => {
    expect(Object.keys(produccion).sort()).toEqual(Object.keys(desarrollo).sort());
  });
});

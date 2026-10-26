import { formatearFechaHora, formatearPeriodo, formatearTamano } from './formato.util';

describe('formatearPeriodo', () => {
  it('escribe el mes en español con mayúscula inicial y sin "de"', () => {
    expect(formatearPeriodo('2026-09')).toBe('Septiembre 2026');
    expect(formatearPeriodo('2026-01')).toBe('Enero 2026');
  });

  it('devuelve el texto tal cual si no es un período', () => {
    expect(formatearPeriodo('abc')).toBe('abc');
  });
});

describe('formatearFechaHora', () => {
  it('convierte la fecha ISO del servidor a día/mes/año y hora, sin cambiar de zona', () => {
    expect(formatearFechaHora('2026-10-22T16:53:39.558953697')).toBe('22/10/2026 16:53');
  });

  it('un valor vacío se muestra como guion', () => {
    expect(formatearFechaHora(null)).toBe('—');
    expect(formatearFechaHora(undefined)).toBe('—');
  });
});

describe('formatearTamano', () => {
  it('elige la unidad según el tamaño', () => {
    expect(formatearTamano(512)).toBe('512 B');
    expect(formatearTamano(2048)).toBe('2 KB');
    expect(formatearTamano(5 * 1024 * 1024)).toBe('5.0 MB');
  });
});

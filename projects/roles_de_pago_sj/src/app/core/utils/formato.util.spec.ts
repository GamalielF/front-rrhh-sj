import { acortarTexto, fechaIso, formatearFechaHora, formatearHora, formatearPeriodo, formatearTamano, restarDias } from './formato.util';

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

describe('fechaIso y restarDias', () => {
  it('escribe la fecha local como aaaa-mm-dd, con ceros', () => {
    expect(fechaIso(new Date(2026, 0, 5))).toBe('2026-01-05');
    expect(fechaIso(new Date(2026, 9, 26))).toBe('2026-10-26');
  });

  it('restar días cruza los cambios de mes y de año sin tocar la fecha original', () => {
    const hoy = new Date(2026, 0, 3);
    expect(fechaIso(restarDias(hoy, 7))).toBe('2025-12-27');
    expect(fechaIso(hoy)).toBe('2026-01-03');
  });
});

describe('acortarTexto', () => {
  it('deja intacto lo que cabe', () => {
    expect(acortarTexto('hola', 10)).toBe('hola');
    expect(acortarTexto('1234567890', 10)).toBe('1234567890');
  });

  it('corta lo que no cabe con puntos suspensivos, sin pasarse del máximo ni dejar un espacio antes', () => {
    expect(acortarTexto('abcdefghijk', 10)).toBe('abcdefghi…');
    expect(acortarTexto('hola mundo cruel', 10)).toBe('hola mund…');
    expect(acortarTexto('hola   mundo', 6)).toBe('hola…');
  });
});

describe('formatearHora', () => {
  it('escribe horas, minutos y segundos con dos dígitos', () => {
    expect(formatearHora(new Date(2026, 9, 29, 9, 5, 7))).toBe('09:05:07');
    expect(formatearHora(new Date(2026, 9, 29, 23, 59, 0))).toBe('23:59:00');
  });
});

import { anioInicial, celdasDelAnio, NOMBRES_MESES } from './selector-mes.util';

const opciones = { minimo: '2020-01', maximo: '2027-10', seleccionado: '', existentes: [] as string[] };

describe('celdasDelAnio', () => {
  it('trae los doce meses en orden, con su nombre completo y su período', () => {
    const celdas = celdasDelAnio(2026, opciones);
    expect(celdas).toHaveLength(12);
    expect(celdas.map((celda) => celda.nombre)).toEqual([...NOMBRES_MESES]);
    expect(celdas[0].periodo).toBe('2026-01');
    expect(celdas[8]).toMatchObject({ periodo: '2026-09', nombre: 'Septiembre' });
    expect(celdas[11].periodo).toBe('2026-12');
  });

  it('un año del medio no tiene nada deshabilitado', () => {
    expect(celdasDelAnio(2026, opciones).some((celda) => celda.deshabilitada)).toBe(false);
  });

  it('deshabilita los meses anteriores al mínimo', () => {
    const celdas = celdasDelAnio(2020, { ...opciones, minimo: '2020-03' });
    expect(celdas.filter((celda) => celda.deshabilitada).map((celda) => celda.nombre)).toEqual(['Enero', 'Febrero']);
  });

  it('deshabilita los meses posteriores al máximo', () => {
    const celdas = celdasDelAnio(2027, opciones);
    expect(celdas.filter((celda) => celda.deshabilitada).map((celda) => celda.nombre)).toEqual(['Noviembre', 'Diciembre']);
  });

  it('un año entero fuera del rango queda deshabilitado', () => {
    expect(celdasDelAnio(2028, opciones).every((celda) => celda.deshabilitada)).toBe(true);
    expect(celdasDelAnio(2019, opciones).every((celda) => celda.deshabilitada)).toBe(true);
  });

  it('marca el mes seleccionado y los períodos que ya existen', () => {
    const celdas = celdasDelAnio(2026, { ...opciones, seleccionado: '2026-10', existentes: ['2026-08', '2026-09', '2025-12'] });
    expect(celdas.filter((celda) => celda.seleccionada).map((celda) => celda.periodo)).toEqual(['2026-10']);
    expect(celdas.filter((celda) => celda.existe).map((celda) => celda.periodo)).toEqual(['2026-08', '2026-09']);
  });
});

describe('anioInicial', () => {
  it('usa el año del período elegido si es válido', () => {
    expect(anioInicial('2024-05', '2026-10', '2020-01', '2027-10')).toBe(2024);
  });

  it('sin período válido usa el de referencia (el mes actual)', () => {
    expect(anioInicial('', '2026-10', '2020-01', '2027-10')).toBe(2026);
    expect(anioInicial('octubre', '2026-10', '2020-01', '2027-10')).toBe(2026);
  });

  it('nunca queda fuera del rango permitido', () => {
    expect(anioInicial('2035-01', '2026-10', '2020-01', '2027-10')).toBe(2027);
    expect(anioInicial('2010-01', '2026-10', '2020-01', '2027-10')).toBe(2020);
  });
});

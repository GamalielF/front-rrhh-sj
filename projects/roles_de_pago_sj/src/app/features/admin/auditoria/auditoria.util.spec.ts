import { accion, acceso, filtros } from './auditoria.testing';
import {
  aFilasAcciones,
  aFilasAccesos,
  aFilasDenegados,
  etiquetaDeFiltro,
  opcionesDeFiltro,
  parametrosDe,
  validarFiltros,
  valorDeOpcion,
} from './auditoria.util';
import { OPCIONES_RESULTADO } from './auditoria.model';

const HOY = new Date(2026, 9, 26);

describe('validarFiltros', () => {
  it('sin filtros, o con un rango razonable, no hay problema', () => {
    expect(validarFiltros(filtros(), 'accesos', HOY)).toBeNull();
    expect(validarFiltros(filtros({ desde: '2026-10-01', hasta: '2026-10-20' }), 'accesos', HOY)).toBeNull();
  });

  it('rechaza un "desde" posterior al "hasta", o posterior a hoy cuando no hay "hasta"', () => {
    expect(validarFiltros(filtros({ desde: '2026-10-20', hasta: '2026-10-10' }), 'acciones', HOY)).toContain('no puede ser posterior');
    expect(validarFiltros(filtros({ desde: '2026-11-01' }), 'acciones', HOY)).toContain('no puede ser posterior');
  });

  it('el rango máximo es de 366 días, contando hasta hoy si falta el "hasta"', () => {
    expect(validarFiltros(filtros({ desde: '2025-10-25' }), 'accesos', HOY)).toBeNull();
    expect(validarFiltros(filtros({ desde: '2025-10-24' }), 'accesos', HOY)).toContain('366 días');
    expect(validarFiltros(filtros({ desde: '2024-01-01', hasta: '2026-01-01' }), 'denegados', HOY)).toContain('366 días');
  });

  it('el período debe ser aaaa-mm, pero en intentos denegados no se usa', () => {
    expect(validarFiltros(filtros({ periodo: 'octubre' }), 'accesos', HOY)).toContain('aaaa-mm');
    expect(validarFiltros(filtros({ periodo: '2026-13' }), 'acciones', HOY)).toContain('aaaa-mm');
    expect(validarFiltros(filtros({ periodo: 'octubre' }), 'denegados', HOY)).toBeNull();
    expect(validarFiltros(filtros({ periodo: '2026-10' }), 'accesos', HOY)).toBeNull();
  });

  it('el mínimo de intentos denegados es un entero de 1 en adelante', () => {
    expect(validarFiltros(filtros({ minimo: 0 }), 'denegados', HOY)).toContain('entero');
    expect(validarFiltros(filtros({ minimo: 2.5 }), 'denegados', HOY)).toContain('entero');
    expect(validarFiltros(filtros({ minimo: Number.NaN }), 'denegados', HOY)).toContain('entero');
    expect(validarFiltros(filtros({ minimo: 3 }), 'denegados', HOY)).toBeNull();
  });
});

describe('parametrosDe', () => {
  const lleno = filtros({
    desde: '2026-10-01',
    usuario: '  FSEPA ',
    periodo: '2026-10',
    resultado: 'DENEGADO',
    tipoAcceso: 'CONSULTA_AJENA',
    tipoAccion: 'CARGA_LOTE',
    minimo: 5,
  });

  it('accesos usa resultado y tipo de acceso, y omite lo vacío', () => {
    expect(parametrosDe(lleno, 'accesos')).toEqual({
      desde: '2026-10-01',
      usuario: 'FSEPA',
      periodo: '2026-10',
      resultado: 'DENEGADO',
      tipo: 'CONSULTA_AJENA',
    });
  });

  it('acciones usa el tipo de acción como "tipo"', () => {
    expect(parametrosDe(lleno, 'acciones')).toEqual({ desde: '2026-10-01', usuario: 'FSEPA', periodo: '2026-10', tipo: 'CARGA_LOTE' });
  });

  it('denegados solo usa fechas y el mínimo', () => {
    expect(parametrosDe(lleno, 'denegados')).toEqual({ desde: '2026-10-01', minimo: 5 });
  });

  it('sin filtros no envía nada, salvo el mínimo de los denegados', () => {
    expect(parametrosDe(filtros(), 'accesos')).toEqual({});
    expect(parametrosDe(filtros(), 'denegados')).toEqual({ minimo: 3 });
  });
});

describe('filas de las tablas', () => {
  it('un acceso permitido se presenta en español, con la fecha en hora local y sin la cédula completa', () => {
    const [fila] = aFilasAccesos([acceso()]);
    expect(fila).toMatchObject({
      fecha: '26/10/2026 09:15',
      tipo: 'Propia',
      resultado: 'Permitido',
      esDenegado: false,
      detalle: 'Correcto',
      cedula: '17******75',
      periodo: 'Septiembre 2026',
      motivo: '—',
    });
  });

  it('un acceso denegado a un rol ajeno se marca y explica el motivo del bloqueo', () => {
    const [fila] = aFilasAccesos([
      acceso({ tipoAcceso: 'CONSULTA_AJENA', resultado: 'DENEGADO', detalle: 'BLOQUEADO_POR_INTENTOS', periodo: null, motivo: 'Revisión', ip: null }),
    ]);
    expect(fila).toMatchObject({ tipo: 'De otra persona', esDenegado: true, detalle: 'Bloqueado por intentos', periodo: '—', motivo: 'Revisión', ip: '—' });
  });

  it('una acción muestra su nombre en español y el rol afectado', () => {
    const [publicada, rol] = aFilasAcciones([accion(), accion({ tipoAccion: 'ROL_INACTIVADO', rolPagoId: 7, periodo: null, detalle: null })]);
    expect(publicada).toMatchObject({ accion: 'Período publicado', periodo: 'Octubre 2026', rol: '—' });
    expect(rol).toMatchObject({ accion: 'Rol inactivado', rol: '#7', periodo: '—', detalle: '—' });
  });

  it('un valor desconocido del servidor se muestra tal cual y no se pierde', () => {
    expect(aFilasAcciones([accion({ tipoAccion: 'ACCION_NUEVA' as never })])[0].accion).toBe('ACCION_NUEVA');
    expect(aFilasAccesos([acceso({ detalle: 'MOTIVO_NUEVO' as never })])[0].detalle).toBe('MOTIVO_NUEVO');
  });

  it('los denegados muestran intentos, cédulas distintas y el último intento', () => {
    const [fila] = aFilasDenegados([{ usuario: 'jperez', intentos: 6, cedulasDistintas: 5, ultimoIntento: '2026-10-26T10:00:00' }]);
    expect(fila).toEqual({ usuario: 'jperez', intentos: 6, cedulas: 5, ultimoIntento: '26/10/2026 10:00' });
  });
});

describe('opciones de los menús', () => {
  it('marca la opción elegida y usa "todos" como identificador de la opción vacía', () => {
    const items = opcionesDeFiltro(OPCIONES_RESULTADO, 'DENEGADO');
    expect(items.map((item) => item.id)).toEqual(['todos', 'PERMITIDO', 'DENEGADO']);
    expect(items[2]).toMatchObject({ icon: '@tui.check', variant: 'brand' });
    expect(items[0].icon).toBeUndefined();
  });

  it('la etiqueta del botón dice qué se eligió, y "Todos" si nada', () => {
    expect(etiquetaDeFiltro(OPCIONES_RESULTADO, 'DENEGADO', 'Resultado')).toBe('Resultado: Denegado');
    expect(etiquetaDeFiltro(OPCIONES_RESULTADO, '', 'Resultado')).toBe('Resultado: Todos');
  });

  it('valorDeOpcion devuelve vacío para "todos"', () => {
    expect(valorDeOpcion('todos')).toBe('');
    expect(valorDeOpcion(undefined)).toBe('');
    expect(valorDeOpcion('DENEGADO')).toBe('DENEGADO');
  });
});

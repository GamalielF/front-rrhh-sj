import type { DenegadosPorUsuarioResponse, EstadoDirectorioResponse } from '@models';
import { accesosRapidosDe, alertasDeDenegados, alertasDeDirectorio, diasDesde } from './home.util';

const HOY = new Date(2026, 9, 26);

const estado = (cambios: Partial<EstadoDirectorioResponse> = {}): EstadoDirectorioResponse => ({
  activos: 312,
  inactivos: 14,
  ultimaSincronizacion: '2026-10-25T08:30:00',
  resultadoUltima: 'EXITOSA',
  mensajeUltima: null,
  ...cambios,
});

const denegado = (usuario: string, intentos: number): DenegadosPorUsuarioResponse => ({
  usuario,
  intentos,
  cedulasDistintas: intentos,
  ultimoIntento: '2026-10-26T10:00:00',
});

describe('accesosRapidosDe', () => {
  const titulos = (roles: Parameters<typeof accesosRapidosDe>[0]) => accesosRapidosDe(roles).map((acceso) => acceso.titulo);

  it('un empleado no tiene accesos rápidos: su tarjeta de rol de pago ya cumple esa función', () => {
    expect(titulos(['EMPLEADO'])).toEqual([]);
  });

  it('RRHH ve solo Períodos', () => {
    expect(titulos(['RRHH', 'EMPLEADO'])).toEqual(['Períodos']);
  });

  it('un administrador ve todos', () => {
    expect(titulos(['ADMIN', 'EMPLEADO'])).toEqual(['Períodos', 'Usuarios y roles', 'Directorio', 'Auditoría']);
  });
});

describe('diasDesde', () => {
  it('cuenta días de calendario, sin importar la hora', () => {
    expect(diasDesde('2026-10-19T23:59:00', HOY)).toBe(7);
    expect(diasDesde('2026-10-26T00:01:00', HOY)).toBe(0);
  });

  it('nunca da negativo ni falla con un texto raro', () => {
    expect(diasDesde('2026-11-01T10:00:00', HOY)).toBe(0);
    expect(diasDesde('no es una fecha', HOY)).toBe(0);
  });
});

describe('alertasDeDirectorio', () => {
  it('un directorio sincronizado hace poco no genera alerta', () => {
    expect(alertasDeDirectorio(estado(), HOY)).toEqual([]);
  });

  it('exactamente 7 días todavía está bien; 8 ya avisa', () => {
    expect(alertasDeDirectorio(estado({ ultimaSincronizacion: '2026-10-19T08:00:00' }), HOY)).toEqual([]);
    const [alerta] = alertasDeDirectorio(estado({ ultimaSincronizacion: '2026-10-18T08:00:00' }), HOY);
    expect(alerta).toMatchObject({ variante: 'warning', ruta: '/admin/directorio' });
    expect(alerta.mensaje).toContain('hace 8 días');
    expect(alerta.mensaje).toContain('18/10/2026 08:00');
  });

  it('si nunca se sincronizó avisa', () => {
    const [alerta] = alertasDeDirectorio(estado({ ultimaSincronizacion: null, resultadoUltima: null }), HOY);
    expect(alerta).toMatchObject({ variante: 'warning' });
    expect(alerta.mensaje).toContain('todavía no se ha sincronizado');
  });

  it('una sincronización fallida es una alerta roja con el motivo, aunque sea reciente', () => {
    const [alerta] = alertasDeDirectorio(estado({ resultadoUltima: 'FALLIDA', mensajeUltima: 'El AD no respondió' }), HOY);
    expect(alerta).toMatchObject({ variante: 'danger' });
    expect(alerta.mensaje).toBe('La última sincronización del directorio falló: El AD no respondió');
    expect(alertasDeDirectorio(estado({ resultadoUltima: 'FALLIDA' }), HOY)[0].mensaje).toBe('La última sincronización del directorio falló.');
  });
});

describe('alertasDeDenegados', () => {
  it('sin nadie no hay alerta', () => {
    expect(alertasDeDenegados([])).toEqual([]);
  });

  it('con una persona habla en singular y dice cuántos intentos', () => {
    const [alerta] = alertasDeDenegados([denegado('jperez', 6)]);
    expect(alerta).toMatchObject({ variante: 'warning', ruta: '/admin/auditoria' });
    expect(alerta.mensaje).toContain('1 usuario tiene 3 o más intentos denegados en los últimos 7 días: jperez (6).');
  });

  it('con muchas nombra a las tres primeras y cuenta el resto', () => {
    const [alerta] = alertasDeDenegados(['a', 'b', 'c', 'd', 'e'].map((usuario, i) => denegado(usuario, 9 - i)));
    expect(alerta.mensaje).toContain('5 usuarios tienen');
    expect(alerta.mensaje).toContain('a (9), b (8), c (7) y 2 más.');
  });
});

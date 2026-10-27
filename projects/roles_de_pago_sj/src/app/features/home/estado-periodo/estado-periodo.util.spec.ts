import type { CoberturaPeriodoResponse, InformeNotificacionesResponse, ResumenPeriodoResponse } from '@models';
import { indicadoresDe } from './estado-periodo.util';

const resumen = (cambios: Partial<ResumenPeriodoResponse> = {}): ResumenPeriodoResponse => ({
  periodo: '2026-10',
  estadoPeriodo: 'CARGADO',
  rolesActivos: 118,
  rolesInactivos: 0,
  personasActivas: 121,
  sinRol: 3,
  nombresSinRol: [],
  rolesSinPersonaActiva: 0,
  nombresRolesSinPersona: [],
  ...cambios,
});

const cobertura: CoberturaPeriodoResponse = { periodo: '2026-10', rolesPublicados: 118, leidos: 59, pendientes: 59, nombresPendientes: [] };

const informe = (cambios: Partial<InformeNotificacionesResponse> = {}): InformeNotificacionesResponse => ({
  periodo: '2026-10',
  habilitadas: true,
  total: 118,
  pendientes: 0,
  reintentando: 0,
  enviadas: 116,
  fallidas: 2,
  omitidas: 0,
  problemas: [],
  ...cambios,
});

describe('indicadoresDe', () => {
  it('en preparación solo hay roles cargados y personas sin rol, esta última resaltada', () => {
    const indicadores = indicadoresDe(resumen(), null, null);
    expect(indicadores.map((i) => `${i.etiqueta}: ${i.valor}`)).toEqual(['Roles cargados: 118', 'Personas sin rol: 3']);
    expect(indicadores[1].acento).toBe('warning');
  });

  it('si no falta nadie, las personas sin rol salen en verde', () => {
    expect(indicadoresDe(resumen({ sinRol: 0 }), null, null)[1].acento).toBe('green');
  });

  it('publicado suma cuántos abrieron su rol, con porcentaje, y los avisos fallidos en rojo', () => {
    const indicadores = indicadoresDe(resumen({ estadoPeriodo: 'PUBLICADO' }), cobertura, informe());
    expect(indicadores.map((i) => `${i.etiqueta}: ${i.valor}`)).toEqual([
      'Roles cargados: 118',
      'Personas sin rol: 3',
      'Ya abrieron su rol: 59 (50%)',
      'Avisos fallidos: 2',
    ]);
    expect(indicadores[3].acento).toBe('danger');
  });

  it('sin avisos fallidos salen en verde, y con los avisos deshabilitados no se muestran', () => {
    expect(indicadoresDe(resumen(), null, informe({ fallidas: 0 }))[2].acento).toBe('green');
    expect(indicadoresDe(resumen(), null, informe({ habilitadas: false })).some((i) => i.etiqueta === 'Avisos fallidos')).toBe(false);
  });
});

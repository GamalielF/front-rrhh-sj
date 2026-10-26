import type { InformeNotificacionesResponse } from '@models';
import { aFilasProblemas, hayEnviosPendientes } from './notificaciones-periodo.util';

const informe = (cambios: Partial<InformeNotificacionesResponse> = {}): InformeNotificacionesResponse => ({
  periodo: '2026-09',
  habilitadas: true,
  total: 10,
  pendientes: 0,
  reintentando: 0,
  enviadas: 10,
  fallidas: 0,
  omitidas: 0,
  problemas: [],
  ...cambios,
});

describe('aFilasProblemas', () => {
  it('traduce el estado y explica los avisos omitidos', () => {
    const [fallido, omitido, sinDetalle] = aFilasProblemas([
      { nombre: 'PEREZ JUAN', estado: 'FALLIDA', intentos: 5, error: 'La API de correo no respondió a tiempo' },
      { nombre: 'GARCIA ANA', estado: 'OMITIDA', intentos: 0, error: null },
      { nombre: 'MORA LUIS', estado: 'FALLIDA', intentos: 1, error: null },
    ]);
    expect(fallido).toMatchObject({ estadoEtiqueta: 'Fallido', detalle: 'La API de correo no respondió a tiempo' });
    expect(omitido).toMatchObject({ estadoEtiqueta: 'Omitido', detalle: 'Sin cuenta activa con correo' });
    expect(sinDetalle.detalle).toBe('—');
  });
});

describe('hayEnviosPendientes', () => {
  it('solo si los avisos están habilitados y quedan pendientes', () => {
    expect(hayEnviosPendientes(informe({ pendientes: 3 }))).toBe(true);
    expect(hayEnviosPendientes(informe())).toBe(false);
    expect(hayEnviosPendientes(informe({ pendientes: 3, habilitadas: false }))).toBe(false);
  });
});

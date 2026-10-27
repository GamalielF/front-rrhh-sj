import type { InformeNotificacionesResponse } from '@models';
import { advertenciasDeEnvio, aFilasProblemas, hayEnviosPendientes } from './notificaciones-periodo.util';

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

describe('advertenciasDeEnvio', () => {
  it('con todo en orden no advierte nada', () => {
    expect(advertenciasDeEnvio(informe({ pendientes: 3, envioConfigurado: true, despachoAutomatico: true, modoCorreo: 'API' }))).toEqual([]);
  });

  it('si hay avisos esperando y el envío no está configurado, lo dice como un problema', () => {
    const [advertencia] = advertenciasDeEnvio(informe({ pendientes: 3, envioConfigurado: false }));
    expect(advertencia.variante).toBe('danger');
    expect(advertencia.texto).toContain('no está configurado');
    expect(advertencia.texto).toContain('ni siquiera se intentan');
  });

  it('si no hay avisos esperando, el envío sin configurar no es noticia', () => {
    expect(advertenciasDeEnvio(informe({ pendientes: 0, envioConfigurado: false }))).toEqual([]);
  });

  it('si el despacho automático está apagado y hay avisos en cola, lo dice', () => {
    const [advertencia] = advertenciasDeEnvio(informe({ pendientes: 2, despachoAutomatico: false }));
    expect(advertencia).toMatchObject({ variante: 'warning' });
    expect(advertencia.texto).toContain('despacho automático está apagado');
  });

  it('en modo simulado avisa que no sale ningún correo real', () => {
    const [advertencia] = advertenciasDeEnvio(informe({ modoCorreo: 'SIMULADO' }));
    expect(advertencia).toMatchObject({ variante: 'info' });
    expect(advertencia.texto).toContain('no sale ningún correo real');
  });

  it('con los avisos deshabilitados no agrega nada: ya hay un aviso propio para eso', () => {
    expect(advertenciasDeEnvio(informe({ habilitadas: false, pendientes: 3, envioConfigurado: false }))).toEqual([]);
  });

  it('un servidor anterior que no manda estos datos no provoca advertencias falsas', () => {
    expect(advertenciasDeEnvio(informe({ pendientes: 3 }))).toEqual([]);
  });

  it('pueden juntarse varias a la vez', () => {
    const advertencias = advertenciasDeEnvio(informe({ pendientes: 3, envioConfigurado: false, despachoAutomatico: false }));
    expect(advertencias.map((a) => a.variante)).toEqual(['danger', 'warning']);
  });
});

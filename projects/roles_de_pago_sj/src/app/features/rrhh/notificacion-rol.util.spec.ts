import type { NotificacionRolResponse } from '@models';
import { describirNotificacion, grupoDeNotificacion } from './notificacion-rol.util';

const aviso = (cambios: Partial<NotificacionRolResponse> = {}): NotificacionRolResponse => ({
  estado: 'PENDIENTE',
  intentos: 0,
  enviadaEn: null,
  proximoIntento: null,
  ultimoError: null,
  ...cambios,
});

describe('describirNotificacion', () => {
  it('sin aviso y sin publicar: sin notificar, y se avisará al publicar', () => {
    expect(describirNotificacion(null, false)).toEqual({ etiqueta: 'Sin notificar', variante: 'neutral', detalle: 'Se avisará al publicar', reenviable: true });
    expect(describirNotificacion(undefined, false).etiqueta).toBe('Sin notificar');
  });

  it('sin aviso con el período ya publicado: lo dice, porque debería haberlo', () => {
    expect(describirNotificacion(null, true)).toEqual({ etiqueta: 'Sin notificar', variante: 'neutral', detalle: 'No se generó el aviso', reenviable: true });
  });

  it('un aviso enviado es "Notificado", con la fecha en que salió', () => {
    expect(describirNotificacion(aviso({ estado: 'ENVIADA', intentos: 1, enviadaEn: '2026-10-27T10:15:30' }), true)).toEqual({
      etiqueta: 'Notificado',
      variante: 'success',
      detalle: 'Enviado el 27/10/2026 10:15',
      reenviable: true,
    });
  });

  it('un aviso en cola que todavía no se intentó es "Pendiente"', () => {
    expect(describirNotificacion(aviso(), true)).toEqual({ etiqueta: 'Pendiente', variante: 'info', detalle: 'En cola de envío', reenviable: false });
  });

  it('un aviso que ya falló una vez pero se va a reintentar es "Reintentando", con el motivo y la hora del próximo intento', () => {
    const descripcion = describirNotificacion(
      aviso({ intentos: 2, ultimoError: 'La API de correo no respondió a tiempo', proximoIntento: '2026-10-27T10:20:00' }),
      true,
    );
    expect(descripcion.etiqueta).toBe('Reintentando');
    expect(descripcion.variante).toBe('warning');
    expect(descripcion.detalle).toBe('Intento 2 fallido (La API de correo no respondió a tiempo); próximo: 27/10/2026 10:20');
  });

  it('un aviso fallido es "Error de envío", con el motivo y cuántos intentos se hicieron', () => {
    const descripcion = describirNotificacion(aviso({ estado: 'FALLIDA', intentos: 5, ultimoError: 'La API de correo rechazó las credenciales (HTTP 401)' }), true);
    expect(descripcion).toEqual({
      etiqueta: 'Error de envío',
      variante: 'danger',
      detalle: 'La API de correo rechazó las credenciales (HTTP 401) (5 intentos)',
      reenviable: true,
    });
  });

  it('un fallo definitivo al primer intento no agrega "(1 intentos)" y sin motivo lo dice', () => {
    expect(describirNotificacion(aviso({ estado: 'FALLIDA', intentos: 1, ultimoError: 'Fallo simulado (definitivo)' }), true).detalle).toBe('Fallo simulado (definitivo)');
    expect(describirNotificacion(aviso({ estado: 'FALLIDA', intentos: 1 }), true).detalle).toBe('sin detalle');
  });

  it('una persona sin cuenta con correo es "Sin correo", no un error del sistema', () => {
    expect(describirNotificacion(aviso({ estado: 'OMITIDA' }), true)).toEqual({
      etiqueta: 'Sin correo',
      variante: 'warning',
      detalle: 'No tiene una cuenta activa con correo',
      reenviable: true,
    });
  });

  it('un estado desconocido del servidor se muestra tal cual y no rompe la tabla', () => {
    expect(describirNotificacion(aviso({ estado: 'NUEVO_ESTADO' as never }), true)).toEqual({ etiqueta: 'NUEVO_ESTADO', variante: 'neutral', detalle: '', reenviable: false });
  });

  it('un aviso reenviado a mano muestra "Reenviado" con la fecha y la hora del reenvío', () => {
    const descripcion = describirNotificacion(
      aviso({ estado: 'ENVIADA', intentos: 1, enviadaEn: '2026-10-27T10:15:00', reenviadaEn: '2026-10-28T09:24:30', reenvios: 1 }),
      true,
    );
    expect(descripcion).toEqual({ etiqueta: 'Notificado', variante: 'success', detalle: 'Reenviado el 28/10/2026 09:24', reenviable: true });
  });

  it('con varios reenvíos dice cuántos fueron', () => {
    const descripcion = describirNotificacion(aviso({ estado: 'ENVIADA', enviadaEn: '2026-10-27T10:15:00', reenviadaEn: '2026-10-28T09:24:30', reenvios: 3 }), true);
    expect(descripcion.detalle).toBe('Reenviado el 28/10/2026 09:24 · 3 reenvíos');
  });

  it('un reenvío que falló dice que falló el reenvío, con su fecha y su motivo', () => {
    const descripcion = describirNotificacion(
      aviso({ estado: 'FALLIDA', intentos: 1, ultimoError: 'La API de correo no respondió a tiempo', reenviadaEn: '2026-10-28T09:24:30', reenvios: 1 }),
      true,
    );
    expect(descripcion).toEqual({
      etiqueta: 'Error de envío',
      variante: 'danger',
      detalle: 'Falló el reenvío del 28/10/2026 09:24: La API de correo no respondió a tiempo',
      reenviable: true,
    });
  });

  it('un aviso que sigue en cola o reintentando todavía no se puede reenviar', () => {
    expect(describirNotificacion(aviso({ intentos: 0 }), true).reenviable).toBe(false);
    expect(describirNotificacion(aviso({ intentos: 2, ultimoError: 'x', proximoIntento: '2026-10-28T10:00:00' }), true).reenviable).toBe(false);
  });

  it('un aviso enviado, fallido, omitido o inexistente sí se puede reenviar', () => {
    expect(describirNotificacion(aviso({ estado: 'ENVIADA' }), true).reenviable).toBe(true);
    expect(describirNotificacion(aviso({ estado: 'FALLIDA' }), true).reenviable).toBe(true);
    expect(describirNotificacion(aviso({ estado: 'OMITIDA' }), true).reenviable).toBe(true);
    expect(describirNotificacion(null, true).reenviable).toBe(true);
  });
});

describe('grupoDeNotificacion', () => {
  it('clasifica cada estado del aviso en uno de cuatro grupos', () => {
    const con = (estado: NotificacionRolResponse['estado']) => grupoDeNotificacion({ estado, intentos: 0, enviadaEn: null, proximoIntento: null, ultimoError: null });
    expect(con('ENVIADA')).toBe('NOTIFICADO');
    expect(con('PENDIENTE')).toBe('EN_COLA');
    expect(con('FALLIDA')).toBe('PROBLEMA');
    expect(con('OMITIDA')).toBe('PROBLEMA');
  });

  it('un rol sin aviso, o con un estado desconocido, queda sin notificar', () => {
    expect(grupoDeNotificacion(null)).toBe('SIN_AVISO');
    expect(grupoDeNotificacion(undefined)).toBe('SIN_AVISO');
    expect(grupoDeNotificacion({ estado: 'NUEVO' as never, intentos: 0, enviadaEn: null, proximoIntento: null, ultimoError: null })).toBe('SIN_AVISO');
  });
});

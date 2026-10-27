import type { NotificacionRolResponse } from '@models';
import { describirNotificacion } from './notificacion-rol.util';

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
    expect(describirNotificacion(null, false)).toEqual({ etiqueta: 'Sin notificar', variante: 'neutral', detalle: 'Se avisará al publicar' });
    expect(describirNotificacion(undefined, false).etiqueta).toBe('Sin notificar');
  });

  it('sin aviso con el período ya publicado: lo dice, porque debería haberlo', () => {
    expect(describirNotificacion(null, true)).toEqual({ etiqueta: 'Sin notificar', variante: 'neutral', detalle: 'No se generó el aviso' });
  });

  it('un aviso enviado es "Notificado", con la fecha en que salió', () => {
    expect(describirNotificacion(aviso({ estado: 'ENVIADA', intentos: 1, enviadaEn: '2026-10-27T10:15:30' }), true)).toEqual({
      etiqueta: 'Notificado',
      variante: 'success',
      detalle: 'Enviado el 27/10/2026 10:15',
    });
  });

  it('un aviso en cola que todavía no se intentó es "Pendiente"', () => {
    expect(describirNotificacion(aviso(), true)).toEqual({ etiqueta: 'Pendiente', variante: 'info', detalle: 'En cola de envío' });
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
    });
  });

  it('un estado desconocido del servidor se muestra tal cual y no rompe la tabla', () => {
    expect(describirNotificacion(aviso({ estado: 'NUEVO_ESTADO' as never }), true)).toEqual({ etiqueta: 'NUEVO_ESTADO', variante: 'neutral', detalle: '' });
  });
});

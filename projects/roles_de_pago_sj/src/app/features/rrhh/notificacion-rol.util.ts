import { formatearFechaHora } from '@core/utils';
import type { NotificacionRolResponse } from '@models';
import type { VarianteNotificacion } from './rrhh.model';

export interface DescripcionNotificacion {
  etiqueta: string;
  variante: VarianteNotificacion;
  detalle: string;
}

export function describirNotificacion(
  notificacion: NotificacionRolResponse | null | undefined,
  publicado: boolean,
): DescripcionNotificacion {
  if (!notificacion) {
    return {
      etiqueta: 'Sin notificar',
      variante: 'neutral',
      detalle: publicado ? 'No se generó el aviso' : 'Se avisará al publicar',
    };
  }
  const motivo = notificacion.ultimoError ?? 'sin detalle';
  switch (notificacion.estado) {
    case 'ENVIADA':
      return { etiqueta: 'Notificado', variante: 'success', detalle: `Enviado el ${formatearFechaHora(notificacion.enviadaEn)}` };
    case 'PENDIENTE':
      return notificacion.intentos > 0
        ? {
            etiqueta: 'Reintentando',
            variante: 'warning',
            detalle: `Intento ${notificacion.intentos} fallido (${motivo}); próximo: ${formatearFechaHora(notificacion.proximoIntento)}`,
          }
        : { etiqueta: 'Pendiente', variante: 'info', detalle: 'En cola de envío' };
    case 'FALLIDA':
      return { etiqueta: 'Error de envío', variante: 'danger', detalle: `${motivo}${notificacion.intentos > 1 ? ` (${notificacion.intentos} intentos)` : ''}` };
    case 'OMITIDA':
      return { etiqueta: 'Sin correo', variante: 'warning', detalle: notificacion.ultimoError ?? 'No tiene una cuenta activa con correo' };
    default:
      return { etiqueta: String(notificacion.estado), variante: 'neutral', detalle: '' };
  }
}

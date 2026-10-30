import { formatearFechaHora } from '@core/utils';
import type { NotificacionRolResponse } from '@models';
import type { GrupoNotificacion, VarianteNotificacion } from './rrhh.model';

export interface DescripcionNotificacion {
  etiqueta: string;
  variante: VarianteNotificacion;
  detalle: string;
  reenviable: boolean;
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
      reenviable: true,
    };
  }
  const motivo = notificacion.ultimoError ?? 'sin detalle';
  switch (notificacion.estado) {
    case 'ENVIADA':
      return {
        etiqueta: 'Notificado',
        variante: 'success',
        detalle: notificacion.reenviadaEn ? detalleDeReenvio(notificacion) : `Enviado el ${formatearFechaHora(notificacion.enviadaEn)}`,
        reenviable: true,
      };
    case 'PENDIENTE':
      return notificacion.intentos > 0
        ? {
            etiqueta: 'Reintentando',
            variante: 'warning',
            detalle: `Intento ${notificacion.intentos} fallido (${motivo}); próximo: ${formatearFechaHora(notificacion.proximoIntento)}`,
            reenviable: false,
          }
        : { etiqueta: 'Pendiente', variante: 'info', detalle: 'En cola de envío', reenviable: false };
    case 'FALLIDA':
      return {
        etiqueta: 'Error de envío',
        variante: 'danger',
        detalle: notificacion.reenviadaEn
          ? `Falló el reenvío del ${formatearFechaHora(notificacion.reenviadaEn)}: ${motivo}`
          : `${motivo}${notificacion.intentos > 1 ? ` (${notificacion.intentos} intentos)` : ''}`,
        reenviable: true,
      };
    case 'OMITIDA':
      return {
        etiqueta: 'Sin correo',
        variante: 'warning',
        detalle: notificacion.ultimoError ?? 'No tiene una cuenta activa con correo',
        reenviable: true,
      };
    default:
      return { etiqueta: String(notificacion.estado), variante: 'neutral', detalle: '', reenviable: false };
  }
}

function detalleDeReenvio(notificacion: NotificacionRolResponse): string {
  const veces = (notificacion.reenvios ?? 0) > 1 ? ` · ${notificacion.reenvios} reenvíos` : '';
  return `Reenviado el ${formatearFechaHora(notificacion.reenviadaEn ?? null)}${veces}`;
}

export function grupoDeNotificacion(notificacion: NotificacionRolResponse | null | undefined): GrupoNotificacion {
  switch (notificacion?.estado) {
    case 'ENVIADA':
      return 'NOTIFICADO';
    case 'PENDIENTE':
      return 'EN_COLA';
    case 'FALLIDA':
    case 'OMITIDA':
      return 'PROBLEMA';
    default:
      return 'SIN_AVISO';
  }
}

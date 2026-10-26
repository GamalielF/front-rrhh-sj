import type { InformeNotificacionesResponse, ProblemaNotificacionResponse } from '@models';
import type { ProblemaFila } from './notificaciones-periodo.model';

export function aFilasProblemas(problemas: ProblemaNotificacionResponse[]): ProblemaFila[] {
  return problemas.map((problema) => ({
    nombre: problema.nombre,
    estado: problema.estado,
    estadoEtiqueta: problema.estado === 'FALLIDA' ? 'Fallido' : 'Omitido',
    intentos: problema.intentos,
    detalle: problema.error ?? (problema.estado === 'OMITIDA' ? 'Sin cuenta activa con correo' : '—'),
  }));
}

export function hayEnviosPendientes(informe: InformeNotificacionesResponse): boolean {
  return informe.habilitadas && informe.pendientes > 0;
}

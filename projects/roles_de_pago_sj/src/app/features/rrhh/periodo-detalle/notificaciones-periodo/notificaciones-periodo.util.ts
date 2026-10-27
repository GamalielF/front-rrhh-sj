import type { InformeNotificacionesResponse, ProblemaNotificacionResponse } from '@models';
import type { AdvertenciaEnvio, ProblemaFila } from './notificaciones-periodo.model';

export function aFilasProblemas(problemas: ProblemaNotificacionResponse[]): ProblemaFila[] {
  return problemas.map((problema) => ({
    nombre: problema.nombre,
    estado: problema.estado,
    estadoEtiqueta: problema.estado === 'FALLIDA' ? 'Fallido' : 'Omitido',
    intentos: problema.intentos,
    detalle: problema.error ?? (problema.estado === 'OMITIDA' ? 'Sin cuenta activa con correo' : '—'),
  }));
}

export function advertenciasDeEnvio(informe: InformeNotificacionesResponse): AdvertenciaEnvio[] {
  if (!informe.habilitadas) {
    return [];
  }
  const advertencias: AdvertenciaEnvio[] = [];
  if (informe.pendientes > 0 && informe.envioConfigurado === false) {
    advertencias.push({
      variante: 'danger',
      texto:
        'El envío de correo no está configurado en el servidor (falta la dirección de la API de correo), por eso los avisos esperan y ni siquiera se intentan enviar. ' +
        'Corrija la configuración y reinicie el backend.',
    });
  }
  if (informe.pendientes > 0 && informe.despachoAutomatico === false) {
    advertencias.push({ variante: 'warning', texto: 'El despacho automático está apagado: los avisos se ponen en cola pero no salen solos.' });
  }
  if (informe.total > 0 && informe.modoCorreo === 'SIMULADO') {
    advertencias.push({
      variante: 'info',
      texto: 'El servidor está en modo simulado: los avisos figuran como enviados, pero no sale ningún correo real.',
    });
  }
  return advertencias;
}

export function firmaDe(informe: InformeNotificacionesResponse): string {
  return [informe.total, informe.enviadas, informe.pendientes, informe.reintentando, informe.fallidas, informe.omitidas].join('|');
}

export function hayEnviosPendientes(informe: InformeNotificacionesResponse): boolean {
  return informe.habilitadas && informe.pendientes > 0;
}

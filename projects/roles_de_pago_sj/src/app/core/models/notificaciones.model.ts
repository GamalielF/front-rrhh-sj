import type { EstadoNotificacion, Periodo } from './comunes.model';
import type { NotificacionRolResponse } from './rrhh.model';

export interface ProblemaNotificacionResponse {
  nombre: string;
  estado: EstadoNotificacion;
  intentos: number;
  error: string | null;
}

export interface InformeNotificacionesResponse {
  periodo: Periodo;
  habilitadas: boolean;
  total: number;
  pendientes: number;
  reintentando: number;
  enviadas: number;
  fallidas: number;
  omitidas: number;
  problemas: ProblemaNotificacionResponse[];
  despachoAutomatico?: boolean;
  envioConfigurado?: boolean;
  modoCorreo?: 'API' | 'SIMULADO';
}

export interface ResultadoEncoladoResponse {
  creadas: number;
  pendientes: number;
  omitidas: number;
  yaExistentes: number;
}

export interface ResultadoReintentoResponse {
  reintentadas: number;
}

export interface ResultadoReenvioResponse {
  aceptado: boolean;
  mensaje: string;
  notificacion: NotificacionRolResponse | null;
}

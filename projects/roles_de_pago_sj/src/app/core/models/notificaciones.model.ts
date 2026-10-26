import type { EstadoNotificacion, Periodo } from './comunes.model';

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

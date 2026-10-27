import type { EstadoCarga, EstadoNotificacion, EstadoPeriodo, EstadoRegistro, FechaHora, Periodo } from './comunes.model';

export interface PeriodoResumenResponse {
  periodo: Periodo;
  estado: EstadoPeriodo;
  fechaPublicacion: FechaHora | null;
  publicadoPor: string | null;
  rolesActivos: number;
}

export interface NotificacionRolResponse {
  estado: EstadoNotificacion;
  intentos: number;
  enviadaEn: FechaHora | null;
  proximoIntento: FechaHora | null;
  ultimoError: string | null;
}

export interface RolPagoResumenResponse {
  id: number;
  cedula: string;
  nombre: string | null;
  estado: EstadoRegistro;
  tamanoBytes: number;
  actualizadoEn: FechaHora;
  actualizadoPor: string | null;
  notificacion?: NotificacionRolResponse | null;
}

export interface ListadoPeriodoResponse {
  periodo: Periodo;
  estadoPeriodo: EstadoPeriodo;
  activos: number;
  inactivos: number;
  roles: RolPagoResumenResponse[];
}

export interface ResultadoArchivoResponse {
  archivo: string;
  estado: EstadoCarga;
  mensaje: string | null;
}

export interface ResultadoCargaResponse {
  periodo: Periodo;
  total: number;
  cargados: number;
  reemplazados: number;
  sinCambios: number;
  rechazados: number;
  resultados: ResultadoArchivoResponse[];
}

export interface ResumenPeriodoResponse {
  periodo: Periodo;
  estadoPeriodo: EstadoPeriodo;
  rolesActivos: number;
  rolesInactivos: number;
  personasActivas: number;
  sinRol: number;
  nombresSinRol: string[];
  rolesSinPersonaActiva: number;
  nombresRolesSinPersona: string[];
}

export interface PublicarPeriodoRequest {
  /** Obligatorio en true cuando el cuadre tiene diferencias (personas sin rol o roles sin persona activa). */
  confirmarFaltantes?: boolean;
}

export interface PublicacionResponse {
  periodo: Periodo;
  estadoPeriodo: EstadoPeriodo;
  fechaPublicacion: FechaHora | null;
  publicadoPor: string | null;
  rolesPublicados: number;
  sinRol: number;
  rolesSinPersonaActiva: number;
  avisosEncolados: number;
}

export interface MotivoConsultaRequest {
  /** Entre 10 y 200 caracteres. */
  motivo: string;
}

export interface CoberturaPeriodoResponse {
  periodo: Periodo;
  rolesPublicados: number;
  leidos: number;
  pendientes: number;
  nombresPendientes: string[];
}

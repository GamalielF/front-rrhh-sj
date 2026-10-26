import type { EstadoRegistro, FechaHora, NombreRol, ResultadoSincronizacion } from './comunes.model';

export interface RolAsignadoResponse {
  rol: NombreRol;
  origen: string;
  verRolesAjenos: boolean;
}

export interface UsuarioAdminResponse {
  username: string;
  nombre: string | null;
  cargo: string | null;
  estadoDirectorio: string | null;
  roles: RolAsignadoResponse[];
}

export interface OtorgarRolRequest {
  /** Solo aplica a RRHH. Si no se envía vale true; volver a otorgar con otro valor lo actualiza. */
  verRolesAjenos?: boolean;
}

export interface BusquedaDirectorioRequest {
  /** 10 dígitos. */
  cedula: string;
}

export interface PerfilDirectorioResponse {
  username: string;
  nombreCompleto: string | null;
  cargo: string | null;
  email: string | null;
  estado: EstadoRegistro | string;
  cedula: string | null;
}

export interface EstadoDirectorioResponse {
  activos: number;
  inactivos: number;
  ultimaSincronizacion: FechaHora | null;
  resultadoUltima: ResultadoSincronizacion | null;
  mensajeUltima: string | null;
}

export interface ResultadoSincronizacionResponse {
  recibidos: number;
  creados: number;
  actualizados: number;
  sinCambios: number;
  inactivados: number;
  omitidos: number;
  cedulasConDigitoInvalido: number;
  inicio: FechaHora;
  fin: FechaHora;
}

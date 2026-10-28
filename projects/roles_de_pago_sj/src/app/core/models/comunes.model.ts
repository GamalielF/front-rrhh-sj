/** Período en formato yyyy-MM (por ejemplo 2026-09). */
export type Periodo = string;

/** Fecha en formato yyyy-MM-dd. */
export type Fecha = string;

/** Fecha y hora ISO-8601 sin zona, en hora de Ecuador (por ejemplo 2026-10-22T16:53:39). */
export type FechaHora = string;

export type NombreRol = 'ADMIN' | 'RRHH' | 'EMPLEADO';
export type NombrePermiso = 'VER_ROLES_AJENOS';
export type EstadoRegistro = 'ACTIVO' | 'INACTIVO';
export type EstadoPeriodo = 'CARGADO' | 'PUBLICADO';
export type EstadoCarga = 'CARGADO' | 'REEMPLAZADO' | 'SIN_CAMBIOS' | 'RECHAZADO';
export type EstadoNotificacion = 'PENDIENTE' | 'ENVIADA' | 'FALLIDA' | 'OMITIDA';
export type ResultadoAcceso = 'PERMITIDO' | 'DENEGADO';
export type TipoAcceso = 'CONSULTA_PROPIA' | 'CONSULTA_AJENA';
export type ResultadoSincronizacion = 'EXITOSA' | 'FALLIDA';

export type DetalleAcceso =
  | 'OK'
  | 'CEDULA_NO_COINCIDE'
  | 'SIN_CEDULA_EN_DIRECTORIO'
  | 'ROL_NO_ENCONTRADO'
  | 'ARCHIVO_NO_DISPONIBLE'
  | 'SIN_PERMISO'
  | 'BLOQUEADO_POR_INTENTOS';

export type TipoAccion =
  | 'CARGA_LOTE'
  | 'ROL_REEMPLAZADO'
  | 'ROL_INACTIVADO'
  | 'ROL_ACTIVADO'
  | 'PERIODO_PUBLICADO'
  | 'REPORTE_EXPORTADO'
  | 'NOTIFICACIONES_GENERADAS'
  | 'NOTIFICACIONES_REINTENTADAS'
  | 'NOTIFICACION_REENVIADA'
  | 'USUARIO_ROL_OTORGADO'
  | 'USUARIO_ROL_REVOCADO';

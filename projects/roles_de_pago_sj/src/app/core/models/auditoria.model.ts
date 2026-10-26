import type {
  DetalleAcceso,
  Fecha,
  FechaHora,
  Periodo,
  ResultadoAcceso,
  TipoAccion,
  TipoAcceso,
} from './comunes.model';

export interface AccesoAuditoriaResponse {
  id: number;
  fecha: FechaHora;
  usuario: string;
  tipoAcceso: TipoAcceso;
  resultado: ResultadoAcceso;
  detalle: DetalleAcceso;
  cedulaEnmascarada: string | null;
  periodo: Periodo | null;
  motivo: string | null;
  ip: string | null;
}

export interface AccionAuditoriaResponse {
  id: number;
  fecha: FechaHora;
  usuario: string;
  tipoAccion: TipoAccion;
  periodo: Periodo | null;
  rolPagoId: number | null;
  detalle: string | null;
  ip: string | null;
}

export interface DenegadosPorUsuarioResponse {
  usuario: string;
  intentos: number;
  cedulasDistintas: number;
  ultimoIntento: FechaHora;
}

/** La exportación llega como CSV en base64. truncado = true si hubo más filas que el límite. */
export interface ArchivoDescargaResponse {
  nombreArchivo: string;
  tipoContenido: string;
  filas: number;
  truncado: boolean;
  contenidoBase64: string;
}

export interface FiltrosAccesos {
  desde?: Fecha;
  hasta?: Fecha;
  usuario?: string;
  resultado?: ResultadoAcceso;
  tipo?: TipoAcceso;
  periodo?: Periodo;
}

export interface FiltrosAcciones {
  desde?: Fecha;
  hasta?: Fecha;
  usuario?: string;
  tipo?: TipoAccion;
  periodo?: Periodo;
}

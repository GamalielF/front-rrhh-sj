import type { Periodo } from './comunes.model';

export interface ConsultaRolPagoRequest {
  /** 10 dígitos; debe ser la cédula de la persona con sesión. */
  cedula: string;
  /** Si se omite, se entrega el rol publicado más reciente. */
  periodo?: Periodo;
}

/** El PDF viaja en base64: conviértalo a Blob para verlo y no lo guarde. */
export interface RolPagoPdfResponse {
  periodo: Periodo;
  nombreArchivo: string;
  tipoContenido: string;
  tamanoBytes: number;
  contenidoBase64: string;
}

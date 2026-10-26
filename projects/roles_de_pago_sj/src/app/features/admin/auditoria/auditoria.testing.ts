import type { AccesoAuditoriaResponse, AccionAuditoriaResponse } from '@models';
import { FILTROS_VACIOS, FiltrosAuditoria } from './auditoria.model';

export const filtros = (cambios: Partial<FiltrosAuditoria> = {}): FiltrosAuditoria => ({ ...FILTROS_VACIOS, ...cambios });

export const acceso = (cambios: Partial<AccesoAuditoriaResponse> = {}): AccesoAuditoriaResponse => ({
  id: 1,
  fecha: '2026-10-26T09:15:30.123456',
  usuario: 'jperez',
  tipoAcceso: 'CONSULTA_PROPIA',
  resultado: 'PERMITIDO',
  detalle: 'OK',
  cedulaEnmascarada: '17******75',
  periodo: '2026-09',
  motivo: null,
  ip: '10.0.0.5',
  ...cambios,
});

export const accion = (cambios: Partial<AccionAuditoriaResponse> = {}): AccionAuditoriaResponse => ({
  id: 1,
  fecha: '2026-10-26T11:00:00',
  usuario: 'fsepa',
  tipoAccion: 'PERIODO_PUBLICADO',
  periodo: '2026-10',
  rolPagoId: null,
  detalle: 'roles=120',
  ip: '10.0.0.9',
  ...cambios,
});

export const pagina = <T>(elementos: T[], total = elementos.length) => ({
  elementos,
  pagina: 0,
  tamano: 20,
  totalElementos: total,
  totalPaginas: 1,
});

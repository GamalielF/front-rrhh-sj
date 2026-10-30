import type { NotificacionRolResponse, RolPagoResumenResponse } from '@models';

const base = { intentos: 1, enviadaEn: '2026-10-27T10:15:00', proximoIntento: null, ultimoError: null, reenviadaEn: null, reenvios: 0 };

export const enviada: NotificacionRolResponse = { ...base, estado: 'ENVIADA' };
export const fallida: NotificacionRolResponse = {
  ...base,
  estado: 'FALLIDA',
  enviadaEn: null,
  ultimoError: 'La API de correo no respondió a tiempo',
};
export const pendiente: NotificacionRolResponse = { ...base, estado: 'PENDIENTE', intentos: 0, enviadaEn: null };

export const rol = (id: number, nombre: string, notificacion: NotificacionRolResponse | null = enviada): RolPagoResumenResponse => ({
  id,
  cedula: `17123${String(id).padStart(5, '0')}`,
  nombre,
  estado: 'ACTIVO',
  tamanoBytes: 2048,
  actualizadoEn: '2026-10-22T16:53:39',
  actualizadoPor: 'fsepa',
  notificacion,
});

export const muchos = (cantidad: number): RolPagoResumenResponse[] =>
  Array.from({ length: cantidad }, (_, i) => rol(i + 1, `PERSONA ${String(i + 1).padStart(3, '0')}`));

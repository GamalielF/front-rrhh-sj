import type { ResultadoReenvioResponse } from '@models';
import type { RolFila } from '../../rrhh.model';

export const filaPerez: RolFila = {
  id: 7,
  cedula: '1712345675',
  nombre: 'PEREZ JUAN',
  estado: 'ACTIVO',
  estadoEtiqueta: 'Activo',
  notificacion: 'Notificado',
  notificacionVariante: 'success',
  notificacionDetalle: 'Enviado el 27/10/2026 10:15',
  reenviable: true,
  tamano: '2 KB',
  actualizadoEn: '27/10/2026 10:15',
};

export const aceptado: ResultadoReenvioResponse = {
  aceptado: true,
  mensaje: 'La API de correo aceptó el reenvío',
  notificacion: { estado: 'ENVIADA', intentos: 1, enviadaEn: '2026-10-27T10:15:00', proximoIntento: null, ultimoError: null, reenviadaEn: '2026-10-28T09:24:30', reenvios: 1 },
};

export const rechazado: ResultadoReenvioResponse = {
  aceptado: false,
  mensaje: 'La API de correo no respondió a tiempo',
  notificacion: { estado: 'FALLIDA', intentos: 1, enviadaEn: null, proximoIntento: null, ultimoError: 'La API de correo no respondió a tiempo', reenviadaEn: '2026-10-28T09:24:30', reenvios: 1 },
};

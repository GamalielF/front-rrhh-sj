import { HttpErrorResponse } from '@angular/common/http';
import { ValidatorFn } from '@angular/forms';
import type { UserSession } from '@lumen/auth';
import type { ApiResponse } from '../../core/models';
import { CEDULA_DE_10_DIGITOS, MENSAJE_GENERICO, MENSAJES_POR_ESTADO } from './mi-rol-pago.model';

export function formatearPeriodo(periodo: string): string {
  const [anio, mes] = periodo.split('-').map(Number);
  if (!anio || !mes) {
    return periodo;
  }
  const texto = new Intl.DateTimeFormat('es-EC', { month: 'long', year: 'numeric', timeZone: 'UTC' })
    .format(new Date(Date.UTC(anio, mes - 1, 1)))
    .replace(' de ', ' ');
  return texto.charAt(0).toUpperCase() + texto.slice(1);
}

export function cedulaDeSesion(usuario: UserSession | null): string | null {
  const identificacion = String(usuario?.id ?? '').trim();
  return CEDULA_DE_10_DIGITOS.test(identificacion) ? identificacion : null;
}

export function mascararCedula(cedula: string): string {
  return `${cedula.slice(0, 2)}******${cedula.slice(-2)}`;
}

export function cedulaCoincideConSesion(cedulaSesion: string | null): ValidatorFn {
  return (control) => {
    const cedula = String(control.value ?? '');
    if (!cedulaSesion || !CEDULA_DE_10_DIGITOS.test(cedula)) {
      return null;
    }
    return cedula === cedulaSesion ? null : { cedulaNoCoincide: true };
  };
}

export function estadoHttp(error: unknown): number | null {
  return error instanceof HttpErrorResponse ? error.status : null;
}

export function mensajeDeError(error: unknown): string {
  if (!(error instanceof HttpErrorResponse)) {
    return MENSAJE_GENERICO;
  }
  const cuerpo = esApiResponse(error.error) ? error.error : null;
  return cuerpo?.errors?.join(' ') || cuerpo?.message || MENSAJES_POR_ESTADO[error.status] || MENSAJE_GENERICO;
}

function esApiResponse(valor: unknown): valor is Partial<ApiResponse<unknown>> {
  return typeof valor === 'object' && valor !== null && 'message' in valor;
}

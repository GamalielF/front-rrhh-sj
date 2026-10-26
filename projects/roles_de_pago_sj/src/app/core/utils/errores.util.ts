import { HttpErrorResponse } from '@angular/common/http';
import { Observable, OperatorFunction, catchError, of, throwError } from 'rxjs';
import type { ApiResponse } from '../models';
import { MENSAJE_GENERICO, MENSAJES_POR_ESTADO } from './errores.model';

export function estadoHttp(error: unknown): number | null {
  return error instanceof HttpErrorResponse ? error.status : null;
}

export function mensajeDeError(error: unknown, mensajesPorEstado: Record<number, string> = {}): string {
  if (!(error instanceof HttpErrorResponse)) {
    return MENSAJE_GENERICO;
  }
  const cuerpo = esApiResponse(error.error) ? error.error : null;
  return (
    cuerpo?.errors?.join(' ') ||
    cuerpo?.message ||
    mensajesPorEstado[error.status] ||
    MENSAJES_POR_ESTADO[error.status] ||
    MENSAJE_GENERICO
  );
}

export function ignorarNoEncontrado<T>(): OperatorFunction<T, T | null> {
  return (origen: Observable<T>) =>
    origen.pipe(catchError((error: unknown) => (estadoHttp(error) === 404 ? of(null) : throwError(() => error))));
}

function esApiResponse(valor: unknown): valor is Partial<ApiResponse<unknown>> {
  return typeof valor === 'object' && valor !== null && 'message' in valor;
}

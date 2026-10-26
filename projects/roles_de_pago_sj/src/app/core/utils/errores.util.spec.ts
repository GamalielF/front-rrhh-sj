import { HttpErrorResponse } from '@angular/common/http';
import { firstValueFrom, of, throwError } from 'rxjs';
import { MENSAJE_GENERICO, MENSAJES_POR_ESTADO } from './errores.model';
import { estadoHttp, ignorarNoEncontrado, mensajeDeError } from './errores.util';

const error = (status: number, cuerpo: unknown) => new HttpErrorResponse({ status, error: cuerpo });

describe('mensajeDeError', () => {
  it('usa el mensaje que envía el servidor', () => {
    expect(mensajeDeError(error(403, { message: 'La cédula no corresponde a su cuenta' }))).toBe(
      'La cédula no corresponde a su cuenta',
    );
  });

  it('si hay errores de validación los junta', () => {
    expect(mensajeDeError(error(400, { message: 'Validación fallida', errors: ['A', 'B'] }))).toBe('A B');
  });

  it('sin cuerpo útil usa el texto del estado, y la pantalla puede afinarlo', () => {
    expect(mensajeDeError(error(429, null))).toBe(MENSAJES_POR_ESTADO[429]);
    expect(mensajeDeError(error(404, null), { 404: 'Sin rol publicado' })).toBe('Sin rol publicado');
    expect(mensajeDeError(error(0, new ProgressEvent('error')))).toBe(MENSAJES_POR_ESTADO[0]);
  });

  it('cualquier otra cosa recibe el mensaje genérico', () => {
    expect(mensajeDeError(error(500, null))).toBe(MENSAJE_GENERICO);
    expect(mensajeDeError(new Error('x'))).toBe(MENSAJE_GENERICO);
  });
});

describe('estadoHttp', () => {
  it('devuelve el código de una respuesta HTTP y null para lo demás', () => {
    expect(estadoHttp(new HttpErrorResponse({ status: 429 }))).toBe(429);
    expect(estadoHttp(new Error('x'))).toBeNull();
  });
});

describe('ignorarNoEncontrado', () => {
  it('convierte un 404 en null y deja pasar los valores', async () => {
    expect(await firstValueFrom(of(5).pipe(ignorarNoEncontrado()))).toBe(5);
    expect(await firstValueFrom(throwError(() => error(404, null)).pipe(ignorarNoEncontrado()))).toBeNull();
  });

  it('cualquier otro error sigue siendo un error', async () => {
    await expect(firstValueFrom(throwError(() => error(500, null)).pipe(ignorarNoEncontrado()))).rejects.toBeTruthy();
  });
});

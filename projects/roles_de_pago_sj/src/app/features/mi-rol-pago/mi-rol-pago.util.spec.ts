import { HttpErrorResponse } from '@angular/common/http';
import { FormControl } from '@angular/forms';
import {
  cedulaCoincideConSesion,
  cedulaDeSesion,
  estadoHttp,
  formatearPeriodo,
  mascararCedula,
  mensajeDeError,
} from './mi-rol-pago.util';
import { MENSAJE_GENERICO, MENSAJES_POR_ESTADO } from './mi-rol-pago.model';

describe('formatearPeriodo', () => {
  it('escribe el mes en español con mayúscula inicial y sin "de"', () => {
    expect(formatearPeriodo('2026-09')).toBe('Septiembre 2026');
    expect(formatearPeriodo('2026-01')).toBe('Enero 2026');
  });

  it('devuelve el texto tal cual si no es un período', () => {
    expect(formatearPeriodo('abc')).toBe('abc');
  });
});

describe('cedulaDeSesion', () => {
  it('toma la identificación de la sesión cuando es una cédula de 10 dígitos', () => {
    expect(cedulaDeSesion({ username: 'jperez', id: '1712345675' })).toBe('1712345675');
    expect(cedulaDeSesion({ username: 'jperez', id: 1712345675 })).toBe('1712345675');
  });

  it('si la sesión no trae una cédula utilizable, devuelve null', () => {
    expect(cedulaDeSesion(null)).toBeNull();
    expect(cedulaDeSesion({ username: 'jperez' })).toBeNull();
    expect(cedulaDeSesion({ username: 'jperez', id: 'jperez' })).toBeNull();
    expect(cedulaDeSesion({ username: 'jperez', id: 'DEFAULT_ID' })).toBeNull();
  });
});

describe('mascararCedula', () => {
  it('deja visibles solo los dos primeros y los dos últimos dígitos', () => {
    expect(mascararCedula('1712345675')).toBe('17******75');
  });
});

describe('cedulaCoincideConSesion', () => {
  const validar = (cedulaSesion: string | null, valor: string) =>
    cedulaCoincideConSesion(cedulaSesion)(new FormControl(valor));

  it('acepta la misma cédula de la sesión', () => {
    expect(validar('1712345675', '1712345675')).toBeNull();
  });

  it('rechaza otra cédula completa, para no gastar un intento del servidor', () => {
    expect(validar('1712345675', '1712345676')).toEqual({ cedulaNoCoincide: true });
  });

  it('no opina mientras la cédula está incompleta ni si la sesión no la conoce', () => {
    expect(validar('1712345675', '17123')).toBeNull();
    expect(validar(null, '1712345676')).toBeNull();
  });
});

describe('mensajeDeError', () => {
  const error = (status: number, cuerpo: unknown) => new HttpErrorResponse({ status, error: cuerpo });

  it('usa el mensaje que envía el servidor', () => {
    expect(mensajeDeError(error(403, { message: 'La cédula ingresada no corresponde a su cuenta' })))
      .toBe('La cédula ingresada no corresponde a su cuenta');
  });

  it('si hay errores de validación los junta', () => {
    expect(mensajeDeError(error(400, { message: 'Validación fallida', errors: ['A', 'B'] }))).toBe('A B');
  });

  it('sin cuerpo útil, usa el texto del código de estado', () => {
    expect(mensajeDeError(error(429, null))).toBe(MENSAJES_POR_ESTADO[429]);
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

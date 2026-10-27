import { FormControl } from '@angular/forms';
import { cedulaCoincideConSesion, cedulaDeSesion, elegirPeriodoInicial, mascararCedula } from './mi-rol-pago.util';

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

describe('elegirPeriodoInicial', () => {
  const periodos = ['2026-10', '2026-09', '2026-08'];

  it('usa el mes pedido si está entre los publicados', () => {
    expect(elegirPeriodoInicial(periodos, '2026-09')).toBe('2026-09');
  });

  it('si el mes pedido no existe o no se pidió ninguno, usa el más reciente', () => {
    expect(elegirPeriodoInicial(periodos, '2020-01')).toBe('2026-10');
    expect(elegirPeriodoInicial(periodos, null)).toBe('2026-10');
  });

  it('sin meses publicados no hay nada que elegir', () => {
    expect(elegirPeriodoInicial([], '2026-09')).toBeNull();
  });
});

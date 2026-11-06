import type { ResultadoArchivoResponse } from '@models';
import { agruparPrevia, avisosAEnviar, textoNuevos, textoReemplazo } from './previa-correccion.util';

const resultado = (
  archivo: string,
  estado: ResultadoArchivoResponse['estado'],
  titular: string | null = 'PEREZ JUAN',
): ResultadoArchivoResponse => ({ archivo, estado, mensaje: null, titular });

describe('agruparPrevia', () => {
  const resultados = [
    resultado('1712345675.pdf', 'REEMPLAZADO', 'PEREZ JUAN'),
    resultado('1709876542.pdf', 'CARGADO', 'GOMEZ MARIA'),
    resultado('1723456784.pdf', 'SIN_CAMBIOS', 'SILVA LUIS'),
    resultado('1704567890.pdf', 'SIN_CAMBIOS', 'RAMOS PEDRO'),
    resultado('rol_malo.pdf', 'RECHAZADO', null),
  ];

  it('separa lo que se reemplaza, lo que se agrega, lo que queda igual y lo rechazado', () => {
    const grupos = agruparPrevia(resultados);
    expect(grupos.reemplazos).toEqual([{ cedula: '1712345675', titular: 'PEREZ JUAN' }]);
    expect(grupos.nuevos).toEqual([{ cedula: '1709876542', titular: 'GOMEZ MARIA' }]);
    expect(grupos.sinCambios).toBe(2);
    expect(grupos.rechazados.map((r) => r.archivo)).toEqual(['rol_malo.pdf']);
  });

  it('la cédula sale del nombre del archivo, sin la extensión, aunque venga en mayúsculas', () => {
    expect(agruparPrevia([resultado('1712345675.PDF', 'REEMPLAZADO')]).reemplazos[0].cedula).toBe('1712345675');
  });

  it('si no se conoce el titular queda vacío, no "null"', () => {
    expect(agruparPrevia([resultado('1712345675.pdf', 'REEMPLAZADO', null)]).reemplazos[0].titular).toBe('');
  });

  it('sin resultados todo está vacío', () => {
    expect(agruparPrevia([])).toEqual({ reemplazos: [], nuevos: [], sinCambios: 0, rechazados: [] });
  });
});

describe('textos de la vista previa', () => {
  it('el reemplazo se dice en singular o plural según la cantidad', () => {
    expect(textoReemplazo(1)).toBe('El siguiente rol se va a reemplazar');
    expect(textoReemplazo(3)).toBe('Los siguientes 3 roles se van a reemplazar');
  });

  it('lo nuevo también', () => {
    expect(textoNuevos(1)).toBe('Se agregará 1 rol nuevo');
    expect(textoNuevos(4)).toBe('Se agregarán 4 roles nuevos');
  });
});

describe('avisosAEnviar', () => {
  it('cuenta a quienes recibirán correo: los reemplazados y los nuevos, no los iguales ni los rechazados', () => {
    const grupos = agruparPrevia([
      resultado('1712345675.pdf', 'REEMPLAZADO'),
      resultado('1709876542.pdf', 'CARGADO'),
      resultado('1723456784.pdf', 'SIN_CAMBIOS'),
      resultado('x.pdf', 'RECHAZADO', null),
    ]);
    expect(avisosAEnviar(grupos)).toBe(2);
  });
});

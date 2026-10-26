import type { ResultadoCargaResponse } from '@models';
import { MAX_BYTES_ARCHIVO } from './carga-masiva.model';
import { archivo } from './carga-masiva.testing';
import { acumularProgreso, clasificarArchivos, crearLotes, progresoInicial, sumarBytes, validarArchivo } from './carga-masiva.util';

describe('validarArchivo', () => {
  it('acepta un PDF cuyo nombre es una cédula de 10 dígitos', () => {
    expect(validarArchivo(archivo('1712345675.pdf'))).toBeNull();
    expect(validarArchivo(archivo('1712345675.PDF'))).toBeNull();
  });

  it('rechaza nombres que no son una cédula, archivos vacíos y los de más de 5 MB', () => {
    expect(validarArchivo(archivo('rol-juan.pdf'))).toContain('cédula');
    expect(validarArchivo(archivo('171234567.pdf'))).toContain('cédula');
    expect(validarArchivo(archivo('1712345675.docx'))).toContain('cédula');
    expect(validarArchivo(archivo('1712345675.pdf', 0))).toContain('vacío');
    expect(validarArchivo(archivo('1712345675.pdf', MAX_BYTES_ARCHIVO + 1))).toContain('5 MB');
    expect(validarArchivo(archivo('1712345675.pdf', MAX_BYTES_ARCHIVO))).toBeNull();
  });
});

describe('clasificarArchivos', () => {
  it('separa los válidos de los descartados y marca los repetidos', () => {
    const { validos, descartados } = clasificarArchivos([
      archivo('1712345675.pdf'),
      archivo('notas.txt'),
      archivo('1712345675.PDF'),
      archivo('0202125712.pdf'),
    ]);
    expect(validos.map((a) => a.name)).toEqual(['1712345675.pdf', '0202125712.pdf']);
    expect(descartados.map((d) => d.archivo)).toEqual(['notas.txt', '1712345675.PDF']);
    expect(descartados[1].mensaje).toContain('repetido');
  });
});

describe('crearLotes', () => {
  it('parte por cantidad de archivos', () => {
    const archivos = Array.from({ length: 250 }, (_, i) => archivo(`${1000000000 + i}.pdf`));
    expect(crearLotes(archivos).map((lote) => lote.length)).toEqual([100, 100, 50]);
  });

  it('parte por tamaño total sin pasarse del máximo del lote', () => {
    const mb = 1024 * 1024;
    const lotes = crearLotes([archivo('1000000001.pdf', 40 * mb), archivo('1000000002.pdf', 40 * mb), archivo('1000000003.pdf', 40 * mb)]);
    expect(lotes.map((lote) => lote.length)).toEqual([2, 1]);
  });

  it('sin archivos no hay lotes, y un archivo solo siempre cabe', () => {
    expect(crearLotes([])).toEqual([]);
    expect(crearLotes([archivo('1000000001.pdf', 90 * 1024 * 1024)])).toHaveLength(1);
  });
});

describe('acumularProgreso', () => {
  const lote = (cargados: number, rechazados: number, archivos: string[]): ResultadoCargaResponse => ({
    periodo: '2026-09',
    total: cargados + rechazados,
    cargados,
    reemplazados: 0,
    sinCambios: 0,
    rechazados,
    resultados: archivos.map((nombre) => ({ archivo: nombre, estado: 'CARGADO', mensaje: null })),
  });

  it('suma los resultados de cada lote y avanza el contador', () => {
    const uno = acumularProgreso(progresoInicial(2), lote(98, 2, ['a.pdf']));
    const dos = acumularProgreso(uno, lote(50, 0, ['b.pdf']));
    expect(dos).toMatchObject({ loteActual: 2, totalLotes: 2 });
    expect(dos.resumen).toMatchObject({ cargados: 148, rechazados: 2 });
    expect(dos.resumen.resultados.map((r) => r.archivo)).toEqual(['a.pdf', 'b.pdf']);
  });
});

describe('sumarBytes', () => {
  it('suma los tamaños', () => {
    expect(sumarBytes([archivo('1000000001.pdf', 10), archivo('1000000002.pdf', 5)])).toBe(15);
  });
});

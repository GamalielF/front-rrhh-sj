import type { PeriodoResumenResponse, RolPagoResumenResponse } from '@models';
import { FormControl } from '@angular/forms';
import type { RolFila } from './rrhh.model';
import {
  aFilasPeriodos,
  aFilasRoles,
  esPeriodoEnRango,
  filtrarRoles,
  mesSiguiente,
  opcionesDePeriodos,
  periodoActual,
  periodoEnRango,
  periodoMasReciente,
  resumirNombres,
  sugerirPeriodoNuevo,
} from './rrhh.util';

const rol = (id: number, nombre: string | null, estado: 'ACTIVO' | 'INACTIVO' = 'ACTIVO'): RolPagoResumenResponse => ({
  id,
  cedula: '1712345675',
  nombre,
  estado,
  tamanoBytes: 2048,
  actualizadoEn: '2026-10-22T16:53:39.5',
  actualizadoPor: 'fsepa',
});

describe('aFilasPeriodos', () => {
  it('prepara el texto de cada período para la tabla', () => {
    const periodos: PeriodoResumenResponse[] = [
      { periodo: '2026-09', estado: 'PUBLICADO', fechaPublicacion: '2026-10-01T09:30:00', publicadoPor: 'fsepa', rolesActivos: 120 },
      { periodo: '2026-10', estado: 'CARGADO', fechaPublicacion: null, publicadoPor: null, rolesActivos: 3 },
    ];
    const [publicado, enPreparacion] = aFilasPeriodos(periodos);
    expect(publicado).toMatchObject({ mes: 'Septiembre 2026', estadoEtiqueta: 'Publicado', publicadoEl: '01/10/2026 09:30', publicadoPor: 'fsepa' });
    expect(enPreparacion).toMatchObject({ estadoEtiqueta: 'En preparación', publicadoEl: '—', publicadoPor: '—' });
  });
});

describe('aFilasRoles', () => {
  it('muestra la cédula completa, formatea tamaño, fecha y estado, y tolera un nombre vacío', () => {
    const [activo, inactivo] = aFilasRoles([rol(1, 'PEREZ JUAN'), rol(2, null, 'INACTIVO')]);
    expect(activo).toMatchObject({ cedula: '1712345675', nombre: 'PEREZ JUAN', tamano: '2 KB', actualizadoEn: '22/10/2026 16:53', estadoEtiqueta: 'Activo' });
    expect(inactivo).toMatchObject({ nombre: '—', estadoEtiqueta: 'Inactivo' });
  });
});

describe('filtrarRoles', () => {
  const filas: RolFila[] = aFilasRoles([rol(1, 'PÉREZ LÓPEZ JUAN'), rol(2, 'GARCÍA MORA ANA')]);

  it('busca sin distinguir mayúsculas ni tildes', () => {
    expect(filtrarRoles(filas, 'perez').map((fila) => fila.id)).toEqual([1]);
    expect(filtrarRoles(filas, 'GARCIA').map((fila) => fila.id)).toEqual([2]);
  });

  it('busca por la cédula completa o por una parte de ella', () => {
    const filas = aFilasRoles([
      { ...rol(1, 'PEREZ JUAN'), cedula: '1712345675' },
      { ...rol(2, 'GARCIA ANA'), cedula: '0202125712' },
    ]);
    expect(filtrarRoles(filas, '0202125712').map((fila) => fila.id)).toEqual([2]);
    expect(filtrarRoles(filas, '17123').map((fila) => fila.id)).toEqual([1]);
    expect(filtrarRoles(filas, '5712').map((fila) => fila.id)).toEqual([2]);
  });

  it('sin texto devuelve todo, y sin coincidencias devuelve vacío', () => {
    expect(filtrarRoles(filas, '  ')).toHaveLength(2);
    expect(filtrarRoles(filas, 'zzz')).toHaveLength(0);
  });
});

describe('resumirNombres', () => {
  it('lista todos si caben y resume el resto si son muchos', () => {
    expect(resumirNombres(['A', 'B'], 8)).toBe('A, B');
    expect(resumirNombres(['A', 'B', 'C', 'D'], 2)).toBe('A, B y 2 más');
  });
});

describe('períodos', () => {
  const hoy = new Date(2026, 9, 23);

  it('el período actual y el mes siguiente cruzan bien el fin de año', () => {
    expect(periodoActual(hoy)).toBe('2026-10');
    expect(mesSiguiente('2026-10')).toBe('2026-11');
    expect(mesSiguiente('2026-12')).toBe('2027-01');
  });

  it('el más reciente es el de mayor fecha, no el primero de la lista', () => {
    const periodos: PeriodoResumenResponse[] = ['2026-08', '2026-10', '2026-09'].map((periodo) => ({
      periodo,
      estado: 'CARGADO',
      fechaPublicacion: null,
      publicadoPor: null,
      rolesActivos: 1,
    }));
    expect(periodoMasReciente(periodos)).toBe('2026-10');
    expect(periodoMasReciente([])).toBeNull();
  });

  it('acepta desde enero de 2020 hasta el próximo mes, y rechaza lo demás', () => {
    expect(esPeriodoEnRango('2020-01', hoy)).toBe(true);
    expect(esPeriodoEnRango('2026-11', hoy)).toBe(true);
    expect(esPeriodoEnRango('2026-12', hoy)).toBe(false);
    expect(esPeriodoEnRango('2062-10', hoy)).toBe(false);
    expect(esPeriodoEnRango('2019-12', hoy)).toBe(false);
  });

  it('el validador solo opina sobre períodos con formato correcto', () => {
    const validar = (valor: string) => periodoEnRango(() => hoy)(new FormControl(valor));
    expect(validar('2026-10')).toBeNull();
    expect(validar('2062-10')).toEqual({ fueraDeRango: true });
    expect(validar('octubre')).toBeNull();
  });

  it('sugiere el mes siguiente al último, o el actual si no hay ninguno, o nada si ya se pasaría del rango', () => {
    expect(sugerirPeriodoNuevo(['2026-08', '2026-09'], hoy)).toBe('2026-10');
    expect(sugerirPeriodoNuevo([], hoy)).toBe('2026-10');
    expect(sugerirPeriodoNuevo(['2026-11'], hoy)).toBe('');
  });
});

describe('opcionesDePeriodos', () => {
  const filas = aFilasPeriodos([
    { periodo: '2026-09', estado: 'PUBLICADO', fechaPublicacion: '2026-10-01T09:30:00', publicadoPor: 'fsepa', rolesActivos: 120 },
    { periodo: '2026-10', estado: 'CARGADO', fechaPublicacion: null, publicadoPor: null, rolesActivos: 3 },
  ]);

  it('una opción por período, con su estado y la marca de cuál está elegido', () => {
    const opciones = opcionesDePeriodos(filas, '2026-10');
    expect(opciones.map((opcion) => opcion.id)).toEqual(['2026-09', '2026-10']);
    expect(opciones[0]).toMatchObject({ label: 'Septiembre 2026', badge: 'Publicado', badgeVariant: 'success', variant: 'default' });
    expect(opciones[0].description).toContain('publicado el 01/10/2026 09:30 por fsepa');
    expect(opciones[1]).toMatchObject({ badge: 'En preparación', icon: '@tui.check', variant: 'brand' });
    expect(opciones[1].description).toBe('3 roles cargados');
  });

  it('un período que todavía no existe aparece primero como Nuevo', () => {
    const opciones = opcionesDePeriodos(filas, '2026-11');
    expect(opciones[0]).toMatchObject({ id: '2026-11', label: 'Noviembre 2026', badge: 'Nuevo', badgeVariant: 'info' });
    expect(opciones).toHaveLength(3);
  });
});

import type { GrupoNotificacion, RolFila } from '../../rrhh.model';
import {
  OPCIONES_ORDEN,
  aCsv,
  chipsDeGrupos,
  filtrarPorGrupo,
  nombreArchivoCsv,
  ordenarRoles,
  paginar,
  ultimaPagina,
} from './roles-tabla.util';

const fila = (id: number, nombre: string, grupo: GrupoNotificacion = 'NOTIFICADO', cedula = `17123456${String(id).padStart(2, '0')}`): RolFila => ({
  id,
  cedula,
  nombre,
  estado: 'ACTIVO',
  estadoEtiqueta: 'Activo',
  notificacion: 'Notificado',
  notificacionVariante: 'success',
  notificacionDetalle: 'Enviado el 27/10/2026 10:15',
  notificacionDetalleCorto: 'Enviado el 27/10/2026 10:15',
  grupoNotificacion: grupo,
  reenviable: true,
  tamano: '2 KB',
  actualizadoEn: '27/10/2026 10:15',
});

describe('chipsDeGrupos', () => {
  it('con todos los avisos en el mismo estado no hay nada que filtrar y no ofrece chips', () => {
    expect(chipsDeGrupos([fila(1, 'A'), fila(2, 'B')])).toEqual([]);
    expect(chipsDeGrupos([])).toEqual([]);
  });

  it('con estados distintos ofrece "Todos" y solo los grupos que existen, con su cantidad y los problemas primero', () => {
    const chips = chipsDeGrupos([fila(1, 'A'), fila(2, 'B', 'PROBLEMA'), fila(3, 'C'), fila(4, 'D', 'EN_COLA')]);
    expect(chips.map((chip) => `${chip.etiqueta}:${chip.cantidad}`)).toEqual(['Todos:4', 'Con problema:1', 'En cola:1', 'Notificados:2']);
    expect(chips[0].grupo).toBeNull();
  });
});

describe('filtrarPorGrupo', () => {
  const filas = [fila(1, 'A'), fila(2, 'B', 'PROBLEMA'), fila(3, 'C', 'PROBLEMA')];

  it('sin grupo devuelve todo', () => {
    expect(filtrarPorGrupo(filas, null)).toHaveLength(3);
  });

  it('con un grupo deja solo ese', () => {
    expect(filtrarPorGrupo(filas, 'PROBLEMA').map((f) => f.id)).toEqual([2, 3]);
    expect(filtrarPorGrupo(filas, 'EN_COLA')).toEqual([]);
  });
});

describe('ordenarRoles', () => {
  it('por nombre ignora mayúsculas y tildes, como se ordena en español', () => {
    const filas = [fila(1, 'ZAMBRANO'), fila(2, 'ÁVILA'), fila(3, 'alarcón'), fila(4, 'BENAVIDES')];
    expect(ordenarRoles(filas, 'NOMBRE').map((f) => f.nombre)).toEqual(['alarcón', 'ÁVILA', 'BENAVIDES', 'ZAMBRANO']);
  });

  it('por cédula', () => {
    const filas = [fila(1, 'A', 'NOTIFICADO', '1712345675'), fila(2, 'B', 'NOTIFICADO', '0202125712')];
    expect(ordenarRoles(filas, 'CEDULA').map((f) => f.cedula)).toEqual(['0202125712', '1712345675']);
  });

  it('"problemas primero": con problema, en cola, sin aviso y al final los notificados; dentro de cada grupo, por nombre', () => {
    const filas = [fila(1, 'A', 'NOTIFICADO'), fila(2, 'C', 'PROBLEMA'), fila(3, 'B', 'PROBLEMA'), fila(4, 'D', 'SIN_AVISO'), fila(5, 'E', 'EN_COLA')];
    expect(ordenarRoles(filas, 'PROBLEMAS').map((f) => f.id)).toEqual([3, 2, 5, 4, 1]);
  });

  it('no modifica la lista original', () => {
    const filas = [fila(1, 'B'), fila(2, 'A')];
    ordenarRoles(filas, 'NOMBRE');
    expect(filas.map((f) => f.id)).toEqual([1, 2]);
  });

  it('ofrece las tres formas de ordenar', () => {
    expect(OPCIONES_ORDEN.map((opcion) => opcion.id)).toEqual(['NOMBRE', 'CEDULA', 'PROBLEMAS']);
  });
});

describe('paginar y ultimaPagina', () => {
  const filas = Array.from({ length: 60 }, (_, i) => i);

  it('corta por páginas, empezando en la 0', () => {
    expect(paginar(filas, 0, 25)).toHaveLength(25);
    expect(paginar(filas, 0, 25)[0]).toBe(0);
    expect(paginar(filas, 2, 25)).toEqual(filas.slice(50));
  });

  it('una página más allá del final queda vacía', () => {
    expect(paginar(filas, 5, 25)).toEqual([]);
  });

  it('calcula cuál es la última página, sin salirse con pocas filas ni con ninguna', () => {
    expect(ultimaPagina(60, 25)).toBe(2);
    expect(ultimaPagina(50, 25)).toBe(1);
    expect(ultimaPagina(1, 25)).toBe(0);
    expect(ultimaPagina(0, 25)).toBe(0);
  });
});

describe('aCsv', () => {
  it('empieza con la marca de orden de UTF-8, para que Excel muestre bien las tildes', () => {
    expect(aCsv([]).charCodeAt(0)).toBe(0xfeff);
  });

  it('separa con punto y coma, termina cada línea con salto de Windows y trae encabezados', () => {
    const lineas = aCsv([fila(1, 'PEREZ JUAN')]).replace('\uFEFF', '').split('\r\n');
    expect(lineas[0]).toBe('Cédula;Nombre;Estado del rol;Notificación;Detalle del aviso;Actualizado');
    expect(lineas[1]).toBe('="1712345601";PEREZ JUAN;Activo;Notificado;Enviado el 27/10/2026 10:15;27/10/2026 10:15');
    expect(lineas[2]).toBe('');
  });

  it('protege la cédula para que Excel no le quite el cero inicial', () => {
    expect(aCsv([fila(1, 'A', 'NOTIFICADO', '0202125712')])).toContain('="0202125712"');
  });

  it('entrecomilla lo que trae punto y coma, comillas o saltos de línea', () => {
    const csv = aCsv([{ ...fila(1, 'PEREZ; JUAN'), notificacionDetalle: 'Dijo "no" \n y se fue' }]);
    expect(csv).toContain('"PEREZ; JUAN"');
    expect(csv).toContain('"Dijo ""no"" \n y se fue"');
  });

  it('neutraliza lo que Excel tomaría por una fórmula', () => {
    const csv = aCsv([{ ...fila(1, '=CMD()'), notificacionDetalle: '+1;2' }]);
    expect(csv).toContain("'=CMD()");
    expect(csv).toContain("\"'+1;2\"");
  });

  it('exporta el detalle completo, no el acortado de la tabla', () => {
    const largo = 'Intento 1 fallido (La URL de la API de correo lleva llaves { }: parece una plantilla de Postman; escriba la dirección real)';
    const csv = aCsv([{ ...fila(1, 'A'), notificacionDetalle: largo, notificacionDetalleCorto: 'Intento 1 fallido…' }]);
    expect(csv).toContain('escriba la dirección real');
    expect(csv).not.toContain('Intento 1 fallido…');
  });
});

describe('nombreArchivoCsv', () => {
  it('lleva el período en el nombre', () => {
    expect(nombreArchivoCsv('2026-11')).toBe('roles-2026-11.csv');
    expect(nombreArchivoCsv('')).toBe('roles.csv');
  });
});

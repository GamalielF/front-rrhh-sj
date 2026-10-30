import type { GrupoNotificacion, RolFila } from '../../rrhh.model';

export interface ChipGrupo {
  grupo: GrupoNotificacion | null;
  etiqueta: string;
  cantidad: number;
}

export type OrdenRoles = 'NOMBRE' | 'CEDULA' | 'PROBLEMAS';

export const OPCIONES_ORDEN: { id: OrdenRoles; etiqueta: string }[] = [
  { id: 'NOMBRE', etiqueta: 'Nombre (A–Z)' },
  { id: 'CEDULA', etiqueta: 'Cédula' },
  { id: 'PROBLEMAS', etiqueta: 'Problemas primero' },
];

export const TAMANOS_PAGINA = [10, 25, 50, 100];
export const TAMANO_PAGINA_INICIAL = 25;

const ETIQUETAS_GRUPO: Record<GrupoNotificacion, string> = {
  PROBLEMA: 'Con problema',
  EN_COLA: 'En cola',
  NOTIFICADO: 'Notificados',
  SIN_AVISO: 'Sin notificar',
};

const PRIORIDAD_GRUPO: Record<GrupoNotificacion, number> = { PROBLEMA: 0, EN_COLA: 1, SIN_AVISO: 2, NOTIFICADO: 3 };

const ENCABEZADOS_CSV = ['Cédula', 'Nombre', 'Estado del rol', 'Notificación', 'Detalle del aviso', 'Actualizado'];

export function chipsDeGrupos(filas: RolFila[]): ChipGrupo[] {
  const cantidades = new Map<GrupoNotificacion, number>();
  filas.forEach((fila) => cantidades.set(fila.grupoNotificacion, (cantidades.get(fila.grupoNotificacion) ?? 0) + 1));
  if (cantidades.size < 2) {
    return [];
  }
  const grupos = (Object.keys(ETIQUETAS_GRUPO) as GrupoNotificacion[])
    .filter((grupo) => cantidades.has(grupo))
    .sort((a, b) => PRIORIDAD_GRUPO[a] - PRIORIDAD_GRUPO[b])
    .map((grupo) => ({ grupo, etiqueta: ETIQUETAS_GRUPO[grupo], cantidad: cantidades.get(grupo) ?? 0 }));
  return [{ grupo: null, etiqueta: 'Todos', cantidad: filas.length }, ...grupos];
}

export function filtrarPorGrupo(filas: RolFila[], grupo: GrupoNotificacion | null): RolFila[] {
  return grupo ? filas.filter((fila) => fila.grupoNotificacion === grupo) : filas;
}

export function ordenarRoles(filas: RolFila[], orden: OrdenRoles): RolFila[] {
  const porNombre = (a: RolFila, b: RolFila) => a.nombre.localeCompare(b.nombre, 'es', { sensitivity: 'base' });
  const comparar: Record<OrdenRoles, (a: RolFila, b: RolFila) => number> = {
    NOMBRE: porNombre,
    CEDULA: (a, b) => a.cedula.localeCompare(b.cedula),
    PROBLEMAS: (a, b) => PRIORIDAD_GRUPO[a.grupoNotificacion] - PRIORIDAD_GRUPO[b.grupoNotificacion] || porNombre(a, b),
  };
  return [...filas].sort(comparar[orden]);
}

export function ultimaPagina(total: number, tamano: number): number {
  return Math.max(0, Math.ceil(total / tamano) - 1);
}

export function paginar<T>(filas: T[], pagina: number, tamano: number): T[] {
  return filas.slice(pagina * tamano, (pagina + 1) * tamano);
}

/** CSV para Excel en español: separador ;, UTF-8 con marca de orden y la cédula protegida para que no pierda el cero inicial. */
export function aCsv(filas: RolFila[]): string {
  const lineas = [
    ENCABEZADOS_CSV.map(celdaCsv),
    ...filas.map((fila) =>
      [
        celdaDeCedula(fila.cedula),
        celdaCsv(fila.nombre),
        celdaCsv(fila.estadoEtiqueta),
        celdaCsv(fila.notificacion),
        celdaCsv(fila.notificacionDetalle),
        celdaCsv(fila.actualizadoEn),
      ],
    ),
  ];
  return `\uFEFF${lineas.map((linea) => linea.join(';')).join('\r\n')}\r\n`;
}

export function nombreArchivoCsv(periodo: string): string {
  return periodo ? `roles-${periodo}.csv` : 'roles.csv';
}

function celdaDeCedula(cedula: string): string {
  return /^\d{10}$/.test(cedula) ? `="${cedula}"` : celdaCsv(cedula);
}

function celdaCsv(valor: string): string {
  const seguro = /^[=+\-@\t\r]/.test(valor) ? `'${valor}` : valor;
  return /[";\r\n]/.test(seguro) ? `"${seguro.replace(/"/g, '""')}"` : seguro;
}

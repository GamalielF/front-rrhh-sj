import type { TableColumn } from '@lumen/ui';
import type { EstadoNotificacion } from '@models';

export interface ProblemaFila {
  nombre: string;
  estado: EstadoNotificacion;
  estadoEtiqueta: string;
  intentos: number;
  detalle: string;
}

export interface AdvertenciaEnvio {
  variante: 'danger' | 'warning' | 'info';
  texto: string;
}

export const INTERVALO_ACTUALIZACION_MS = 10_000;

export const COLUMNAS_PROBLEMAS: TableColumn<ProblemaFila>[] = [
  { key: 'nombre', title: 'Persona' },
  {
    key: 'estadoEtiqueta',
    title: 'Estado',
    type: 'badge',
    badgeVariant: (fila) => (fila.estado === 'FALLIDA' ? 'danger' : 'warning'),
  },
  { key: 'intentos', title: 'Intentos' },
  { key: 'detalle', title: 'Detalle' },
];

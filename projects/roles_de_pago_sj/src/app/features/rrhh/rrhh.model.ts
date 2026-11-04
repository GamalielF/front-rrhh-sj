import type { TableColumn } from '@lumen/ui';
import type { EstadoPeriodo, EstadoRegistro } from '@models';

export interface PeriodoFila {
  periodo: string;
  mes: string;
  estado: EstadoPeriodo;
  estadoEtiqueta: string;
  rolesActivos: number;
  publicadoEl: string;
  publicadoPor: string;
}

export type VarianteNotificacion = 'success' | 'info' | 'warning' | 'danger' | 'neutral';

export type GrupoNotificacion = 'PROBLEMA' | 'EN_COLA' | 'NOTIFICADO' | 'SIN_AVISO';

export interface RolFila {
  id: number;
  cedula: string;
  nombre: string;
  estado: EstadoRegistro;
  estadoEtiqueta: string;
  notificacion: string;
  notificacionVariante: VarianteNotificacion;
  notificacionDetalle: string;
  notificacionDetalleCorto: string;
  grupoNotificacion: GrupoNotificacion;
  reenviable: boolean;
  tamano: string;
  actualizadoEn: string;
}

export const PATRON_PERIODO = /^\d{4}-(0[1-9]|1[0-2])$/;

export const PERIODO_MINIMO = '2020-01';
export const LARGO_DETALLE_EN_TABLA = 70;

export const COLUMNAS_ROLES: TableColumn<RolFila>[] = [
  { key: 'cedula', title: 'Cédula' },
  { key: 'nombre', title: 'Nombre' },
  {
    key: 'estadoEtiqueta',
    title: 'Estado',
    type: 'badge',
    badgeVariant: (fila) => (fila.estado === 'ACTIVO' ? 'success' : 'neutral'),
  },
  { key: 'notificacion', title: 'Notificación', type: 'badge', badgeVariant: (fila) => fila.notificacionVariante },
  { key: 'notificacionDetalleCorto', title: 'Detalle del aviso' },
  { key: 'actualizadoEn', title: 'Actualizado' },
];

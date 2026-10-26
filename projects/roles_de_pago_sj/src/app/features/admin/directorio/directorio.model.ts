import type { TableColumn } from '@lumen/ui';

export interface PerfilFila {
  username: string;
  nombre: string;
  cargo: string;
  correo: string;
  estado: string;
  estadoEtiqueta: string;
  cedula: string;
}

export interface DatoSincronizacion {
  etiqueta: string;
  valor: number;
  variante: 'success' | 'info' | 'neutral' | 'warning' | 'danger';
}

export const CEDULA_DE_10_DIGITOS = /^\d{10}$/;

export const MENSAJES_CEDULA: Record<string, string> = {
  required: 'Ingrese la cédula',
  pattern: 'La cédula debe tener 10 dígitos',
};

export const COLUMNAS_PERFILES: TableColumn<PerfilFila>[] = [
  { key: 'username', title: 'Usuario' },
  { key: 'nombre', title: 'Nombre' },
  { key: 'cargo', title: 'Cargo' },
  { key: 'correo', title: 'Correo' },
  {
    key: 'estadoEtiqueta',
    title: 'Estado',
    type: 'badge',
    badgeVariant: (fila) => (fila.estado === 'ACTIVO' ? 'success' : 'neutral'),
  },
  { key: 'cedula', title: 'Cédula' },
];

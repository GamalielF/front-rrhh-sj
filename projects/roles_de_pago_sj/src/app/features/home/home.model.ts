import type { NombreRol } from '@models';

export interface AccesoRapido {
  titulo: string;
  descripcion: string;
  icono: string;
  ruta: string;
  roles: NombreRol[];
}

export interface AlertaAdmin {
  variante: 'danger' | 'warning';
  mensaje: string;
  ruta: string;
}

export interface Indicador {
  etiqueta: string;
  valor: string | number;
  icono: string;
  acento: 'blue' | 'green' | 'warning' | 'danger' | 'info';
}

export const DIAS_SIN_SINCRONIZAR = 7;
export const DIAS_DE_DENEGADOS = 7;
export const MINIMO_DENEGADOS = 3;
export const NOMBRES_DE_DENEGADOS_VISIBLES = 3;

export const ACCESOS_RAPIDOS: AccesoRapido[] = [
  {
    titulo: 'Períodos',
    descripcion: 'Cargue los roles del mes, revise el cuadre y publique.',
    icono: '@tui.calendar',
    ruta: '/rrhh/periodos',
    roles: ['RRHH', 'ADMIN'],
  },
  {
    titulo: 'Usuarios y roles',
    descripcion: 'Asigne RRHH o administrador y el permiso de ver roles ajenos.',
    icono: '@tui.user-cog',
    ruta: '/admin/usuarios',
    roles: ['ADMIN'],
  },
  {
    titulo: 'Directorio',
    descripcion: 'Sincronice con el AD y busque personas por cédula.',
    icono: '@tui.database',
    ruta: '/admin/directorio',
    roles: ['ADMIN'],
  },
  {
    titulo: 'Auditoría',
    descripcion: 'Quién consultó cada rol y quién hizo cambios.',
    icono: '@tui.clipboard-list',
    ruta: '/admin/auditoria',
    roles: ['ADMIN'],
  },
];

import type { NavItem } from '@lumen/ui';

export const OPCION_INICIO: NavItem = { label: 'Inicio', icon: '@tui.house', route: '/home' };
export const OPCION_MI_ROL: NavItem = { label: 'Mi rol de pago', icon: '@tui.file-text', route: '/mi-rol' };
export const OPCION_PERIODOS: NavItem = { label: 'Períodos', icon: '@tui.calendar', route: '/rrhh/periodos' };
export const OPCION_USUARIOS: NavItem = { label: 'Usuarios y roles', icon: '@tui.user-cog', route: '/admin/usuarios' };
export const OPCION_DIRECTORIO: NavItem = { label: 'Directorio', icon: '@tui.database', route: '/admin/directorio' };

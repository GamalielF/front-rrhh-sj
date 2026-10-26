import type { TableColumn } from '@lumen/ui';

export type ModoAuditoria = 'accesos' | 'acciones' | 'denegados';

export interface FiltrosAuditoria {
  desde: string;
  hasta: string;
  usuario: string;
  periodo: string;
  resultado: string;
  tipoAcceso: string;
  tipoAccion: string;
  minimo: number;
}

export interface OpcionFiltro {
  valor: string;
  etiqueta: string;
}

export interface AccesoFila {
  id: number;
  fecha: string;
  usuario: string;
  tipo: string;
  resultado: string;
  esDenegado: boolean;
  detalle: string;
  cedula: string;
  periodo: string;
  motivo: string;
  ip: string;
}

export interface AccionFila {
  id: number;
  fecha: string;
  usuario: string;
  accion: string;
  periodo: string;
  rol: string;
  detalle: string;
  ip: string;
}

export interface DenegadoFila {
  usuario: string;
  intentos: number;
  cedulas: number;
  ultimoIntento: string;
}

export const FILTROS_VACIOS: FiltrosAuditoria = {
  desde: '',
  hasta: '',
  usuario: '',
  periodo: '',
  resultado: '',
  tipoAcceso: '',
  tipoAccion: '',
  minimo: 3,
};

export const MODOS_AUDITORIA: { id: ModoAuditoria; etiqueta: string }[] = [
  { id: 'accesos', etiqueta: 'Accesos a roles' },
  { id: 'acciones', etiqueta: 'Acciones de gestión' },
  { id: 'denegados', etiqueta: 'Intentos denegados' },
];

export const DIAS_MAXIMOS = 366;
export const TAMANO_PAGINA = 20;
export const PATRON_PERIODO_FILTRO = /^\d{4}-(0[1-9]|1[0-2])$/;

export const OPCIONES_RESULTADO: OpcionFiltro[] = [
  { valor: '', etiqueta: 'Todos' },
  { valor: 'PERMITIDO', etiqueta: 'Permitido' },
  { valor: 'DENEGADO', etiqueta: 'Denegado' },
];

export const OPCIONES_TIPO_ACCESO: OpcionFiltro[] = [
  { valor: '', etiqueta: 'Todos' },
  { valor: 'CONSULTA_PROPIA', etiqueta: 'Consulta propia' },
  { valor: 'CONSULTA_AJENA', etiqueta: 'Consulta de otra persona' },
];

export const ETIQUETAS_ACCION: Record<string, string> = {
  CARGA_LOTE: 'Carga de roles',
  ROL_REEMPLAZADO: 'Rol reemplazado',
  ROL_INACTIVADO: 'Rol inactivado',
  ROL_ACTIVADO: 'Rol activado',
  PERIODO_PUBLICADO: 'Período publicado',
  REPORTE_EXPORTADO: 'Reporte exportado',
  NOTIFICACIONES_GENERADAS: 'Avisos generados',
  NOTIFICACIONES_REINTENTADAS: 'Avisos reintentados',
  USUARIO_ROL_OTORGADO: 'Rol otorgado a un usuario',
  USUARIO_ROL_REVOCADO: 'Rol quitado a un usuario',
};

export const OPCIONES_TIPO_ACCION: OpcionFiltro[] = [
  { valor: '', etiqueta: 'Todas' },
  ...Object.entries(ETIQUETAS_ACCION).map(([valor, etiqueta]) => ({ valor, etiqueta })),
];

export const ETIQUETAS_DETALLE: Record<string, string> = {
  OK: 'Correcto',
  CEDULA_NO_COINCIDE: 'La cédula no coincide',
  SIN_CEDULA_EN_DIRECTORIO: 'Sin cédula en el directorio',
  ROL_NO_ENCONTRADO: 'Sin rol publicado',
  ARCHIVO_NO_DISPONIBLE: 'Archivo no disponible',
  SIN_PERMISO: 'Sin permiso',
  BLOQUEADO_POR_INTENTOS: 'Bloqueado por intentos',
};

export const COLUMNAS_ACCESOS: TableColumn<AccesoFila>[] = [
  { key: 'fecha', title: 'Fecha' },
  { key: 'usuario', title: 'Usuario' },
  { key: 'tipo', title: 'Tipo' },
  { key: 'resultado', title: 'Resultado', type: 'badge', badgeVariant: (fila) => (fila.esDenegado ? 'danger' : 'success') },
  { key: 'detalle', title: 'Detalle' },
  { key: 'cedula', title: 'Cédula' },
  { key: 'periodo', title: 'Período' },
  { key: 'motivo', title: 'Motivo' },
  { key: 'ip', title: 'IP' },
];

export const COLUMNAS_ACCIONES: TableColumn<AccionFila>[] = [
  { key: 'fecha', title: 'Fecha' },
  { key: 'usuario', title: 'Usuario' },
  { key: 'accion', title: 'Acción' },
  { key: 'periodo', title: 'Período' },
  { key: 'rol', title: 'Rol' },
  { key: 'detalle', title: 'Detalle' },
  { key: 'ip', title: 'IP' },
];

export const COLUMNAS_DENEGADOS: TableColumn<DenegadoFila>[] = [
  { key: 'usuario', title: 'Usuario' },
  { key: 'intentos', title: 'Intentos denegados' },
  { key: 'cedulas', title: 'Cédulas distintas' },
  { key: 'ultimoIntento', title: 'Último intento' },
];

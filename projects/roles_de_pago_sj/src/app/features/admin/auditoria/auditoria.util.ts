import type { DropdownItem } from '@lumen/ui';
import { formatearFechaHora, formatearPeriodo } from '@core/utils';
import type { AccesoAuditoriaResponse, AccionAuditoriaResponse, DenegadosPorUsuarioResponse } from '@models';
import {
  AccesoFila,
  AccionFila,
  DIAS_MAXIMOS,
  DenegadoFila,
  ETIQUETAS_ACCION,
  ETIQUETAS_DETALLE,
  FiltrosAuditoria,
  ModoAuditoria,
  OpcionFiltro,
  PATRON_PERIODO_FILTRO,
} from './auditoria.model';

const MS_POR_DIA = 86_400_000;

export function validarFiltros(filtros: FiltrosAuditoria, modo: ModoAuditoria, hoy: Date): string | null {
  const fin = filtros.hasta || fechaIso(hoy);
  const inicio = filtros.desde || '';
  if (modo !== 'denegados' && filtros.periodo.trim() && !PATRON_PERIODO_FILTRO.test(filtros.periodo.trim())) {
    return 'El período debe tener el formato aaaa-mm, por ejemplo 2026-10';
  }
  if (modo === 'denegados' && (!Number.isInteger(filtros.minimo) || filtros.minimo < 1)) {
    return 'El mínimo de intentos debe ser un número entero de 1 en adelante';
  }
  if (inicio && inicio > fin) {
    return 'La fecha "desde" no puede ser posterior a "hasta"';
  }
  if (inicio && diasEntre(inicio, fin) > DIAS_MAXIMOS) {
    return `El rango máximo es de ${DIAS_MAXIMOS} días`;
  }
  return null;
}

export function parametrosDe(filtros: FiltrosAuditoria, modo: ModoAuditoria): Record<string, string | number> {
  const bruto: Record<string, string | number> =
    modo === 'accesos'
      ? { ...base(filtros), resultado: filtros.resultado, tipo: filtros.tipoAcceso }
      : modo === 'acciones'
        ? { ...base(filtros), tipo: filtros.tipoAccion }
        : { desde: filtros.desde, hasta: filtros.hasta, minimo: filtros.minimo };
  return Object.fromEntries(Object.entries(bruto).filter(([, valor]) => valor !== '' && valor !== undefined));
}

export function aFilasAccesos(accesos: AccesoAuditoriaResponse[]): AccesoFila[] {
  return accesos.map((acceso) => ({
    id: acceso.id,
    fecha: formatearFechaHora(acceso.fecha),
    usuario: acceso.usuario,
    tipo: acceso.tipoAcceso === 'CONSULTA_PROPIA' ? 'Propia' : 'De otra persona',
    resultado: acceso.resultado === 'PERMITIDO' ? 'Permitido' : 'Denegado',
    esDenegado: acceso.resultado === 'DENEGADO',
    detalle: ETIQUETAS_DETALLE[acceso.detalle] ?? acceso.detalle,
    cedula: acceso.cedulaEnmascarada ?? '—',
    periodo: acceso.periodo ? formatearPeriodo(acceso.periodo) : '—',
    motivo: acceso.motivo ?? '—',
    ip: acceso.ip ?? '—',
  }));
}

export function aFilasAcciones(acciones: AccionAuditoriaResponse[]): AccionFila[] {
  return acciones.map((accion) => ({
    id: accion.id,
    fecha: formatearFechaHora(accion.fecha),
    usuario: accion.usuario,
    accion: ETIQUETAS_ACCION[accion.tipoAccion] ?? accion.tipoAccion,
    periodo: accion.periodo ? formatearPeriodo(accion.periodo) : '—',
    rol: accion.rolPagoId !== null ? `#${accion.rolPagoId}` : '—',
    detalle: accion.detalle ?? '—',
    ip: accion.ip ?? '—',
  }));
}

export function aFilasDenegados(denegados: DenegadosPorUsuarioResponse[]): DenegadoFila[] {
  return denegados.map((denegado) => ({
    usuario: denegado.usuario,
    intentos: denegado.intentos,
    cedulas: denegado.cedulasDistintas,
    ultimoIntento: formatearFechaHora(denegado.ultimoIntento),
  }));
}

export function opcionesDeFiltro(opciones: OpcionFiltro[], seleccionado: string): DropdownItem[] {
  return opciones.map((opcion) => ({
    id: opcion.valor === '' ? 'todos' : opcion.valor,
    label: opcion.etiqueta,
    icon: opcion.valor === seleccionado ? '@tui.check' : undefined,
    variant: opcion.valor === seleccionado ? 'brand' : 'default',
  }));
}

export function etiquetaDeFiltro(opciones: OpcionFiltro[], seleccionado: string, titulo: string): string {
  return `${titulo}: ${opciones.find((opcion) => opcion.valor === seleccionado)?.etiqueta ?? opciones[0].etiqueta}`;
}

export function valorDeOpcion(id: string | undefined): string {
  return !id || id === 'todos' ? '' : id;
}

function base(filtros: FiltrosAuditoria): Record<string, string> {
  return { desde: filtros.desde, hasta: filtros.hasta, usuario: filtros.usuario.trim(), periodo: filtros.periodo.trim() };
}

function fechaIso(fecha: Date): string {
  return `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, '0')}-${String(fecha.getDate()).padStart(2, '0')}`;
}

function diasEntre(inicio: string, fin: string): number {
  const [a1, m1, d1] = inicio.split('-').map(Number);
  const [a2, m2, d2] = fin.split('-').map(Number);
  return Math.round((Date.UTC(a2, m2 - 1, d2) - Date.UTC(a1, m1 - 1, d1)) / MS_POR_DIA);
}

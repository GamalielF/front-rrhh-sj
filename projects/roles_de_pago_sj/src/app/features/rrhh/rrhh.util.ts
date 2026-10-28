import { ValidatorFn } from '@angular/forms';
import type { DropdownItem } from '@lumen/ui';
import { formatearFechaHora, formatearPeriodo, formatearTamano } from '@core/utils';
import type { PeriodoResumenResponse, RolPagoResumenResponse } from '@models';
import { env } from '@env';
import { describirNotificacion } from './notificacion-rol.util';
import { PATRON_PERIODO, PERIODO_MINIMO, PeriodoFila, RolFila } from './rrhh.model';

export function aFilasPeriodos(periodos: PeriodoResumenResponse[]): PeriodoFila[] {
  return periodos.map((periodo) => ({
    periodo: periodo.periodo,
    mes: formatearPeriodo(periodo.periodo),
    estado: periodo.estado,
    estadoEtiqueta: periodo.estado === 'PUBLICADO' ? 'Publicado' : 'En preparación',
    rolesActivos: periodo.rolesActivos,
    publicadoEl: formatearFechaHora(periodo.fechaPublicacion),
    publicadoPor: periodo.publicadoPor ?? '—',
  }));
}

export function aFilasRoles(roles: RolPagoResumenResponse[], publicado = false): RolFila[] {
  return roles.map((rol) => {
    const aviso = describirNotificacion(rol.notificacion, publicado);
    return {
      id: rol.id,
      cedula: rol.cedula,
      nombre: rol.nombre ?? '—',
      estado: rol.estado,
      estadoEtiqueta: rol.estado === 'ACTIVO' ? 'Activo' : 'Inactivo',
      notificacion: aviso.etiqueta,
      notificacionVariante: aviso.variante,
      notificacionDetalle: aviso.detalle,
      reenviable: aviso.reenviable,
      tamano: formatearTamano(rol.tamanoBytes),
      actualizadoEn: formatearFechaHora(rol.actualizadoEn),
    };
  });
}

export function filtrarRoles(filas: RolFila[], texto: string): RolFila[] {
  const buscado = normalizar(texto);
  return buscado ? filas.filter((fila) => normalizar(`${fila.cedula} ${fila.nombre} ${fila.notificacion}`).includes(buscado)) : filas;
}

export function resumirNombres(nombres: string[], maximo: number): string {
  if (nombres.length <= maximo) {
    return nombres.join(', ');
  }
  return `${nombres.slice(0, maximo).join(', ')} y ${nombres.length - maximo} más`;
}

function normalizar(texto: string): string {
  return texto.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase().trim();
}

export function periodoActual(hoy: Date): string {
  return `${hoy.getFullYear()}-${String(hoy.getMonth() + 1).padStart(2, '0')}`;
}

export function sumarMeses(periodo: string, meses: number): string {
  const [anio, mes] = periodo.split('-').map(Number);
  const total = anio * 12 + (mes - 1) + meses;
  return `${Math.floor(total / 12)}-${String((total % 12) + 1).padStart(2, '0')}`;
}

export function mesSiguiente(periodo: string): string {
  return sumarMeses(periodo, 1);
}

export function periodoMasReciente(periodos: PeriodoResumenResponse[]): string | null {
  return periodos.reduce<string | null>((reciente, { periodo }) => (!reciente || periodo > reciente ? periodo : reciente), null);
}

export function ultimoPeriodoPermitido(hoy: Date, mesesFuturos = env.mesesFuturosPermitidos): string {
  return sumarMeses(periodoActual(hoy), mesesFuturos);
}

export function esPeriodoEnRango(periodo: string, hoy: Date, mesesFuturos = env.mesesFuturosPermitidos): boolean {
  return periodo >= PERIODO_MINIMO && periodo <= ultimoPeriodoPermitido(hoy, mesesFuturos);
}

export function periodoEnRango(hoy: () => Date, mesesFuturos = env.mesesFuturosPermitidos): ValidatorFn {
  return (control) => {
    const periodo = String(control.value ?? '');
    return !PATRON_PERIODO.test(periodo) || esPeriodoEnRango(periodo, hoy(), mesesFuturos) ? null : { fueraDeRango: true };
  };
}

export function sugerirPeriodoNuevo(periodos: string[], hoy: Date, mesesFuturos = env.mesesFuturosPermitidos): string {
  const reciente = periodos.reduce<string | null>((mayor, periodo) => (!mayor || periodo > mayor ? periodo : mayor), null);
  const sugerido = reciente ? mesSiguiente(reciente) : periodoActual(hoy);
  return esPeriodoEnRango(sugerido, hoy, mesesFuturos) ? sugerido : '';
}

export function opcionesDePeriodos(filas: PeriodoFila[], seleccionado: string): DropdownItem[] {
  const opciones: DropdownItem[] = filas.map((fila) => ({
    id: fila.periodo,
    label: fila.mes,
    description: describirPeriodo(fila),
    badge: fila.estadoEtiqueta,
    badgeVariant: fila.estado === 'PUBLICADO' ? 'success' : 'warning',
    icon: fila.periodo === seleccionado ? '@tui.check' : undefined,
    variant: fila.periodo === seleccionado ? 'brand' : 'default',
  }));
  if (PATRON_PERIODO.test(seleccionado) && !filas.some((fila) => fila.periodo === seleccionado)) {
    opciones.unshift({
      id: seleccionado,
      label: formatearPeriodo(seleccionado),
      description: 'Se creará al cargar su primer rol',
      badge: 'Nuevo',
      badgeVariant: 'info',
      icon: '@tui.check',
      variant: 'brand',
    });
  }
  return opciones;
}

function describirPeriodo(fila: PeriodoFila): string {
  return fila.estado === 'PUBLICADO'
    ? `${fila.rolesActivos} roles · publicado el ${fila.publicadoEl} por ${fila.publicadoPor}`
    : `${fila.rolesActivos} roles cargados`;
}

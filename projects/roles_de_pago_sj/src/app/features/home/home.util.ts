import { formatearFechaHora } from '@core/utils';
import type { DenegadosPorUsuarioResponse, EstadoDirectorioResponse, NombreRol } from '@models';
import {
  ACCESOS_RAPIDOS,
  AccesoRapido,
  AlertaAdmin,
  DIAS_DE_DENEGADOS,
  DIAS_SIN_SINCRONIZAR,
  MINIMO_DENEGADOS,
  NOMBRES_DE_DENEGADOS_VISIBLES,
} from './home.model';

const MS_POR_DIA = 86_400_000;

export function accesosRapidosDe(roles: readonly NombreRol[]): AccesoRapido[] {
  return ACCESOS_RAPIDOS.filter((acceso) => acceso.roles.some((rol) => roles.includes(rol)));
}

export function diasDesde(fechaHora: string, hoy: Date): number {
  const partes = /^(\d{4})-(\d{2})-(\d{2})/.exec(fechaHora);
  if (!partes) {
    return 0;
  }
  const antes = Date.UTC(Number(partes[1]), Number(partes[2]) - 1, Number(partes[3]));
  const ahora = Date.UTC(hoy.getFullYear(), hoy.getMonth(), hoy.getDate());
  return Math.max(0, Math.round((ahora - antes) / MS_POR_DIA));
}

export function alertasDeDirectorio(estado: EstadoDirectorioResponse, hoy: Date): AlertaAdmin[] {
  const ruta = '/admin/directorio';
  if (estado.resultadoUltima === 'FALLIDA') {
    const motivo = estado.mensajeUltima ? `: ${estado.mensajeUltima}` : '.';
    return [{ variante: 'danger', mensaje: `La última sincronización del directorio falló${motivo}`, ruta }];
  }
  if (!estado.ultimaSincronizacion) {
    return [{ variante: 'warning', mensaje: 'El directorio todavía no se ha sincronizado con el AD.', ruta }];
  }
  const dias = diasDesde(estado.ultimaSincronizacion, hoy);
  if (dias > DIAS_SIN_SINCRONIZAR) {
    const ultima = formatearFechaHora(estado.ultimaSincronizacion);
    return [{ variante: 'warning', mensaje: `El directorio no se sincroniza hace ${dias} días (última vez: ${ultima}).`, ruta }];
  }
  return [];
}

export function alertasDeDenegados(denegados: DenegadosPorUsuarioResponse[]): AlertaAdmin[] {
  if (denegados.length === 0) {
    return [];
  }
  const nombres = denegados
    .slice(0, NOMBRES_DE_DENEGADOS_VISIBLES)
    .map((denegado) => `${denegado.usuario} (${denegado.intentos})`)
    .join(', ');
  const resto = denegados.length - NOMBRES_DE_DENEGADOS_VISIBLES;
  const mas = resto > 0 ? ` y ${resto} más` : '';
  const quienes = denegados.length === 1 ? '1 usuario tiene' : `${denegados.length} usuarios tienen`;
  return [
    {
      variante: 'warning',
      mensaje: `${quienes} ${MINIMO_DENEGADOS} o más intentos denegados en los últimos ${DIAS_DE_DENEGADOS} días: ${nombres}${mas}.`,
      ruta: '/admin/auditoria',
    },
  ];
}

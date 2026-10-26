import type { PerfilDirectorioResponse, ResultadoSincronizacionResponse } from '@models';
import type { DatoSincronizacion, PerfilFila } from './directorio.model';

export function aFilasPerfiles(perfiles: PerfilDirectorioResponse[]): PerfilFila[] {
  return perfiles.map((perfil) => ({
    username: perfil.username,
    nombre: perfil.nombreCompleto ?? '—',
    cargo: perfil.cargo ?? '—',
    correo: perfil.email ?? '—',
    estado: perfil.estado,
    estadoEtiqueta: perfil.estado === 'ACTIVO' ? 'Activo' : 'De baja',
    cedula: perfil.cedula ?? '—',
  }));
}

export function datosDeSincronizacion(resultado: ResultadoSincronizacionResponse): DatoSincronizacion[] {
  return [
    { etiqueta: 'recibidos del AD', valor: resultado.recibidos, variante: 'neutral' },
    { etiqueta: 'nuevos', valor: resultado.creados, variante: 'success' },
    { etiqueta: 'actualizados', valor: resultado.actualizados, variante: 'info' },
    { etiqueta: 'sin cambios', valor: resultado.sinCambios, variante: 'neutral' },
    { etiqueta: 'dados de baja', valor: resultado.inactivados, variante: resultado.inactivados > 0 ? 'warning' : 'neutral' },
    { etiqueta: 'omitidos', valor: resultado.omitidos, variante: resultado.omitidos > 0 ? 'warning' : 'neutral' },
    {
      etiqueta: 'con dígito verificador inválido',
      valor: resultado.cedulasConDigitoInvalido,
      variante: resultado.cedulasConDigitoInvalido > 0 ? 'warning' : 'neutral',
    },
  ];
}

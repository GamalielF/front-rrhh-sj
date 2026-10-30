import type { RolPagoResumenResponse } from '@models';
import { aFilasRoles } from './rrhh.util';

const rol = (cambios: Partial<RolPagoResumenResponse> = {}): RolPagoResumenResponse => ({
  id: 1,
  cedula: '1712345675',
  nombre: 'PEREZ JUAN',
  estado: 'ACTIVO',
  tamanoBytes: 2048,
  actualizadoEn: '2026-10-22T16:53:39',
  actualizadoPor: 'fsepa',
  ...cambios,
});

describe('aFilasRoles: detalle corto y grupo del aviso', () => {
  it('un detalle largo se acorta para la tabla, y el completo queda para el CSV', () => {
    const [fila] = aFilasRoles(
      [rol({ notificacion: { estado: 'FALLIDA', intentos: 1, enviadaEn: null, proximoIntento: null, ultimoError: 'La URL de la API de correo lleva llaves { }: parece una plantilla de Postman; escriba la dirección real' } })],
      true,
    );
    expect(fila.notificacionDetalleCorto.length).toBeLessThanOrEqual(70);
    expect(fila.notificacionDetalleCorto.endsWith('…')).toBe(true);
    expect(fila.notificacionDetalle).toContain('escriba la dirección real');
  });

  it('un detalle corto se deja tal cual', () => {
    const [fila] = aFilasRoles([rol()], false);
    expect(fila.notificacionDetalleCorto).toBe('Se avisará al publicar');
  });

  it('cada fila trae el grupo de su aviso', () => {
    const base = { intentos: 1, enviadaEn: null, proximoIntento: null, ultimoError: null };
    const grupos = aFilasRoles(
      [
        rol({ id: 1 }),
        rol({ id: 2, notificacion: { ...base, estado: 'ENVIADA' } }),
        rol({ id: 3, notificacion: { ...base, estado: 'PENDIENTE' } }),
        rol({ id: 4, notificacion: { ...base, estado: 'FALLIDA' } }),
        rol({ id: 5, notificacion: { ...base, estado: 'OMITIDA' } }),
      ],
      true,
    ).map((fila) => fila.grupoNotificacion);
    expect(grupos).toEqual(['SIN_AVISO', 'NOTIFICADO', 'EN_COLA', 'PROBLEMA', 'PROBLEMA']);
  });
});

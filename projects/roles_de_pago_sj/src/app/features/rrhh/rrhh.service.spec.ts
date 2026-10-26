import { TestBed } from '@angular/core/testing';
import { firstValueFrom, of } from 'rxjs';
import { ApiService } from '@lumen/http';
import { RrhhService } from './rrhh.service';

describe('RrhhService', () => {
  const api = { get: vi.fn(), post: vi.fn() };
  const servicio = () => TestBed.inject(RrhhService);

  beforeEach(() => {
    api.get.mockReset().mockReturnValue(of({ content: 'resultado' }));
    api.post.mockReset().mockReturnValue(of({ content: 'resultado' }));
    TestBed.configureTestingModule({ providers: [{ provide: ApiService, useValue: api }] });
  });

  it('consulta la cobertura del período', async () => {
    expect(await firstValueFrom(servicio().cobertura('2026-09'))).toBe('resultado');
    expect(api.get.mock.calls[0][0]).toMatch(/rrhh\/periodos\/2026-09\/cobertura$/);
  });

  it('inactivar y activar un rol son POST a la ruta del rol, sin cuerpo útil', async () => {
    await firstValueFrom(servicio().inactivarRol('2026-09', 7));
    await firstValueFrom(servicio().activarRol('2026-09', 7));
    expect(api.post.mock.calls[0][0]).toMatch(/rrhh\/periodos\/2026-09\/roles-pago\/7\/inactivar$/);
    expect(api.post.mock.calls[1][0]).toMatch(/rrhh\/periodos\/2026-09\/roles-pago\/7\/activar$/);
  });

  it('ver el rol de otra persona envía el motivo en el cuerpo', async () => {
    await firstValueFrom(servicio().verRol('2026-09', 7, 'Revisión solicitada por el empleado'));
    const [direccion, cuerpo] = api.post.mock.calls[0];
    expect(direccion).toMatch(/rrhh\/periodos\/2026-09\/roles-pago\/7\/ver$/);
    expect(cuerpo).toEqual({ motivo: 'Revisión solicitada por el empleado' });
  });

  it('publicar envía la confirmación de faltantes tal cual', async () => {
    await firstValueFrom(servicio().publicar('2026-09', { confirmarFaltantes: true }));
    expect(api.post.mock.calls[0][0]).toMatch(/rrhh\/periodos\/2026-09\/publicar$/);
    expect(api.post.mock.calls[0][1]).toEqual({ confirmarFaltantes: true });
  });
});

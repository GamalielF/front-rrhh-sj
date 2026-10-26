import { TestBed } from '@angular/core/testing';
import { firstValueFrom, of } from 'rxjs';
import { ApiService } from '@lumen/http';
import { NotificacionesService } from './notificaciones-periodo.service';

describe('NotificacionesService', () => {
  const api = { get: vi.fn(), post: vi.fn() };

  beforeEach(() => {
    api.get.mockReset().mockReturnValue(of({ content: 'informe' }));
    api.post.mockReset().mockReturnValue(of({ content: 'resultado' }));
    TestBed.configureTestingModule({ providers: [{ provide: ApiService, useValue: api }] });
  });

  it('usa las rutas de avisos del período', async () => {
    const servicio = TestBed.inject(NotificacionesService);
    expect(await firstValueFrom(servicio.informe('2026-09'))).toBe('informe');
    await firstValueFrom(servicio.generar('2026-09'));
    await firstValueFrom(servicio.reintentar('2026-09'));
    expect(api.get.mock.calls[0][0]).toMatch(/rrhh\/periodos\/2026-09\/notificaciones$/);
    expect(api.post.mock.calls[0][0]).toMatch(/rrhh\/periodos\/2026-09\/notificaciones\/generar$/);
    expect(api.post.mock.calls[1][0]).toMatch(/rrhh\/periodos\/2026-09\/notificaciones\/reintentar$/);
  });
});

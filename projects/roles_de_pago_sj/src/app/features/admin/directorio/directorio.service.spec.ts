import { TestBed } from '@angular/core/testing';
import { firstValueFrom, of } from 'rxjs';
import { ApiService } from '@lumen/http';
import { DirectorioService } from './directorio.service';

describe('DirectorioService', () => {
  const api = { get: vi.fn(), post: vi.fn() };

  beforeEach(() => {
    api.get.mockReset().mockReturnValue(of({ content: 'estado' }));
    api.post.mockReset().mockReturnValue(of({ content: 'resultado' }));
    TestBed.configureTestingModule({ providers: [{ provide: ApiService, useValue: api }] });
  });

  it('usa las rutas del directorio y envía la cédula en el cuerpo, nunca en la dirección', async () => {
    const servicio = TestBed.inject(DirectorioService);
    expect(await firstValueFrom(servicio.estado())).toBe('estado');
    await firstValueFrom(servicio.sincronizar());
    await firstValueFrom(servicio.buscarPorCedula('1712345675'));
    expect(api.get.mock.calls[0][0]).toMatch(/admin\/directorio\/estado$/);
    expect(api.post.mock.calls[0][0]).toMatch(/admin\/directorio\/sincronizar$/);
    const [direccion, cuerpo] = api.post.mock.calls[1];
    expect(direccion).toMatch(/admin\/directorio\/buscar$/);
    expect(direccion).not.toContain('1712345675');
    expect(cuerpo).toEqual({ cedula: '1712345675' });
  });
});

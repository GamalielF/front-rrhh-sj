import { TestBed } from '@angular/core/testing';
import { firstValueFrom, of } from 'rxjs';
import { ApiService } from '@lumen/http';
import { UsuariosService } from './usuarios.service';

describe('UsuariosService', () => {
  const api = { get: vi.fn(), post: vi.fn() };
  const servicio = () => TestBed.inject(UsuariosService);

  beforeEach(() => {
    api.get.mockReset().mockReturnValue(of({ content: 'resultado' }));
    api.post.mockReset().mockReturnValue(of({ content: 'resultado' }));
    TestBed.configureTestingModule({ providers: [{ provide: ApiService, useValue: api }] });
  });

  it('busca con la página y el tamaño, y agrega el texto solo si hay', async () => {
    await firstValueFrom(servicio().buscar('  perez ', 2, 20));
    await firstValueFrom(servicio().buscar('   ', 0, 50));
    expect(api.get.mock.calls[0][0]).toMatch(/admin\/usuarios$/);
    expect(api.get.mock.calls[0][1]).toEqual({ params: { pagina: 2, tamano: 20, buscar: 'perez' } });
    expect(api.get.mock.calls[1][1]).toEqual({ params: { pagina: 0, tamano: 50 } });
  });

  it('consulta a los privilegiados', async () => {
    await firstValueFrom(servicio().privilegiados());
    expect(api.get.mock.calls[0][0]).toMatch(/admin\/usuarios\/privilegiados$/);
  });

  it('otorgar RRHH envía el permiso de ver roles ajenos de forma explícita', async () => {
    await firstValueFrom(servicio().aplicar('jperez', { tipo: 'otorgar', rol: 'RRHH', verRolesAjenos: false }));
    const [direccion, cuerpo] = api.post.mock.calls[0];
    expect(direccion).toMatch(/admin\/usuarios\/jperez\/roles\/RRHH\/otorgar$/);
    expect(cuerpo).toEqual({ verRolesAjenos: false });
  });

  it('otorgar ADMIN no envía ningún permiso', async () => {
    await firstValueFrom(servicio().aplicar('jperez', { tipo: 'otorgar', rol: 'ADMIN' }));
    expect(api.post.mock.calls[0][0]).toMatch(/roles\/ADMIN\/otorgar$/);
    expect(api.post.mock.calls[0][1]).toEqual({});
  });

  it('revocar es un POST a la ruta del rol, y el usuario viaja codificado', async () => {
    await firstValueFrom(servicio().aplicar('j.perez@x', { tipo: 'revocar', rol: 'RRHH' }));
    expect(api.post.mock.calls[0][0]).toMatch(/admin\/usuarios\/j\.perez%40x\/roles\/RRHH\/revocar$/);
  });
});

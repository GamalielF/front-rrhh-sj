import { HttpErrorResponse } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { firstValueFrom, of, throwError } from 'rxjs';
import { AuthService } from '@lumen/auth';
import { ApiService } from '@lumen/http';
import type { PerfilResponse } from '@models';
import { PerfilAplicacionService } from './perfil-aplicacion.service';

const perfilDe = (username: string, roles: PerfilResponse['roles']): PerfilResponse => ({
  username,
  nombre: null,
  cargo: null,
  cedulaEnmascarada: null,
  puedeConsultarSuRol: true,
  roles,
  permisos: [],
});

describe('PerfilAplicacionService', () => {
  const api = { get: vi.fn() };
  const auth = { getUser: vi.fn(), getUsernameFromToken: vi.fn() };

  beforeEach(() => {
    api.get.mockReset();
    auth.getUser.mockReset();
    auth.getUsernameFromToken.mockReset();
    TestBed.configureTestingModule({
      providers: [
        { provide: ApiService, useValue: api },
        { provide: AuthService, useValue: auth },
      ],
    });
  });

  it('consulta mi-perfil una sola vez mientras sea el mismo usuario', async () => {
    auth.getUser.mockReturnValue({ username: 'fsepa' });
    api.get.mockReturnValue(of({ content: perfilDe('fsepa', ['ADMIN', 'EMPLEADO']) }));
    const servicio = TestBed.inject(PerfilAplicacionService);
    expect((await firstValueFrom(servicio.perfil()))?.roles).toContain('ADMIN');
    await firstValueFrom(servicio.perfil());
    expect(api.get).toHaveBeenCalledTimes(1);
    expect(api.get.mock.calls[0][0]).toContain('mi-perfil');
  });

  it('si entra otra persona no reutiliza los roles de la anterior', async () => {
    api.get
      .mockReturnValueOnce(of({ content: perfilDe('fsepa', ['ADMIN']) }))
      .mockReturnValueOnce(of({ content: perfilDe('jperez', ['EMPLEADO']) }));
    const servicio = TestBed.inject(PerfilAplicacionService);
    auth.getUser.mockReturnValue({ username: 'fsepa' });
    expect((await firstValueFrom(servicio.perfil()))?.roles).toEqual(['ADMIN']);
    auth.getUser.mockReturnValue({ username: 'jperez' });
    expect((await firstValueFrom(servicio.perfil()))?.roles).toEqual(['EMPLEADO']);
    expect(api.get).toHaveBeenCalledTimes(2);
  });

  it('un fallo devuelve null y no se queda guardado: el siguiente intento vuelve a consultar', async () => {
    auth.getUser.mockReturnValue({ username: 'fsepa' });
    api.get
      .mockReturnValueOnce(throwError(() => new HttpErrorResponse({ status: 0 })))
      .mockReturnValueOnce(of({ content: perfilDe('fsepa', ['RRHH']) }));
    const servicio = TestBed.inject(PerfilAplicacionService);
    expect(await firstValueFrom(servicio.perfil())).toBeNull();
    expect((await firstValueFrom(servicio.perfil()))?.roles).toEqual(['RRHH']);
  });
});

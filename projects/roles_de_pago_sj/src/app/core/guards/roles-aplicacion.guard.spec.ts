import { TestBed } from '@angular/core/testing';
import { Router, UrlTree, provideRouter } from '@angular/router';
import { Observable, of } from 'rxjs';
import { PerfilAplicacionService } from '@services';
import type { PerfilResponse } from '@models';
import { rolesAplicacionGuard } from './roles-aplicacion.guard';

const perfil = (roles: PerfilResponse['roles']): PerfilResponse => ({
  username: 'x',
  nombre: null,
  cargo: null,
  cedulaEnmascarada: null,
  puedeConsultarSuRol: true,
  roles,
  permisos: [],
});

describe('rolesAplicacionGuard', () => {
  const evaluar = (resultado: PerfilResponse | null) => {
    TestBed.configureTestingModule({
      providers: [provideRouter([]), { provide: PerfilAplicacionService, useValue: { perfil: () => of(resultado) } }],
    });
    return TestBed.runInInjectionContext(() => rolesAplicacionGuard('RRHH', 'ADMIN')({} as never, {} as never)) as Observable<
      boolean | UrlTree
    >;
  };

  it('deja pasar a RRHH y a ADMIN', () => {
    let valor: boolean | UrlTree | undefined;
    evaluar(perfil(['RRHH', 'EMPLEADO'])).subscribe((v) => (valor = v));
    expect(valor).toBe(true);
  });

  it('manda a Inicio a un empleado y a quien no tiene perfil', () => {
    const router = () => TestBed.inject(Router);
    let valor: boolean | UrlTree | undefined;
    evaluar(perfil(['EMPLEADO'])).subscribe((v) => (valor = v));
    expect(router().serializeUrl(valor as UrlTree)).toBe('/home');
    TestBed.resetTestingModule();
    evaluar(null).subscribe((v) => (valor = v));
    expect(router().serializeUrl(valor as UrlTree)).toBe('/home');
  });
});

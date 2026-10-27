import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, CanActivateFn, Route, Router, RouterStateSnapshot, UrlTree, provideRouter } from '@angular/router';
import { Observable, firstValueFrom, of } from 'rxjs';
import { PerfilAplicacionService } from '@services';
import { routes } from './app.routes';

const principal = routes.find((ruta) => ruta.path === '') as Route;
const hijas = principal.children as Route[];
const hija = (path: string) => hijas.find((ruta) => ruta.path === path) as Route;

describe('rutas de la aplicación', () => {
  const entrar = async (ruta: Route, roles: string[]) => {
    TestBed.configureTestingModule({
      providers: [provideRouter([]), { provide: PerfilAplicacionService, useValue: { perfil: () => of({ roles, permisos: [] }) } }],
    });
    const guardian = ruta.canActivate?.[0] as CanActivateFn;
    const resultado = TestBed.runInInjectionContext(() => guardian({} as ActivatedRouteSnapshot, {} as RouterStateSnapshot));
    const valor = await firstValueFrom(resultado as Observable<boolean | UrlTree>);
    return valor === true ? 'permitido' : TestBed.inject(Router).serializeUrl(valor as UrlTree);
  };

  it('todo exige sesión, menos el inicio de sesión', () => {
    expect(principal.canActivate).toHaveLength(1);
    expect(routes.find((ruta) => ruta.path === 'login')?.canActivate).toBeUndefined();
  });

  it('Mi rol de pago e Inicio no piden ningún rol especial', () => {
    expect(hija('home').canActivate).toBeUndefined();
    expect(hija('mi-rol').canActivate).toBeUndefined();
  });

  it('Períodos deja pasar a RRHH y a ADMIN, y devuelve a Inicio a un empleado', async () => {
    expect(await entrar(hija('rrhh/periodos'), ['RRHH', 'EMPLEADO'])).toBe('permitido');
    TestBed.resetTestingModule();
    expect(await entrar(hija('rrhh/periodos'), ['ADMIN', 'EMPLEADO'])).toBe('permitido');
    TestBed.resetTestingModule();
    expect(await entrar(hija('rrhh/periodos'), ['EMPLEADO'])).toBe('/home');
  });

  it('la administración es solo para ADMIN: RRHH tampoco entra escribiendo la dirección', async () => {
    expect(await entrar(hija('admin'), ['ADMIN', 'EMPLEADO'])).toBe('permitido');
    TestBed.resetTestingModule();
    expect(await entrar(hija('admin'), ['RRHH', 'EMPLEADO'])).toBe('/home');
    TestBed.resetTestingModule();
    expect(await entrar(hija('admin'), ['EMPLEADO'])).toBe('/home');
  });

  it('ya no existen las pantallas de prueba de la plantilla', () => {
    expect(hijas.some((ruta) => ruta.path === 'test')).toBe(false);
  });

  it('una dirección desconocida lleva a Inicio', () => {
    expect(routes.at(-1)).toEqual({ path: '**', redirectTo: 'home' });
  });
});

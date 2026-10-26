import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { BehaviorSubject, of } from 'rxjs';
import { AuthService, UserSession } from '@lumen/auth';
import { PerfilAplicacionService } from '@services';
import type { NombreRol } from '@models';
import { DashboardShellComponent } from './dashboard.component';

describe('DashboardShellComponent', () => {
  const sesion$ = new BehaviorSubject<UserSession | null>(null);

  const mostrar = (roles: NombreRol[]) => {
    sesion$.next({ username: 'fsepa', name: 'SEPA MORA FABIO GAMALIEL', roles: ['ANALISTA DE TECNOLOGIA'] });
    TestBed.configureTestingModule({
      imports: [DashboardShellComponent],
      providers: [
        provideRouter([]),
        { provide: AuthService, useValue: { user$: sesion$, logout: vi.fn() } },
        { provide: PerfilAplicacionService, useValue: { perfil: () => of({ roles }) } },
      ],
    });
    const fixture = TestBed.createComponent(DashboardShellComponent);
    fixture.detectChanges();
    return (fixture.nativeElement as HTMLElement).textContent ?? '';
  };

  it('el menú de un administrador incluye Períodos', () => {
    expect(mostrar(['ADMIN', 'EMPLEADO'])).toContain('Períodos');
  });

  it('solo un administrador ve las opciones de administración', () => {
    const admin = mostrar(['ADMIN', 'EMPLEADO']);
    expect(admin).toContain('Usuarios y roles');
    expect(admin).toContain('Directorio');
    TestBed.resetTestingModule();
    const rrhh = mostrar(['RRHH', 'EMPLEADO']);
    expect(rrhh).toContain('Períodos');
    expect(rrhh).not.toContain('Usuarios y roles');
    expect(rrhh).not.toContain('Directorio');
  });

  it('el menú de un empleado no incluye Períodos pero sí su rol de pago', () => {
    const texto = mostrar(['EMPLEADO']);
    expect(texto).toContain('Mi rol de pago');
    expect(texto).not.toContain('Períodos');
  });

  it('el encabezado conserva el formato original de Lumen (primer apellido y primer nombre, con el cargo)', () => {
    const texto = mostrar(['ADMIN']);
    expect(texto).toContain('SEPA FABIO');
    expect(texto).toContain('ANALISTA DE TECNOLOGIA');
  });
});

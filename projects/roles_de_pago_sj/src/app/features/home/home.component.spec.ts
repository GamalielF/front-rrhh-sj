import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { PerfilAplicacionService } from '@services';
import { AlertasAdminService } from './alertas-admin';
import { EstadoPeriodoService } from './estado-periodo';
import { HomeComponent } from './home.component';
import { MiRolPagoService } from '../mi-rol-pago';

describe('HomeComponent', () => {
  const mostrar = (roles: string[]) => {
    TestBed.configureTestingModule({
      imports: [HomeComponent],
      providers: [
        provideRouter([]),
        { provide: PerfilAplicacionService, useValue: { perfil: () => of({ roles, permisos: [] }) } },
        { provide: MiRolPagoService, useValue: { periodos: () => of(['2026-10']) } },
        { provide: EstadoPeriodoService, useValue: { cargar: () => of({ periodo: null, existeActual: true, resumen: null, cobertura: null, informe: null }) } },
        { provide: AlertasAdminService, useValue: { cargar: () => of({ alertas: [], incompleto: false }) } },
      ],
    });
    const fixture = TestBed.createComponent(HomeComponent);
    fixture.detectChanges();
    return fixture.nativeElement as HTMLElement;
  };

  it('un empleado ve solo su tarjeta de rol de pago', () => {
    const html = mostrar(['EMPLEADO']);
    expect(html.querySelector('app-rol-reciente')).not.toBeNull();
    expect(html.querySelector('app-estado-periodo')).toBeNull();
    expect(html.querySelector('app-alertas-admin')).toBeNull();
    expect(html.querySelector('app-accesos-rapidos')).toBeNull();
  });

  it('RRHH ve además el estado del período y su acceso rápido, pero no las alertas del administrador', () => {
    const html = mostrar(['RRHH', 'EMPLEADO']);
    expect(html.querySelector('app-estado-periodo')).not.toBeNull();
    expect(html.querySelector('app-accesos-rapidos')).not.toBeNull();
    expect(html.querySelector('app-alertas-admin')).toBeNull();
  });

  it('un administrador lo ve todo', () => {
    const html = mostrar(['ADMIN', 'EMPLEADO']);
    expect(html.querySelector('app-rol-reciente')).not.toBeNull();
    expect(html.querySelector('app-estado-periodo')).not.toBeNull();
    expect(html.querySelector('app-alertas-admin')).not.toBeNull();
    expect(html.querySelector('app-accesos-rapidos')).not.toBeNull();
  });

  it('ya no muestra la tarjeta de documentación de la plantilla', () => {
    expect(mostrar(['ADMIN']).textContent).not.toContain('Documentación');
  });
});

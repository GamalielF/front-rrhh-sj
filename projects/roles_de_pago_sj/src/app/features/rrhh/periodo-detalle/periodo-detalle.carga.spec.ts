import { HttpErrorResponse } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, provideRouter } from '@angular/router';
import { BehaviorSubject, of, throwError } from 'rxjs';
import type { ListadoPeriodoResponse, ResumenPeriodoResponse } from '@models';
import { BreadcrumbService } from '@lumen/ui';
import { PerfilAplicacionService } from '@services';
import { botonReintentar } from '../../../shared/components/error-carga/error-carga.testing';
import { RrhhService } from '../rrhh.service';
import { CargaMasivaService } from './carga-masiva';
import { NotificacionesService } from './notificaciones-periodo';
import { PeriodoDetalleComponent } from './periodo-detalle.component';

const listado: ListadoPeriodoResponse = { periodo: '2026-09', estadoPeriodo: 'CARGADO', activos: 0, inactivos: 0, roles: [] };
const resumen: ResumenPeriodoResponse = {
  periodo: '2026-09',
  estadoPeriodo: 'CARGADO',
  rolesActivos: 0,
  rolesInactivos: 0,
  personasActivas: 0,
  sinRol: 0,
  nombresSinRol: [],
  rolesSinPersonaActiva: 0,
  nombresRolesSinPersona: [],
};

describe('PeriodoDetalleComponent: volver a cargar', () => {
  const servicio = { periodos: vi.fn(), listado: vi.fn(), resumen: vi.fn(), cobertura: vi.fn() };

  beforeEach(() => {
    servicio.periodos.mockReset().mockReturnValue(of([]));
    servicio.listado.mockReset().mockReturnValue(of(listado));
    servicio.resumen.mockReset().mockReturnValue(of(resumen));
    TestBed.configureTestingModule({
      imports: [PeriodoDetalleComponent],
      providers: [
        provideRouter([]),
        { provide: RrhhService, useValue: servicio },
        { provide: CargaMasivaService, useValue: { cargarEnLotes: vi.fn() } },
        { provide: NotificacionesService, useValue: { informe: vi.fn().mockReturnValue(of(null)) } },
        { provide: PerfilAplicacionService, useValue: { perfil: () => of({ roles: ['ADMIN'], permisos: [] }) } },
        { provide: ActivatedRoute, useValue: { paramMap: new BehaviorSubject(convertToParamMap({ periodo: '2026-09' })) } },
      ],
    });
  });

  it('si falla la carga del período ofrece volver a cargar, y al pulsarlo lo pide de nuevo', () => {
    servicio.periodos.mockReturnValueOnce(throwError(() => new HttpErrorResponse({ status: 0 })));
    const fixture = TestBed.createComponent(PeriodoDetalleComponent);
    fixture.detectChanges();
    const html = fixture.nativeElement as HTMLElement;
    expect(html.textContent).toContain('No hay conexión con el servidor');

    botonReintentar(html)?.click();
    fixture.detectChanges();

    expect(servicio.listado).toHaveBeenCalledTimes(2);
    expect(html.textContent).not.toContain('No hay conexión con el servidor');
    expect(botonReintentar(html)).toBeUndefined();
  });

  it('nombra el mes en la ruta de migas, en vez de la palabra "Detalle"', () => {
    const nombrar = vi.spyOn(TestBed.inject(BreadcrumbService), 'setLabel');
    const fixture = TestBed.createComponent(PeriodoDetalleComponent);
    fixture.detectChanges();
    expect(nombrar).toHaveBeenCalledWith('2026-09', 'Septiembre 2026');
  });
});

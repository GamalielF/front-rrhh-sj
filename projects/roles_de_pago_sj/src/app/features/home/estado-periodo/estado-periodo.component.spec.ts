import { botonReintentar } from '../../../shared/components/error-carga/error-carga.testing';
import { HttpErrorResponse } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';
import { EstadoPeriodoComponent } from './estado-periodo.component';
import { EstadoPeriodoService, EstadoReciente } from './estado-periodo.service';

const estado = (cambios: Partial<EstadoReciente> = {}): EstadoReciente => ({
  periodo: '2026-10',
  existeActual: true,
  resumen: { periodo: '2026-10', estadoPeriodo: 'CARGADO', rolesActivos: 118, rolesInactivos: 0, personasActivas: 121, sinRol: 3, nombresSinRol: [], rolesSinPersonaActiva: 0, nombresRolesSinPersona: [] },
  cobertura: null,
  informe: null,
  ...cambios,
});

describe('EstadoPeriodoComponent', () => {
  const servicio = { cargar: vi.fn() };
  let navegar: ReturnType<typeof vi.spyOn>;

  const crear = () => {
    const fixture = TestBed.createComponent(EstadoPeriodoComponent);
    fixture.detectChanges();
    return { fixture, componente: fixture.componentInstance, html: fixture.nativeElement as HTMLElement };
  };

  beforeEach(() => {
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(new Date(2026, 9, 26));
    servicio.cargar.mockReset();
    TestBed.configureTestingModule({
      imports: [EstadoPeriodoComponent],
      providers: [provideRouter([]), { provide: EstadoPeriodoService, useValue: servicio }],
    });
    navegar = vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);
  });

  afterEach(() => vi.useRealTimers());

  it('en preparación muestra el mes, su estado y cuántos roles hay y cuántas personas faltan', () => {
    servicio.cargar.mockReturnValue(of(estado()));
    const { html } = crear();
    expect(html.textContent).toContain('Octubre 2026');
    expect(html.textContent).toContain('En preparación');
    expect(html.textContent).toContain('Roles cargados');
    expect(html.textContent).toContain('118');
    expect(html.textContent).toContain('Personas sin rol');
    expect(html.textContent).not.toContain('Ya abrieron su rol');
  });

  it('publicado suma la lectura y los avisos fallidos', () => {
    servicio.cargar.mockReturnValue(
      of(
        estado({
          resumen: { ...estado().resumen!, estadoPeriodo: 'PUBLICADO' },
          cobertura: { periodo: '2026-10', rolesPublicados: 118, leidos: 59, pendientes: 59, nombresPendientes: [] },
          informe: { periodo: '2026-10', habilitadas: true, total: 118, pendientes: 0, reintentando: 0, enviadas: 116, fallidas: 2, omitidas: 0, problemas: [] },
        }),
      ),
    );
    const { html } = crear();
    expect(html.textContent).toContain('Publicado');
    expect(html.textContent).toContain('59 (50%)');
    expect(html.textContent).toContain('Avisos fallidos');
  });

  it('Abrir lleva al período mostrado', () => {
    servicio.cargar.mockReturnValue(of(estado()));
    const { componente } = crear();
    componente.abrir('2026-10');
    expect(navegar).toHaveBeenCalledWith(['/rrhh/periodos', '2026-10']);
  });

  it('si todavía no existe el período del mes actual lo avisa y ofrece crearlo', () => {
    servicio.cargar.mockReturnValue(of(estado({ periodo: '2026-09', existeActual: false })));
    const { componente, html } = crear();
    expect(html.textContent).toContain('Todavía no existe el período de Octubre 2026');
    expect(html.textContent).toContain('Crear el de Octubre 2026');
    componente.abrir(componente.actual);
    expect(navegar).toHaveBeenCalledWith(['/rrhh/periodos', '2026-10']);
  });

  it('si el período del mes ya existe no ofrece crearlo', () => {
    servicio.cargar.mockReturnValue(of(estado()));
    expect(crear().html.textContent).not.toContain('Crear el de');
  });

  it('sin ningún período lo explica y ofrece crear el del mes', () => {
    servicio.cargar.mockReturnValue(of({ periodo: null, existeActual: false, resumen: null, cobertura: null, informe: null }));
    const { html } = crear();
    expect(html.textContent).toContain('Todavía no hay períodos registrados');
    expect(html.textContent).toContain('Crear el de Octubre 2026');
  });

  it('si no se pudo consultar muestra el motivo', () => {
    servicio.cargar.mockReturnValue(throwError(() => new HttpErrorResponse({ status: 0 })));
    expect(crear().html.textContent).toContain('No hay conexión con el servidor');
  });

  it('si falla la carga ofrece volver a cargar, y al pulsarlo vuelve a pedir el estado', () => {
    servicio.cargar.mockReturnValueOnce(throwError(() => new HttpErrorResponse({ status: 0 }))).mockReturnValue(of(estado()));
    const { fixture, html } = crear();
    expect(html.textContent).toContain('No hay conexión con el servidor');
    botonReintentar(html)?.click();
    fixture.detectChanges();
    expect(servicio.cargar).toHaveBeenCalledTimes(2);
    expect(html.textContent).toContain('Octubre 2026');
    expect(botonReintentar(html)).toBeUndefined();
  });
});

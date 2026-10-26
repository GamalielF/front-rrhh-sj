import { HttpErrorResponse } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import type { PublicacionResponse, ResumenPeriodoResponse } from '@models';
import { RrhhService } from '../../rrhh.service';
import { ResumenPeriodoComponent } from './resumen-periodo.component';

const resumen = (cambios: Partial<ResumenPeriodoResponse> = {}): ResumenPeriodoResponse => ({
  periodo: '2026-09',
  estadoPeriodo: 'CARGADO',
  rolesActivos: 120,
  rolesInactivos: 0,
  personasActivas: 120,
  sinRol: 0,
  nombresSinRol: [],
  rolesSinPersonaActiva: 0,
  nombresRolesSinPersona: [],
  ...cambios,
});

const publicacion: PublicacionResponse = {
  periodo: '2026-09',
  estadoPeriodo: 'PUBLICADO',
  fechaPublicacion: '2026-10-23T10:00:00',
  publicadoPor: 'fsepa',
  rolesPublicados: 120,
  sinRol: 0,
  rolesSinPersonaActiva: 0,
  avisosEncolados: 120,
};

describe('ResumenPeriodoComponent', () => {
  const servicio = { publicar: vi.fn() };

  const crear = (datos: ResumenPeriodoResponse | null) => {
    const fixture = TestBed.createComponent(ResumenPeriodoComponent);
    fixture.componentRef.setInput('periodo', '2026-09');
    fixture.componentRef.setInput('resumen', datos);
    fixture.detectChanges();
    const componente = fixture.componentInstance;
    const publicado = vi.fn();
    componente.publicado.subscribe(publicado);
    return { fixture, componente, publicado, html: fixture.nativeElement as HTMLElement };
  };

  beforeEach(() => {
    servicio.publicar.mockReset();
    TestBed.configureTestingModule({
      imports: [ResumenPeriodoComponent],
      providers: [{ provide: RrhhService, useValue: servicio }],
    });
  });

  it('muestra el cuadre y los nombres de quienes no tienen rol', () => {
    const { html } = crear(resumen({ sinRol: 2, nombresSinRol: ['PEREZ JUAN', 'GARCIA ANA'] }));
    expect(html.textContent).toContain('Roles activos');
    expect(html.textContent).toContain('120');
    expect(html.textContent).toContain('PEREZ JUAN, GARCIA ANA');
  });

  it('sin roles cargados lo explica y no deja publicar', () => {
    const { componente, html } = crear(null);
    expect(html.textContent).toContain('suba los PDF');
    expect(componente.puedePublicar()).toBe(false);
  });

  it('un período ya publicado no se puede publicar de nuevo', () => {
    const { componente, html } = crear(resumen({ estadoPeriodo: 'PUBLICADO' }));
    expect(componente.puedePublicar()).toBe(false);
    expect(html.textContent).toContain('Publicado');
  });

  it('sin diferencias publica sin pedir confirmación de faltantes', () => {
    servicio.publicar.mockReturnValue(of(publicacion));
    const { fixture, componente, publicado, html } = crear(resumen());
    componente.abrirConfirmacion();
    fixture.detectChanges();
    expect(html.textContent).toContain('Esta acción no se puede deshacer');
    expect(html.textContent).not.toContain('Publicar con diferencias');

    componente.publicar();
    fixture.detectChanges();

    expect(servicio.publicar).toHaveBeenCalledWith('2026-09', {});
    expect(publicado).toHaveBeenCalledTimes(1);
    expect(componente.confirmando()).toBe(false);
    expect(html.textContent).toContain('120 avisos por correo en cola');
  });

  it('con diferencias advierte, y publica confirmando los faltantes', () => {
    servicio.publicar.mockReturnValue(of(publicacion));
    const { fixture, componente, html } = crear(resumen({ sinRol: 3, nombresSinRol: ['A', 'B', 'C'] }));
    componente.abrirConfirmacion();
    fixture.detectChanges();
    expect(html.textContent).toContain('Publicar con diferencias');
    expect(html.textContent).toContain('se publicará de todas formas');

    componente.publicar();

    expect(servicio.publicar).toHaveBeenCalledWith('2026-09', { confirmarFaltantes: true });
  });

  it('si el servidor rechaza, muestra el motivo, deja abierta la confirmación y no avisa a la página', () => {
    servicio.publicar.mockReturnValue(
      throwError(() => new HttpErrorResponse({ status: 409, error: { message: 'El periodo 2026-09 ya fue publicado' } })),
    );
    const { fixture, componente, publicado, html } = crear(resumen());
    componente.abrirConfirmacion();
    componente.publicar();
    fixture.detectChanges();
    expect(componente.error()).toBe('El periodo 2026-09 ya fue publicado');
    expect(componente.confirmando()).toBe(true);
    expect(html.textContent).toContain('El periodo 2026-09 ya fue publicado');
    expect(publicado).not.toHaveBeenCalled();
  });
});

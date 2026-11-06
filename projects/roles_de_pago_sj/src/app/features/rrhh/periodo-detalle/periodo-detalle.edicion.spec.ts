import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router, convertToParamMap, provideRouter } from '@angular/router';
import { BehaviorSubject, of } from 'rxjs';
import type { EstadoPeriodo, ListadoPeriodoResponse, ResumenPeriodoResponse } from '@models';
import { PerfilAplicacionService } from '@services';
import { RrhhService } from '../rrhh.service';
import { CargaMasivaService } from './carga-masiva';
import { NotificacionesService } from './notificaciones-periodo';
import { PeriodoDetalleComponent } from './periodo-detalle.component';

const listado = (estadoPeriodo: EstadoPeriodo): ListadoPeriodoResponse => ({
  periodo: '2026-09',
  estadoPeriodo,
  activos: 1,
  inactivos: 0,
  roles: [{ id: 1, cedula: '1712345675', nombre: 'PEREZ JUAN', estado: 'ACTIVO', tamanoBytes: 2048, actualizadoEn: '2026-10-22T16:53:39', actualizadoPor: 'fsepa' }],
});

const resumen = (estadoPeriodo: EstadoPeriodo): ResumenPeriodoResponse => ({
  periodo: '2026-09',
  estadoPeriodo,
  rolesActivos: 1,
  rolesInactivos: 0,
  personasActivas: 1,
  sinRol: 0,
  nombresSinRol: [],
  rolesSinPersonaActiva: 0,
  nombresRolesSinPersona: [],
});

describe('PeriodoDetalleComponent: editar un período publicado', () => {
  const servicio = { periodos: vi.fn(), listado: vi.fn(), resumen: vi.fn(), cobertura: vi.fn(), inactivarRol: vi.fn(), activarRol: vi.fn() };
  const avisos = { informe: vi.fn() };
  const parametros$ = new BehaviorSubject(convertToParamMap({ periodo: '2026-09' }));

  const crear = (estado: 'CARGADO' | 'PUBLICADO') => {
    servicio.listado.mockReturnValue(of(listado(estado)));
    servicio.resumen.mockReturnValue(of(resumen(estado)));
    const fixture = TestBed.createComponent(PeriodoDetalleComponent);
    fixture.detectChanges();
    const html = fixture.nativeElement as HTMLElement;
    const boton = (texto: string) =>
      Array.from(html.querySelectorAll('button')).find((b) => b.textContent?.includes(texto)) as HTMLButtonElement | undefined;
    return { fixture, componente: fixture.componentInstance, html, boton };
  };

  beforeEach(() => {
    servicio.periodos.mockReset().mockReturnValue(of([]));
    servicio.cobertura.mockReset().mockReturnValue(of({ periodo: '2026-09', rolesPublicados: 1, leidos: 0, pendientes: 1, nombresPendientes: [] }));
    servicio.inactivarRol.mockReset().mockReturnValue(of({}));
    servicio.activarRol.mockReset().mockReturnValue(of({}));
    avisos.informe.mockReset().mockReturnValue(
      of({ periodo: '2026-09', habilitadas: true, total: 1, pendientes: 0, reintentando: 0, enviadas: 1, fallidas: 0, omitidas: 0, problemas: [] }),
    );
    parametros$.next(convertToParamMap({ periodo: '2026-09' }));
    TestBed.configureTestingModule({
      imports: [PeriodoDetalleComponent],
      providers: [
        provideRouter([]),
        { provide: RrhhService, useValue: servicio },
        { provide: CargaMasivaService, useValue: { cargarEnLotes: vi.fn() } },
        { provide: NotificacionesService, useValue: avisos },
        { provide: PerfilAplicacionService, useValue: { perfil: () => of({ roles: ['RRHH'], permisos: [] }) } },
        { provide: ActivatedRoute, useValue: { paramMap: parametros$ } },
      ],
    });
    vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);
  });

  it('un período publicado ofrece Editar período y no muestra la carga masiva todavía', () => {
    const { html, boton } = crear('PUBLICADO');
    expect(html.textContent).toContain('Este período ya está publicado');
    expect(boton('Editar período')).toBeDefined();
    expect(html.textContent).not.toContain('Carga masiva de roles');
    expect(html.textContent).not.toContain('Corregir los roles del período');
  });

  it('un período sin publicar sigue como siempre: carga masiva y ningún botón de editar', () => {
    const { html, boton } = crear('CARGADO');
    expect(html.textContent).toContain('Carga masiva de roles');
    expect(boton('Editar período')).toBeUndefined();
  });

  it('al pulsar Editar período advierte lo que implica y muestra la corrección; Terminar edición vuelve', () => {
    const { fixture, componente, html, boton } = crear('PUBLICADO');

    boton('Editar período')!.click();
    fixture.detectChanges();

    expect(componente.editando()).toBe(true);
    expect(html.textContent).toContain('Está editando un período ya publicado');
    expect(html.textContent).toContain('queda en la auditoría');
    expect(html.textContent).toContain('Corregir los roles del período');

    boton('Terminar edición')!.click();
    fixture.detectChanges();

    expect(componente.editando()).toBe(false);
    expect(html.textContent).not.toContain('Corregir los roles del período');
  });

  it('retirar un rol de un período publicado no llama al servidor: primero pide el motivo', () => {
    const { fixture, componente, html } = crear('PUBLICADO');

    componente.inactivar({ id: 1, nombre: 'PEREZ JUAN' } as never);
    fixture.detectChanges();

    expect(servicio.inactivarRol).not.toHaveBeenCalled();
    expect(componente.cambioPendiente()).toMatchObject({ tipo: 'inactivar' });
    expect(html.textContent).toContain('Está por retirar el rol de PEREZ JUAN');
  });

  it('con el motivo confirmado retira el rol, lo envía y vuelve a cargar el período', () => {
    const { componente } = crear('PUBLICADO');
    componente.inactivar({ id: 1, nombre: 'PEREZ JUAN' } as never);
    const listadosAntes = servicio.listado.mock.calls.length;

    componente.confirmarCambio('Se subió a la persona equivocada');

    expect(servicio.inactivarRol).toHaveBeenCalledWith('2026-09', 1, 'Se subió a la persona equivocada');
    expect(componente.cambioPendiente()).toBeNull();
    expect(servicio.listado.mock.calls.length).toBeGreaterThan(listadosAntes);
  });

  it('reponer un rol de un período publicado también pide el motivo y lo envía', () => {
    const { componente } = crear('PUBLICADO');
    componente.activar({ id: 1, nombre: 'PEREZ JUAN' } as never);
    expect(servicio.activarRol).not.toHaveBeenCalled();

    componente.confirmarCambio('Era correcto, se repone');

    expect(servicio.activarRol).toHaveBeenCalledWith('2026-09', 1, 'Era correcto, se repone');
  });

  it('cancelar la ventana del motivo no cambia nada', () => {
    const { fixture, componente } = crear('PUBLICADO');
    componente.inactivar({ id: 1, nombre: 'PEREZ JUAN' } as never);

    componente.cambioPendiente.set(null);
    componente.confirmarCambio('lo que sea, ya no hay cambio pendiente');
    fixture.detectChanges();

    expect(servicio.inactivarRol).not.toHaveBeenCalled();
  });

  it('antes de publicar inactivar sigue siendo directo y sin motivo', () => {
    const { componente } = crear('CARGADO');
    componente.inactivar({ id: 1, nombre: 'PEREZ JUAN' } as never);
    expect(servicio.inactivarRol).toHaveBeenCalledWith('2026-09', 1);
    expect(componente.cambioPendiente()).toBeNull();
  });

  it('al terminar una corrección recarga el período y actualiza el panel de avisos', () => {
    const { componente } = crear('PUBLICADO');
    const informesAntes = avisos.informe.mock.calls.length;
    const listadosAntes = servicio.listado.mock.calls.length;

    componente.cargaTerminada();

    expect(servicio.listado.mock.calls.length).toBe(listadosAntes + 1);
    expect(avisos.informe.mock.calls.length).toBeGreaterThan(informesAntes);
  });

  it('al pasar a otro período se sale del modo edición', () => {
    const { fixture, componente } = crear('PUBLICADO');
    componente.editando.set(true);

    parametros$.next(convertToParamMap({ periodo: '2026-08' }));
    fixture.detectChanges();

    expect(componente.editando()).toBe(false);
  });
});

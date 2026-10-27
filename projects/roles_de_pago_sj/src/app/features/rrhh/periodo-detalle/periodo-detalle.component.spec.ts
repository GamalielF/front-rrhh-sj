import { HttpErrorResponse } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router, convertToParamMap, provideRouter } from '@angular/router';
import { BehaviorSubject, of, throwError } from 'rxjs';
import type { ListadoPeriodoResponse, PeriodoResumenResponse, ResumenPeriodoResponse } from '@models';
import { PerfilAplicacionService } from '@services';
import { RrhhService } from '../rrhh.service';
import { CargaMasivaService } from './carga-masiva';
import { NotificacionesService } from './notificaciones-periodo';
import { PeriodoDetalleComponent } from './periodo-detalle.component';

const listado: ListadoPeriodoResponse = {
  periodo: '2026-09',
  estadoPeriodo: 'CARGADO',
  activos: 1,
  inactivos: 0,
  roles: [
    { id: 1, cedula: '1712345675', nombre: 'PEREZ JUAN', estado: 'ACTIVO', tamanoBytes: 2048, actualizadoEn: '2026-10-22T16:53:39', actualizadoPor: 'fsepa' },
  ],
};

const resumen: ResumenPeriodoResponse = {
  periodo: '2026-09',
  estadoPeriodo: 'CARGADO',
  rolesActivos: 1,
  rolesInactivos: 0,
  personasActivas: 1,
  sinRol: 0,
  nombresSinRol: [],
  rolesSinPersonaActiva: 0,
  nombresRolesSinPersona: [],
};

const PERIODOS: PeriodoResumenResponse[] = [
  { periodo: '2026-09', estado: 'CARGADO', fechaPublicacion: null, publicadoPor: null, rolesActivos: 1 },
  { periodo: '2026-08', estado: 'PUBLICADO', fechaPublicacion: '2026-09-01T09:00:00', publicadoPor: 'fsepa', rolesActivos: 118 },
];

const noExiste = () => throwError(() => new HttpErrorResponse({ status: 404, error: { message: 'El periodo no existe' } }));

describe('PeriodoDetalleComponent', () => {
  const servicio = {
    periodos: vi.fn(),
    listado: vi.fn(),
    resumen: vi.fn(),
    publicar: vi.fn(),
    cobertura: vi.fn(),
    inactivarRol: vi.fn(),
    activarRol: vi.fn(),
    verRol: vi.fn(),
  };
  const avisos = { informe: vi.fn(), generar: vi.fn(), reintentar: vi.fn() };
  const perfil = (roles: string[], permisos: string[] = []) => ({ perfil: () => of({ roles, permisos }) });
  let navegar: ReturnType<typeof vi.spyOn>;
  const parametros$ = new BehaviorSubject(convertToParamMap({ periodo: '2026-09' }));

  const crear = () => {
    const fixture = TestBed.createComponent(PeriodoDetalleComponent);
    fixture.detectChanges();
    return { fixture, componente: fixture.componentInstance, html: fixture.nativeElement as HTMLElement };
  };

  beforeEach(() => {
    servicio.periodos.mockReset().mockReturnValue(of(PERIODOS));
    servicio.cobertura
      .mockReset()
      .mockReturnValue(of({ periodo: '2026-09', rolesPublicados: 1, leidos: 0, pendientes: 1, nombresPendientes: ['PEREZ JUAN'] }));
    servicio.inactivarRol.mockReset();
    servicio.activarRol.mockReset();
    avisos.informe.mockReset().mockReturnValue(
      of({ periodo: '2026-09', habilitadas: true, total: 1, pendientes: 0, reintentando: 0, enviadas: 1, fallidas: 0, omitidas: 0, problemas: [] }),
    );
    servicio.listado.mockReset().mockReturnValue(of(listado));
    servicio.resumen.mockReset().mockReturnValue(of(resumen));
    parametros$.next(convertToParamMap({ periodo: '2026-09' }));
    TestBed.configureTestingModule({
      imports: [PeriodoDetalleComponent],
      providers: [
        provideRouter([]),
        { provide: RrhhService, useValue: servicio },
        { provide: CargaMasivaService, useValue: { cargarEnLotes: vi.fn() } },
        { provide: NotificacionesService, useValue: avisos },
        { provide: PerfilAplicacionService, useValue: perfil(['ADMIN']) },
        { provide: ActivatedRoute, useValue: { paramMap: parametros$ } },
      ],
    });
    navegar = vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);
  });

  it('carga el cuadre y los roles del período de la dirección', () => {
    const { html } = crear();
    expect(servicio.listado).toHaveBeenCalledWith('2026-09');
    expect(servicio.resumen).toHaveBeenCalledWith('2026-09');
    expect(html.textContent).toContain('Período Septiembre 2026');
    expect(html.textContent).toContain('PEREZ JUAN');
    expect(html.textContent).toContain('Carga masiva de roles');
  });

  it('ofrece el selector con los períodos cargados, el actual a la vista, y cambiar de período navega', () => {
    const { componente, html } = crear();
    expect(servicio.periodos).toHaveBeenCalledTimes(1);
    expect(html.querySelector('app-selector-periodo')).not.toBeNull();
    expect(html.querySelector('app-selector-periodo')?.textContent).toContain('Septiembre 2026');
    expect(componente.periodos().map((fila) => fila.periodo)).toEqual(['2026-09', '2026-08']);

    componente.irA('2026-08');
    expect(navegar).toHaveBeenCalledWith(['/rrhh/periodos', '2026-08']);
  });

  it('un período que todavía no existe se presenta como nuevo, no como error', () => {
    servicio.listado.mockReturnValue(noExiste());
    servicio.resumen.mockReturnValue(noExiste());
    const { componente, html } = crear();
    expect(componente.esNuevo()).toBe(true);
    expect(componente.error()).toBe('');
    expect(html.textContent).toContain('se creará al cargar su primer rol');
  });

  it('cualquier otro error del servidor sí se muestra', () => {
    servicio.listado.mockReturnValue(throwError(() => new HttpErrorResponse({ status: 500, error: { message: 'Error inesperado' } })));
    const { html } = crear();
    expect(html.textContent).toContain('Error inesperado');
  });

  it('una dirección con un período mal escrito vuelve a la lista', () => {
    parametros$.next(convertToParamMap({ periodo: 'septiembre' }));
    crear();
    expect(navegar).toHaveBeenCalledWith(['/rrhh/periodos']);
    expect(servicio.listado).not.toHaveBeenCalled();
  });

  it('actualizarRoles vuelve a pedir solo el listado, sin parpadeo ni errores aunque falle', () => {
    const { componente } = crear();
    servicio.listado.mockClear();
    servicio.resumen.mockClear();

    componente.actualizarRoles();
    expect(servicio.listado).toHaveBeenCalledTimes(1);
    expect(servicio.resumen).not.toHaveBeenCalled();
    expect(componente.cargando()).toBe(false);

    servicio.listado.mockReturnValue(throwError(() => new HttpErrorResponse({ status: 0 })));
    componente.actualizarRoles();
    expect(componente.error()).toBe('');
  });

  it('recargar vuelve a pedir los datos (lo que ocurre al terminar una carga o publicar)', () => {
    const { componente } = crear();
    componente.recargar();
    expect(servicio.listado).toHaveBeenCalledTimes(2);
  });

  it('mientras el período no está publicado no muestra avisos ni lectura', () => {
    const { html } = crear();
    expect(html.querySelector('app-notificaciones-periodo')).toBeNull();
    expect(html.querySelector('app-cobertura-periodo')).toBeNull();
  });

  it('con el período publicado muestra el seguimiento: avisos por correo y lectura de roles', () => {
    servicio.resumen.mockReturnValue(of({ ...resumen, estadoPeriodo: 'PUBLICADO' }));
    const { componente, html } = crear();
    expect(componente.estaPublicado()).toBe(true);
    expect(html.querySelector('app-notificaciones-periodo')).not.toBeNull();
    expect(html.querySelector('app-cobertura-periodo')).not.toBeNull();
    expect(html.textContent).toContain('Avisos por correo');
    expect(html.textContent).toContain('Lectura de roles');
  });

  it('inactivar un rol llama al servidor y vuelve a cargar el período', () => {
    servicio.inactivarRol.mockReturnValue(of({}));
    const { componente } = crear();
    componente.inactivar(componente.listado()!.roles.map((rol) => ({ id: rol.id }) as never)[0]);
    expect(servicio.inactivarRol).toHaveBeenCalledWith('2026-09', 1);
    expect(servicio.listado).toHaveBeenCalledTimes(2);
  });

  it('si el servidor no deja cambiar el rol (por ejemplo ya publicado) muestra su motivo', () => {
    servicio.activarRol.mockReturnValue(
      throwError(() => new HttpErrorResponse({ status: 409, error: { message: 'El período ya fue publicado: sus roles no se modifican' } })),
    );
    const { fixture, componente, html } = crear();
    componente.activar({ id: 1 } as never);
    fixture.detectChanges();
    expect(html.textContent).toContain('sus roles no se modifican');
  });

  it('un administrador puede ver roles ajenos y RRHH solo con el permiso', () => {
    const { componente } = crear();
    expect(componente.puedeVerAjenos()).toBe(true);
  });

  it('elegir Ver rol abre la ventana del motivo con esa persona', () => {
    const { fixture, componente, html } = crear();
    componente.verRol({ id: 1, nombre: 'PEREZ JUAN' } as never);
    fixture.detectChanges();
    expect(componente.rolSeleccionado()).toMatchObject({ id: 1 });
    expect(html.textContent).toContain('Motivo de la consulta');
  });
});

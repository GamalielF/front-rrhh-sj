import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, provideRouter } from '@angular/router';
import { BehaviorSubject, of } from 'rxjs';
import type { ListadoPeriodoResponse, ResumenPeriodoResponse } from '@models';
import { PerfilAplicacionService } from '@services';
import { RrhhService } from '../rrhh.service';
import type { RolFila } from '../rrhh.model';
import { CargaMasivaService } from './carga-masiva';
import { NotificacionesService } from './notificaciones-periodo';
import { PeriodoDetalleComponent } from './periodo-detalle.component';

const listado: ListadoPeriodoResponse = {
  periodo: '2026-09',
  estadoPeriodo: 'PUBLICADO',
  activos: 1,
  inactivos: 0,
  roles: [
    { id: 1, cedula: '1712345675', nombre: 'PEREZ JUAN', estado: 'ACTIVO', tamanoBytes: 2048, actualizadoEn: '2026-10-22T16:53:39', actualizadoPor: 'fsepa' },
  ],
};

const resumen: ResumenPeriodoResponse = {
  periodo: '2026-09',
  estadoPeriodo: 'PUBLICADO',
  rolesActivos: 1,
  rolesInactivos: 0,
  personasActivas: 1,
  sinRol: 0,
  nombresSinRol: [],
  rolesSinPersonaActiva: 0,
  nombresRolesSinPersona: [],
};

const rol: RolFila = {
  id: 1,
  cedula: '1712345675',
  nombre: 'PEREZ JUAN',
  estado: 'ACTIVO',
  estadoEtiqueta: 'Activo',
  notificacion: 'Notificado',
  notificacionVariante: 'success',
  notificacionDetalle: 'Enviado',
  reenviable: true,
  tamano: '2 KB',
  actualizadoEn: '22/10/2026 16:53',
};

describe('PeriodoDetalleComponent: reenviar una notificación', () => {
  const servicio = { periodos: vi.fn(), listado: vi.fn(), resumen: vi.fn(), cobertura: vi.fn() };
  const avisos = { informe: vi.fn(), generar: vi.fn(), reintentar: vi.fn(), reenviar: vi.fn() };

  const crear = () => {
    const fixture = TestBed.createComponent(PeriodoDetalleComponent);
    fixture.detectChanges();
    return { fixture, componente: fixture.componentInstance, html: fixture.nativeElement as HTMLElement };
  };

  beforeEach(() => {
    servicio.periodos.mockReset().mockReturnValue(of([]));
    servicio.listado.mockReset().mockReturnValue(of(listado));
    servicio.resumen.mockReset().mockReturnValue(of(resumen));
    servicio.cobertura
      .mockReset()
      .mockReturnValue(of({ periodo: '2026-09', rolesPublicados: 1, leidos: 0, pendientes: 1, nombresPendientes: ['PEREZ JUAN'] }));
    avisos.informe.mockReset().mockReturnValue(
      of({ periodo: '2026-09', habilitadas: true, total: 1, pendientes: 0, reintentando: 0, enviadas: 1, fallidas: 0, omitidas: 0, problemas: [] }),
    );
    TestBed.configureTestingModule({
      imports: [PeriodoDetalleComponent],
      providers: [
        provideRouter([]),
        { provide: RrhhService, useValue: servicio },
        { provide: CargaMasivaService, useValue: { cargarEnLotes: vi.fn() } },
        { provide: NotificacionesService, useValue: avisos },
        { provide: PerfilAplicacionService, useValue: { perfil: () => of({ roles: ['ADMIN'], permisos: [] }) } },
        { provide: ActivatedRoute, useValue: { paramMap: new BehaviorSubject(convertToParamMap({ periodo: '2026-09' })) } },
      ],
    });
  });

  it('pedir el reenvío abre la confirmación de ese rol y borra el resultado anterior', () => {
    const { fixture, componente, html } = crear();
    componente.resultadoReenvio.set({ variante: 'success', texto: 'anterior' });
    componente.pedirReenvio(rol);
    fixture.detectChanges();
    expect(componente.rolAReenviar()).toEqual(rol);
    expect(componente.resultadoReenvio()).toBeNull();
    expect(html.textContent).toContain('Reenviar notificación');
  });

  it('al terminar muestra el resultado, vuelve a pedir los roles y actualiza la tarjeta de avisos', () => {
    const { fixture, componente, html } = crear();
    servicio.listado.mockClear();
    avisos.informe.mockClear();
    componente.reenvioTerminado({ fila: rol, resultado: { aceptado: true, mensaje: 'La API de correo aceptó el reenvío', notificacion: null } });
    fixture.detectChanges();
    expect(html.textContent).toContain('Aviso reenviado a PEREZ JUAN');
    expect(servicio.listado).toHaveBeenCalledTimes(1);
    expect(avisos.informe).toHaveBeenCalledTimes(1);
  });

  it('si el reenvío no fue aceptado lo muestra como un error con el motivo', () => {
    const { fixture, componente, html } = crear();
    componente.reenvioTerminado({ fila: rol, resultado: { aceptado: false, mensaje: 'La API de correo no respondió a tiempo', notificacion: null } });
    fixture.detectChanges();
    expect(componente.resultadoReenvio()?.variante).toBe('danger');
    expect(html.textContent).toContain('No se pudo reenviar a PEREZ JUAN: La API de correo no respondió a tiempo');
  });

  it('el aviso del resultado se puede cerrar', () => {
    const { fixture, componente, html } = crear();
    componente.reenvioTerminado({ fila: rol, resultado: { aceptado: true, mensaje: 'ok', notificacion: null } });
    fixture.detectChanges();
    componente.resultadoReenvio.set(null);
    fixture.detectChanges();
    expect(html.textContent).not.toContain('Aviso reenviado a PEREZ JUAN');
  });
});

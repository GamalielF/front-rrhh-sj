import { TestBed } from '@angular/core/testing';
import type { RolPagoResumenResponse } from '@models';
import { RolesPeriodoComponent } from './roles-periodo.component';

const rol = (id: number, nombre: string, cedula = '1712345675'): RolPagoResumenResponse => ({
  id,
  cedula,
  nombre,
  estado: 'ACTIVO',
  tamanoBytes: 2048,
  actualizadoEn: '2026-10-22T16:53:39',
  actualizadoPor: 'fsepa',
});

describe('RolesPeriodoComponent', () => {
  const crear = (roles: RolPagoResumenResponse[]) => {
    const fixture = TestBed.createComponent(RolesPeriodoComponent);
    fixture.componentRef.setInput('roles', roles);
    fixture.detectChanges();
    return { fixture, componente: fixture.componentInstance, html: fixture.nativeElement as HTMLElement };
  };

  beforeEach(() => TestBed.configureTestingModule({ imports: [RolesPeriodoComponent] }));

  it('lista los roles con su nombre y la cédula completa', () => {
    const { html } = crear([rol(1, 'PEREZ JUAN'), rol(2, 'GARCIA ANA', '0202125712')]);
    expect(html.textContent).toContain('PEREZ JUAN');
    expect(html.textContent).toContain('1712345675');
    expect(html.textContent).toContain('0202125712');
    expect(html.textContent).not.toContain('******');
    expect(html.textContent).toContain('2 de 2 roles');
  });

  it('el buscador filtra por nombre sin distinguir tildes', () => {
    const { fixture, componente, html } = crear([rol(1, 'PÉREZ JUAN'), rol(2, 'GARCIA ANA')]);
    componente.filtro.setValue('perez');
    fixture.detectChanges();
    expect(componente.filas()).toHaveLength(1);
    expect(html.textContent).toContain('1 de 2 roles');
  });

  it('el buscador encuentra a una persona por su número de cédula', () => {
    const { fixture, componente, html } = crear([rol(1, 'PEREZ JUAN'), rol(2, 'GARCIA ANA', '0202125712')]);
    componente.filtro.setValue('0202125712');
    fixture.detectChanges();
    expect(componente.filas().map((fila) => fila.id)).toEqual([2]);
    expect(html.textContent).toContain('GARCIA ANA');
    expect(html.textContent).not.toContain('PEREZ JUAN');
  });

  it('muestra el estado del aviso de cada rol, con su detalle', () => {
    const { fixture, html } = crear([
      { ...rol(1, 'PEREZ JUAN'), notificacion: { estado: 'ENVIADA', intentos: 1, enviadaEn: '2026-10-27T10:15:00', proximoIntento: null, ultimoError: null } },
      { ...rol(2, 'GARCIA ANA'), notificacion: { estado: 'FALLIDA', intentos: 5, enviadaEn: null, proximoIntento: null, ultimoError: 'La API de correo no respondió a tiempo' } },
    ]);
    fixture.componentRef.setInput('publicado', true);
    fixture.detectChanges();
    expect(html.textContent).toContain('Notificación');
    expect(html.textContent).toContain('Notificado');
    expect(html.textContent).toContain('Enviado el 27/10/2026 10:15');
    expect(html.textContent).toContain('Error de envío');
    expect(html.textContent).toContain('La API de correo no respondió a tiempo (5 intentos)');
  });

  it('antes de publicar todos aparecen "Sin notificar", y el buscador encuentra los que tienen error', () => {
    const { fixture, componente, html } = crear([rol(1, 'PEREZ JUAN')]);
    expect(html.textContent).toContain('Sin notificar');
    expect(html.textContent).toContain('Se avisará al publicar');

    fixture.componentRef.setInput('publicado', true);
    fixture.componentRef.setInput('roles', [
      rol(1, 'PEREZ JUAN'),
      { ...rol(2, 'GARCIA ANA'), notificacion: { estado: 'FALLIDA', intentos: 5, enviadaEn: null, proximoIntento: null, ultimoError: 'x' } },
    ]);
    componente.filtro.setValue('error');
    fixture.detectChanges();
    expect(componente.filas().map((fila) => fila.id)).toEqual([2]);
  });

  it('sin roles dice que todavía no hay ninguno', () => {
    const { html } = crear([]);
    expect(html.textContent).toContain('Todavía no hay roles cargados');
  });

  it('las acciones de la tabla avisan a la página qué rol y qué se pidió', () => {
    const { fixture, componente } = crear([rol(1, 'PEREZ JUAN')]);
    fixture.componentRef.setInput('puedeVerAjenos', true);
    const ver = vi.fn();
    const reenviar = vi.fn();
    const inactivar = vi.fn();
    componente.ver.subscribe(ver);
    componente.reenviar.subscribe(reenviar);
    componente.inactivar.subscribe(inactivar);

    const [accionVer, accionReenviar, accionInactivar] = componente.acciones();
    accionVer.onClick?.(componente.filas()[0]);
    accionReenviar.onClick?.(componente.filas()[0]);
    accionInactivar.onClick?.(componente.filas()[0]);

    expect(ver).toHaveBeenCalledWith(expect.objectContaining({ id: 1, cedula: '1712345675' }));
    expect(reenviar).toHaveBeenCalledWith(expect.objectContaining({ id: 1 }));
    expect(inactivar).toHaveBeenCalledWith(expect.objectContaining({ id: 1 }));
  });

  it('con el período publicado y sin permiso de ver roles ajenos, la tabla solo ofrece reenviar la notificación', () => {
    const { fixture, componente } = crear([rol(1, 'PEREZ JUAN')]);
    fixture.componentRef.setInput('publicado', true);
    const visibles = componente.acciones().filter((accion) => !accion.hidden?.(componente.filas()[0]));
    expect(visibles.map((accion) => accion.label)).toEqual(['Reenviar notificación']);
  });
});

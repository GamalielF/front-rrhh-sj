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

  it('sin roles dice que todavía no hay ninguno', () => {
    const { html } = crear([]);
    expect(html.textContent).toContain('Todavía no hay roles cargados');
  });

  it('las acciones de la tabla avisan a la página qué rol y qué se pidió', () => {
    const { fixture, componente } = crear([rol(1, 'PEREZ JUAN')]);
    fixture.componentRef.setInput('puedeVerAjenos', true);
    const ver = vi.fn();
    const inactivar = vi.fn();
    componente.ver.subscribe(ver);
    componente.inactivar.subscribe(inactivar);

    const [accionVer, accionInactivar] = componente.acciones();
    accionVer.onClick?.(componente.filas()[0]);
    accionInactivar.onClick?.(componente.filas()[0]);

    expect(ver).toHaveBeenCalledWith(expect.objectContaining({ id: 1, cedula: '1712345675' }));
    expect(inactivar).toHaveBeenCalledWith(expect.objectContaining({ id: 1 }));
  });

  it('con el período publicado y sin permiso la tabla no ofrece acciones', () => {
    const { fixture, componente } = crear([rol(1, 'PEREZ JUAN')]);
    fixture.componentRef.setInput('publicado', true);
    expect(componente.acciones()).toEqual([]);
  });
});

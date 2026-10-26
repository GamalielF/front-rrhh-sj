import { HttpErrorResponse } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { PerfilAplicacionService } from '@services';
import { UsuariosComponent } from './usuarios.component';
import { UsuariosService } from './usuarios.service';
import { aFilasUsuarios } from './usuarios.util';
import { usuario } from './usuarios.testing';

const pagina = (elementos: ReturnType<typeof usuario>[], total = elementos.length) => ({
  elementos,
  pagina: 0,
  tamano: 20,
  totalElementos: total,
  totalPaginas: 1,
});

const JUAN = usuario('jperez');
const ANA = usuario('agarcia', { nombre: 'GARCIA MORA ANA' });
const ADMIN_ARRANQUE = usuario('msavala', {
  nombre: 'SAVALA ANA',
  roles: [{ rol: 'ADMIN', origen: 'CONFIGURACION', verRolesAjenos: true }],
});

describe('UsuariosComponent', () => {
  const servicio = { buscar: vi.fn(), privilegiados: vi.fn(), aplicar: vi.fn() };

  const crear = () => {
    const fixture = TestBed.createComponent(UsuariosComponent);
    fixture.detectChanges();
    return { fixture, componente: fixture.componentInstance, html: fixture.nativeElement as HTMLElement };
  };
  const filaDe = (u: ReturnType<typeof usuario>) => aFilasUsuarios([u])[0];

  beforeEach(() => {
    vi.useFakeTimers();
    servicio.buscar.mockReset().mockReturnValue(of(pagina([JUAN, ANA], 45)));
    servicio.privilegiados.mockReset().mockReturnValue(of([ADMIN_ARRANQUE]));
    servicio.aplicar.mockReset();
    TestBed.configureTestingModule({
      imports: [UsuariosComponent],
      providers: [
        { provide: UsuariosService, useValue: servicio },
        { provide: PerfilAplicacionService, useValue: { perfil: () => of({ username: 'fsepa', roles: ['ADMIN'], permisos: [] }) } },
      ],
    });
  });

  afterEach(() => vi.useRealTimers());

  it('carga la primera página del directorio y a los que tienen acceso especial', () => {
    const { componente, html } = crear();
    expect(servicio.buscar).toHaveBeenCalledWith('', 0, 20);
    expect(componente.total()).toBe(45);
    expect(html.textContent).toContain('GARCIA MORA ANA');
    expect(html.textContent).toContain('Administrador (de arranque)');
  });

  it('al escribir espera un momento, busca el texto y vuelve a la primera página', () => {
    const { componente } = crear();
    componente.cambiarPagina(2);
    servicio.buscar.mockClear();

    componente.busqueda.setValue('perez');
    vi.advanceTimersByTime(299);
    expect(servicio.buscar).not.toHaveBeenCalled();
    vi.advanceTimersByTime(1);
    expect(servicio.buscar).toHaveBeenCalledTimes(1);
    expect(servicio.buscar).toHaveBeenCalledWith('perez', 0, 20);
  });

  it('cambiar de página o de tamaño pide los datos correspondientes', () => {
    const { componente } = crear();
    componente.cambiarPagina(2);
    expect(servicio.buscar).toHaveBeenLastCalledWith('', 2, 20);
    componente.cambiarTamano(50);
    expect(servicio.buscar).toHaveBeenLastCalledWith('', 0, 50);
  });

  it('si no se pudo cargar el directorio muestra el motivo', () => {
    servicio.buscar.mockReturnValue(throwError(() => new HttpErrorResponse({ status: 0 })));
    const { html } = crear();
    expect(html.textContent).toContain('No hay conexión con el servidor');
  });

  it('asignar RRHH se aplica enseguida, avisa y recarga las dos listas', () => {
    servicio.aplicar.mockReturnValue(of(JUAN));
    const { fixture, componente, html } = crear();
    servicio.buscar.mockClear();
    servicio.privilegiados.mockClear();

    componente.solicitar(filaDe(JUAN), { tipo: 'otorgar', rol: 'RRHH', verRolesAjenos: true });
    fixture.detectChanges();

    expect(servicio.aplicar).toHaveBeenCalledWith('jperez', { tipo: 'otorgar', rol: 'RRHH', verRolesAjenos: true });
    expect(componente.pendiente()).toBeNull();
    expect(html.textContent).toContain('PEREZ LOPEZ JUAN ahora es RRHH y ve roles ajenos.');
    expect(servicio.buscar).toHaveBeenCalledTimes(1);
    expect(servicio.privilegiados).toHaveBeenCalledTimes(1);
  });

  it('hacer administrador pide confirmación y solo aplica al confirmar', () => {
    servicio.aplicar.mockReturnValue(of(JUAN));
    const { fixture, componente, html } = crear();

    componente.solicitar(filaDe(JUAN), { tipo: 'otorgar', rol: 'ADMIN' });
    fixture.detectChanges();
    expect(servicio.aplicar).not.toHaveBeenCalled();
    expect(html.textContent).toContain('Hacer administrador');
    expect(html.textContent).toContain('podrá gestionar usuarios');

    componente.confirmar();
    fixture.detectChanges();
    expect(servicio.aplicar).toHaveBeenCalledWith('jperez', { tipo: 'otorgar', rol: 'ADMIN' });
    expect(componente.pendiente()).toBeNull();
    expect(html.textContent).toContain('ahora es administrador');
  });

  it('cancelar la confirmación no cambia nada', () => {
    const { componente } = crear();
    componente.solicitar(filaDe(JUAN), { tipo: 'revocar', rol: 'RRHH' });
    componente.cancelar();
    expect(componente.pendiente()).toBeNull();
    expect(servicio.aplicar).not.toHaveBeenCalled();
  });

  it('si el servidor rechaza una confirmación, el motivo queda dentro de la ventana, que sigue abierta', () => {
    servicio.aplicar.mockReturnValue(
      throwError(() => new HttpErrorResponse({ status: 409, error: { message: 'No puede quitarse a sí mismo el rol ADMIN' } })),
    );
    const { fixture, componente, html } = crear();
    componente.solicitar(filaDe(JUAN), { tipo: 'revocar', rol: 'ADMIN' });
    componente.confirmar();
    fixture.detectChanges();
    expect(componente.pendiente()).not.toBeNull();
    expect(componente.errorCambio()).toBe('No puede quitarse a sí mismo el rol ADMIN');
    expect(html.textContent).toContain('No puede quitarse a sí mismo el rol ADMIN');
  });

  it('si el servidor rechaza un cambio inmediato, el motivo aparece en la página', () => {
    servicio.aplicar.mockReturnValue(
      throwError(() => new HttpErrorResponse({ status: 409, error: { message: 'El usuario está inactivo en el AD' } })),
    );
    const { fixture, componente, html } = crear();
    componente.solicitar(filaDe(JUAN), { tipo: 'otorgar', rol: 'RRHH', verRolesAjenos: true });
    fixture.detectChanges();
    expect(componente.error()).toBe('El usuario está inactivo en el AD');
    expect(html.textContent).toContain('El usuario está inactivo en el AD');
  });

  it('no ofrece quitarse a uno mismo el rol de administrador', () => {
    const { componente } = crear();
    const yo = filaDe(usuario('fsepa', { roles: [{ rol: 'ADMIN', origen: 'ASIGNADO', verRolesAjenos: true }] }));
    const quitar = componente.acciones().find((accion) => accion.label === 'Quitar administrador');
    expect(quitar?.hidden?.(yo)).toBe(true);
    expect(quitar?.hidden?.({ ...yo, username: 'mmora' })).toBe(false);
  });
});

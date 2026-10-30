import { botonReintentar } from '../../../../shared/components/error-carga/error-carga.testing';
import { HttpErrorResponse } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { AuditoriaService } from '../auditoria.service';
import { acceso, filtros, pagina } from '../auditoria.testing';
import { PanelAccesosComponent } from './panel-accesos.component';

describe('PanelAccesosComponent', () => {
  const servicio = { accesos: vi.fn(), exportarAccesos: vi.fn() };
  let descargado: { nombre: string; tipo: string } | null;

  const crear = (f = filtros()) => {
    const fixture = TestBed.createComponent(PanelAccesosComponent);
    fixture.componentRef.setInput('filtros', f);
    fixture.detectChanges();
    return { fixture, componente: fixture.componentInstance, html: fixture.nativeElement as HTMLElement };
  };

  beforeEach(() => {
    descargado = null;
    servicio.accesos.mockReset().mockReturnValue(of(pagina([acceso(), acceso({ id: 2, usuario: 'agarcia', resultado: 'DENEGADO', detalle: 'CEDULA_NO_COINCIDE' })], 45)));
    servicio.exportarAccesos.mockReset();
    URL.createObjectURL = vi.fn((blob: Blob) => {
      descargado = { nombre: '', tipo: blob.type };
      return 'blob:csv';
    });
    URL.revokeObjectURL = vi.fn();
    vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(function (this: HTMLAnchorElement) {
      if (descargado) {
        descargado.nombre = this.download;
      }
    });
    TestBed.configureTestingModule({
      imports: [PanelAccesosComponent],
      providers: [{ provide: AuditoriaService, useValue: servicio }],
    });
  });

  afterEach(() => vi.restoreAllMocks());

  it('al abrir carga la primera página con los filtros recibidos', () => {
    const { componente, html } = crear(filtros({ resultado: 'DENEGADO' }));
    expect(servicio.accesos).toHaveBeenCalledWith(expect.objectContaining({ resultado: 'DENEGADO' }), 0, 20);
    expect(componente.total()).toBe(45);
    expect(html.textContent).toContain('agarcia');
    expect(html.textContent).toContain('La cédula no coincide');
  });

  it('cuando cambian los filtros vuelve a la primera página', () => {
    const { fixture, componente } = crear();
    componente.cambiarPagina(2);
    servicio.accesos.mockClear();
    fixture.componentRef.setInput('filtros', filtros({ usuario: 'agarcia' }));
    fixture.detectChanges();
    expect(servicio.accesos).toHaveBeenCalledWith(expect.objectContaining({ usuario: 'agarcia' }), 0, 20);
    expect(componente.pagina()).toBe(0);
  });

  it('cambiar de página o de tamaño pide lo correspondiente', () => {
    const { componente } = crear();
    componente.cambiarPagina(3);
    expect(servicio.accesos).toHaveBeenLastCalledWith(expect.anything(), 3, 20);
    componente.cambiarTamano(100);
    expect(servicio.accesos).toHaveBeenLastCalledWith(expect.anything(), 0, 100);
  });

  it('si falla la consulta muestra el motivo y vacía la tabla', () => {
    servicio.accesos.mockReturnValue(
      throwError(() => new HttpErrorResponse({ status: 400, error: { message: 'El rango máximo es de 366 días' } })),
    );
    const { componente, html } = crear();
    expect(html.textContent).toContain('El rango máximo es de 366 días');
    expect(componente.filas()).toEqual([]);
  });

  it('exportar descarga el CSV con el nombre que dice el servidor y cuenta las filas', () => {
    servicio.exportarAccesos.mockReturnValue(
      of({ nombreArchivo: 'accesos_2026-10-01_2026-10-26.csv', tipoContenido: 'text/csv', filas: 45, truncado: false, contenidoBase64: btoa('a;b') }),
    );
    const { fixture, componente, html } = crear();
    componente.exportar();
    fixture.detectChanges();
    expect(descargado).toEqual({ nombre: 'accesos_2026-10-01_2026-10-26.csv', tipo: 'text/csv' });
    expect(html.textContent).toContain('Se exportaron 45 filas.');
  });

  it('si el archivo salió cortado avisa que hay que acotar el rango', () => {
    servicio.exportarAccesos.mockReturnValue(
      of({ nombreArchivo: 'accesos.csv', tipoContenido: 'text/csv', filas: 20000, truncado: true, contenidoBase64: btoa('a;b') }),
    );
    const { fixture, componente, html } = crear();
    componente.exportar();
    fixture.detectChanges();
    expect(componente.truncado()).toBe(true);
    expect(html.textContent).toContain('solo las primeras 20000 filas');
  });

  it('si la exportación falla muestra el motivo y no descarga nada', () => {
    servicio.exportarAccesos.mockReturnValue(
      throwError(() => new HttpErrorResponse({ status: 400, error: { message: 'Período inválido' } })),
    );
    const { fixture, componente, html } = crear();
    componente.exportar();
    fixture.detectChanges();
    expect(html.textContent).toContain('Período inválido');
    expect(descargado).toBeNull();
    expect(componente.exportando()).toBe(false);
  });

  it('si falla la consulta ofrece volver a cargar, y al pulsarlo la repite con los mismos filtros', () => {
    servicio.accesos.mockReturnValueOnce(throwError(() => new HttpErrorResponse({ status: 0 })));
    const { fixture, html } = crear();
    expect(html.textContent).toContain('No hay conexión con el servidor');
    botonReintentar(html)?.click();
    fixture.detectChanges();
    expect(servicio.accesos).toHaveBeenCalledTimes(2);
    expect(html.textContent).not.toContain('No hay conexión con el servidor');
    expect(botonReintentar(html)).toBeUndefined();
  });
});

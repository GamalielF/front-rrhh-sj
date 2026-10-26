import { HttpErrorResponse } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { CargaMasivaComponent } from './carga-masiva.component';
import { CargaMasivaService } from './carga-masiva.service';
import { progresoInicial } from './carga-masiva.util';
import { archivo } from './carga-masiva.testing';

describe('CargaMasivaComponent', () => {
  const servicio = { cargarEnLotes: vi.fn() };

  const crear = () => {
    const fixture = TestBed.createComponent(CargaMasivaComponent);
    fixture.componentRef.setInput('periodo', '2026-09');
    fixture.detectChanges();
    const componente = fixture.componentInstance;
    const elegir = (...archivos: File[]) => {
      componente.alElegir({ target: { files: archivos, value: 'x' } } as unknown as Event);
      fixture.detectChanges();
    };
    return { fixture, componente, elegir, html: fixture.nativeElement as HTMLElement };
  };

  beforeEach(() => {
    servicio.cargarEnLotes.mockReset();
    TestBed.configureTestingModule({
      imports: [CargaMasivaComponent],
      providers: [{ provide: CargaMasivaService, useValue: servicio }],
    });
  });

  it('al elegir archivos separa los válidos de los descartados y lo muestra', () => {
    const { componente, elegir, html } = crear();
    elegir(archivo('1712345675.pdf'), archivo('0202125712.pdf'), archivo('notas.txt'));
    expect(componente.archivosValidos()).toHaveLength(2);
    expect(componente.descartados()).toHaveLength(1);
    expect(html.textContent).toContain('2 archivos listos');
    expect(html.textContent).toContain('1 descartados');
    expect(html.textContent).toContain('notas.txt');
  });

  it('sube todo, muestra el resultado y avisa a la página para que recargue', () => {
    servicio.cargarEnLotes.mockReturnValue(
      of({
        loteActual: 1,
        totalLotes: 1,
        resumen: {
          cargados: 1,
          reemplazados: 0,
          sinCambios: 0,
          rechazados: 1,
          resultados: [{ archivo: '0202125712.pdf', estado: 'RECHAZADO', mensaje: 'El nombre no coincide con el titular' }],
        },
      }),
    );
    const { fixture, componente, elegir, html } = crear();
    const finalizada = vi.fn();
    componente.cargaFinalizada.subscribe(finalizada);
    elegir(archivo('1712345675.pdf'), archivo('0202125712.pdf'));

    componente.subir();
    fixture.detectChanges();

    expect(servicio.cargarEnLotes).toHaveBeenCalledWith('2026-09', [[expect.any(File), expect.any(File)]]);
    expect(finalizada).toHaveBeenCalledTimes(1);
    expect(componente.archivosValidos()).toHaveLength(0);
    expect(html.textContent).toContain('1 cargados');
    expect(html.textContent).toContain('1 rechazados');
    expect(html.textContent).toContain('El nombre no coincide con el titular');
  });

  it('si falla un lote muestra el motivo, conserva los archivos para reintentar y también avisa para recargar', () => {
    servicio.cargarEnLotes.mockReturnValue(
      throwError(() => new HttpErrorResponse({ status: 413, error: { message: 'La petición supera el tamaño máximo' } })),
    );
    const { fixture, componente, elegir, html } = crear();
    const finalizada = vi.fn();
    componente.cargaFinalizada.subscribe(finalizada);
    elegir(archivo('1712345675.pdf'));

    componente.subir();
    fixture.detectChanges();

    expect(componente.error()).toBe('La petición supera el tamaño máximo');
    expect(html.textContent).toContain('La petición supera el tamaño máximo');
    expect(componente.archivosValidos()).toHaveLength(1);
    expect(finalizada).toHaveBeenCalledTimes(1);
    expect(componente.subiendo()).toBe(false);
  });

  it('no sube nada si no hay archivos válidos, y limpiar descarta la selección', () => {
    const { componente, elegir } = crear();
    componente.subir();
    expect(servicio.cargarEnLotes).not.toHaveBeenCalled();
    elegir(archivo('1712345675.pdf'));
    componente.limpiar();
    expect(componente.archivosValidos()).toHaveLength(0);
  });

  it('muestra el avance por lotes mientras sube', () => {
    servicio.cargarEnLotes.mockReturnValue(of({ ...progresoInicial(3), loteActual: 2 }));
    const { fixture, componente, elegir, html } = crear();
    elegir(archivo('1712345675.pdf'));
    componente.subir();
    fixture.detectChanges();
    expect(html.textContent).toContain('Lote 2 de 3');
  });
});

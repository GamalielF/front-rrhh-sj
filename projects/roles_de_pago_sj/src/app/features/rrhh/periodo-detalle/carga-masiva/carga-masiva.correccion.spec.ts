import { HttpErrorResponse } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { CargaMasivaComponent } from './carga-masiva.component';
import { CargaMasivaService } from './carga-masiva.service';
import { archivo } from './carga-masiva.testing';
import type { ResumenCarga } from './carga-masiva.model';

const resumen = (resultados: ResumenCarga['resultados']): ResumenCarga => ({
  cargados: 0,
  reemplazados: resultados.filter((r) => r.estado === 'REEMPLAZADO').length,
  sinCambios: 0,
  rechazados: 0,
  resultados,
});
const avance = (resultados: ResumenCarga['resultados']) => ({ loteActual: 1, totalLotes: 1, resumen: resumen(resultados) });
const REEMPLAZO = { archivo: '1712345675.pdf', estado: 'REEMPLAZADO', mensaje: 'x', titular: 'PEREZ LOPEZ JUAN CARLOS' } as const;

describe('CargaMasivaComponent: corrección de un período publicado', () => {
  const servicio = { cargarEnLotes: vi.fn() };

  const crear = (correccion = true) => {
    const fixture = TestBed.createComponent(CargaMasivaComponent);
    fixture.componentRef.setInput('periodo', '2026-09');
    fixture.componentRef.setInput('correccion', correccion);
    fixture.detectChanges();
    const componente = fixture.componentInstance;
    const finalizada = vi.fn();
    componente.cargaFinalizada.subscribe(finalizada);
    const elegir = (...archivos: File[]) => {
      componente.alElegir({ target: { files: archivos, value: 'x' } } as unknown as Event);
      fixture.detectChanges();
    };
    return { fixture, componente, elegir, finalizada, html: fixture.nativeElement as HTMLElement };
  };

  beforeEach(() => {
    servicio.cargarEnLotes.mockReset();
    TestBed.configureTestingModule({
      imports: [CargaMasivaComponent],
      providers: [{ provide: CargaMasivaService, useValue: servicio }],
    });
  });

  it('fuera de corrección sube como siempre: con los dos argumentos de siempre y sin pedir motivo', () => {
    servicio.cargarEnLotes.mockReturnValue(of(avance([])));
    const { componente, elegir, html } = crear(false);
    elegir(archivo('1712345675.pdf'));

    componente.subir();

    expect(servicio.cargarEnLotes).toHaveBeenCalledWith('2026-09', expect.any(Array));
    expect(html.textContent).toContain('Carga masiva de roles');
    expect(html.textContent).not.toContain('Revisar cambios');
  });

  it('en corrección ofrece revisar, no subir, y lo explica', () => {
    const { elegir, html } = crear();
    elegir(archivo('1712345675.pdf'));
    expect(html.textContent).toContain('Corregir los roles del período');
    expect(html.textContent).toContain('Revisar cambios de 1 archivo(s)');
    expect(html.textContent).not.toContain('Subir 1 archivo');
    expect(html.textContent).toContain('no se guarda nada hasta que usted confirme');
  });

  it('revisar pregunta sin guardar y muestra qué rol se va a reemplazar, sin recargar la página', () => {
    servicio.cargarEnLotes.mockReturnValue(of(avance([REEMPLAZO])));
    const { fixture, componente, elegir, finalizada, html } = crear();
    elegir(archivo('1712345675.pdf'));

    componente.revisar();
    fixture.detectChanges();

    expect(servicio.cargarEnLotes).toHaveBeenCalledWith('2026-09', expect.any(Array), { simular: true });
    expect(html.textContent).toContain('El siguiente rol se va a reemplazar');
    expect(html.textContent).toContain('PEREZ LOPEZ JUAN CARLOS');
    expect(html.textContent).toContain('Motivo de la corrección');
    expect(finalizada).not.toHaveBeenCalled();
    expect(componente.archivosValidos()).toHaveLength(1);
  });

  it('confirmar sin motivo no sube nada y deja el campo marcado', () => {
    servicio.cargarEnLotes.mockReturnValue(of(avance([REEMPLAZO])));
    const { componente, elegir } = crear();
    elegir(archivo('1712345675.pdf'));
    componente.revisar();

    componente.subir();
    componente.motivo.setValue('corto');
    componente.subir();

    expect(servicio.cargarEnLotes).toHaveBeenCalledTimes(1);   // solo la revisión
    expect(componente.motivo.touched).toBe(true);
    expect(componente.previa()).not.toBeNull();
  });

  it('confirmar con motivo sube con el motivo limpio, avisa a la página y cierra la revisión', () => {
    servicio.cargarEnLotes.mockReturnValueOnce(of(avance([REEMPLAZO]))).mockReturnValueOnce(of(avance([REEMPLAZO])));
    const { componente, elegir, finalizada } = crear();
    elegir(archivo('1712345675.pdf'));
    componente.revisar();
    componente.motivo.setValue('  Se subió el rol equivocado  ');

    componente.subir();

    expect(servicio.cargarEnLotes).toHaveBeenLastCalledWith('2026-09', expect.any(Array), { motivo: 'Se subió el rol equivocado' });
    expect(finalizada).toHaveBeenCalledTimes(1);
    expect(componente.previa()).toBeNull();
    expect(componente.archivosValidos()).toEqual([]);
    expect(componente.motivo.value).toBe('');
  });

  it('si el servidor rechaza la corrección conserva la revisión y el motivo, y muestra su mensaje', () => {
    servicio.cargarEnLotes
      .mockReturnValueOnce(of(avance([REEMPLAZO])))
      .mockReturnValueOnce(throwError(() => new HttpErrorResponse({ status: 400, error: { message: 'Para corregir un período ya publicado indique el motivo' } })));
    const { fixture, componente, elegir, html } = crear();
    elegir(archivo('1712345675.pdf'));
    componente.revisar();
    componente.motivo.setValue('Se subió el rol equivocado');

    componente.subir();
    fixture.detectChanges();

    expect(html.textContent).toContain('indique el motivo');
    expect(componente.previa()).not.toBeNull();
    expect(componente.motivo.value).toBe('Se subió el rol equivocado');
  });

  it('si la revisión falla muestra el error y no deja una vista previa a medias', () => {
    servicio.cargarEnLotes.mockReturnValue(throwError(() => new HttpErrorResponse({ status: 0 })));
    const { fixture, componente, elegir, html } = crear();
    elegir(archivo('1712345675.pdf'));

    componente.revisar();
    fixture.detectChanges();

    expect(componente.previa()).toBeNull();
    expect(html.textContent).toContain('No hay conexión con el servidor');
  });

  it('cancelar descarta la revisión pero conserva los archivos elegidos', () => {
    servicio.cargarEnLotes.mockReturnValue(of(avance([REEMPLAZO])));
    const { componente, elegir } = crear();
    elegir(archivo('1712345675.pdf'));
    componente.revisar();

    componente.cancelarPrevia();

    expect(componente.previa()).toBeNull();
    expect(componente.archivosValidos()).toHaveLength(1);
  });

  it('elegir otros archivos descarta la revisión anterior: ya no corresponde', () => {
    servicio.cargarEnLotes.mockReturnValue(of(avance([REEMPLAZO])));
    const { componente, elegir } = crear();
    elegir(archivo('1712345675.pdf'));
    componente.revisar();

    elegir(archivo('1709876542.pdf'));

    expect(componente.previa()).toBeNull();
  });

  it('sin archivos no hay nada que revisar', () => {
    const { componente } = crear();
    componente.revisar();
    expect(servicio.cargarEnLotes).not.toHaveBeenCalled();
  });
});

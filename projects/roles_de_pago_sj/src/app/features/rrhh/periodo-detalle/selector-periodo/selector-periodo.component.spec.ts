import { TestBed } from '@angular/core/testing';
import type { PeriodoFila } from '../../rrhh.model';
import { SelectorPeriodoComponent } from './selector-periodo.component';

const fila = (periodo: string, mes: string, estado: PeriodoFila['estado']): PeriodoFila => ({
  periodo,
  mes,
  estado,
  estadoEtiqueta: estado === 'PUBLICADO' ? 'Publicado' : 'En preparación',
  rolesActivos: 10,
  publicadoEl: '—',
  publicadoPor: '—',
});

const FILAS = [fila('2026-09', 'Septiembre 2026', 'PUBLICADO'), fila('2026-08', 'Agosto 2026', 'CARGADO')];

describe('SelectorPeriodoComponent', () => {
  const crear = (seleccionado = '2026-09', periodos: PeriodoFila[] = FILAS) => {
    const fixture = TestBed.createComponent(SelectorPeriodoComponent);
    fixture.componentRef.setInput('periodos', periodos);
    fixture.componentRef.setInput('seleccionado', seleccionado);
    fixture.detectChanges();
    const componente = fixture.componentInstance;
    const elegido = vi.fn();
    componente.seleccionar.subscribe(elegido);
    return { fixture, componente, elegido, html: fixture.nativeElement as HTMLElement };
  };

  beforeEach(() => {
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(new Date(2026, 9, 23));
    TestBed.configureTestingModule({ imports: [SelectorPeriodoComponent] });
  });

  afterEach(() => vi.useRealTimers());

  it('muestra el período actual en el menú y el botón para crear uno nuevo', () => {
    const { html } = crear();
    expect(html.textContent).toContain('Septiembre 2026');
    expect(html.textContent).toContain('Nuevo período');
  });

  it('al elegir una opción del menú avisa qué período se eligió', () => {
    const { componente, elegido } = crear();
    componente.elegir(componente.opciones()[1]);
    expect(elegido).toHaveBeenCalledWith('2026-08');
  });

  it('el botón Nuevo período abre la ventana con el mes siguiente ya escrito', () => {
    const { fixture, componente, html } = crear('2026-09', [fila('2026-08', 'Agosto 2026', 'PUBLICADO')]);
    componente.abrirCreacion();
    fixture.detectChanges();
    expect(componente.creando()).toBe(true);
    expect(componente.periodoNuevo.value).toBe('2026-09');
    expect(html.textContent).toContain('período nuevo, se creará al cargar su primer rol');
  });

  it('crear con un período válido lo elige y cierra la ventana', () => {
    const { componente, elegido } = crear();
    componente.abrirCreacion();
    componente.periodoNuevo.setValue('2026-10');
    componente.crear();
    expect(elegido).toHaveBeenCalledWith('2026-10');
    expect(componente.creando()).toBe(false);
  });

  it('no crea con un formato incorrecto ni con un mes fuera de rango, y deja la ventana abierta', () => {
    const { componente, elegido } = crear();
    componente.abrirCreacion();
    componente.periodoNuevo.setValue('octubre');
    componente.crear();
    componente.periodoNuevo.setValue('2062-10');
    componente.crear();
    expect(elegido).not.toHaveBeenCalled();
    expect(componente.creando()).toBe(true);
    expect(componente.periodoNuevo.errors).toEqual({ fueraDeRango: true });
  });

  it('cancelar cierra la ventana sin elegir nada', () => {
    const { componente, elegido } = crear();
    componente.abrirCreacion();
    componente.cerrarCreacion();
    expect(componente.creando()).toBe(false);
    expect(elegido).not.toHaveBeenCalled();
  });

  it('la ventana ofrece el selector de mes, con el período sugerido ya elegido', () => {
    const { fixture, componente, html } = crear('2026-09', [fila('2026-08', 'Agosto 2026', 'PUBLICADO')]);
    componente.abrirCreacion();
    fixture.detectChanges();
    expect(html.querySelector('app-selector-mes')).not.toBeNull();
    expect(html.textContent).toContain('Septiembre 2026');
    expect(html.textContent).toContain('Crear período');
  });

  it('si el mes elegido ya existe lo dice, y el botón pasa a "Abrir período"', () => {
    const { fixture, componente, html } = crear();
    componente.abrirCreacion();
    componente.elegirMes('2026-08');
    fixture.detectChanges();
    expect(html.textContent).toContain('ya existe, se abrirá con sus roles');
    expect(html.textContent).toContain('Abrir período');
    expect(html.textContent).not.toContain('Crear período');
  });

  it('elegir un mes lejano dentro del rango y crear abre ese período', () => {
    const { componente, elegido } = crear();
    componente.abrirCreacion();
    componente.elegirMes('2026-12');
    componente.crear();
    expect(elegido).toHaveBeenCalledWith('2026-12');
    expect(componente.creando()).toBe(false);
  });

  it('si no hay un mes que sugerir se pide elegir uno, y no se puede crear sin elegir', () => {
    const { fixture, componente, elegido, html } = crear('2027-10', [fila('2027-10', 'Octubre 2027', 'CARGADO')]);
    componente.abrirCreacion();
    fixture.detectChanges();
    expect(componente.periodoNuevo.value).toBe('');
    expect(html.textContent).toContain('Elija un mes para continuar');
    componente.crear();
    expect(elegido).not.toHaveBeenCalled();
    expect(componente.creando()).toBe(true);
  });

  it('informa hasta qué mes se puede elegir', () => {
    const { fixture, componente, html } = crear();
    componente.abrirCreacion();
    fixture.detectChanges();
    expect(html.textContent).toContain('desde enero de 2020 hasta Octubre 2027');
  });
});

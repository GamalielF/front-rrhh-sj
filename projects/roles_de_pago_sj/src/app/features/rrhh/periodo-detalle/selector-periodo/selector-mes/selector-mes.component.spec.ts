import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SelectorMesComponent } from './selector-mes.component';

describe('SelectorMesComponent', () => {
  const crear = (entradas: Record<string, unknown> = {}) => {
    const fixture: ComponentFixture<SelectorMesComponent> = TestBed.createComponent(SelectorMesComponent);
    const valores: Record<string, unknown> = {
      valor: '2026-10',
      minimo: '2020-01',
      maximo: '2027-10',
      existentes: ['2026-08'],
      hoy: new Date(2026, 9, 23),
      ...entradas,
    };
    Object.entries(valores).forEach(([nombre, valor]) => fixture.componentRef.setInput(nombre, valor));
    fixture.detectChanges();
    const elegido = vi.fn();
    fixture.componentInstance.elegido.subscribe(elegido);
    const html = fixture.nativeElement as HTMLElement;
    const botones = () => Array.from(html.querySelectorAll('button'));
    const boton = (texto: string) => botones().find((b) => b.textContent?.trim() === texto) as HTMLButtonElement;
    return { fixture, componente: fixture.componentInstance, elegido, html, boton };
  };

  beforeEach(() => TestBed.configureTestingModule({ imports: [SelectorMesComponent] }));

  it('muestra el año del período elegido y los doce meses', () => {
    const { html, boton } = crear();
    expect(html.querySelector('.anio')?.textContent).toBe('2026');
    ['Enero', 'Junio', 'Septiembre', 'Diciembre'].forEach((mes) => expect(boton(mes)).toBeTruthy());
  });

  it('elegir un mes avisa su período', () => {
    const { boton, elegido } = crear();
    boton('Febrero').click();
    expect(elegido).toHaveBeenCalledWith('2026-02');
  });

  it('los meses fuera del rango están deshabilitados y no avisan nada', () => {
    const { fixture, componente, boton, elegido } = crear();
    componente.cambiarAnio(1);
    fixture.detectChanges();
    expect(boton('Octubre').disabled).toBe(false);
    expect(boton('Noviembre').disabled).toBe(true);
    boton('Noviembre').click();
    expect(elegido).not.toHaveBeenCalled();
  });

  it('se navega de año en año, sin salirse del rango', () => {
    const { fixture, componente, html } = crear({ valor: '2027-10' });
    expect(componente.puedeAvanzar()).toBe(false);
    componente.cambiarAnio(-1);
    fixture.detectChanges();
    expect(html.querySelector('.anio')?.textContent).toBe('2026');
    expect(componente.puedeAvanzar()).toBe(true);
    componente.cambiarAnio(-6);
    fixture.detectChanges();
    expect(html.querySelector('.anio')?.textContent).toBe('2020');
    expect(componente.puedeRetroceder()).toBe(false);
  });

  it('los botones de año se deshabilitan en los extremos', () => {
    const { html } = crear({ valor: '2020-03' });
    const [anterior, siguiente] = Array.from(html.querySelectorAll('.cabecera button')) as HTMLButtonElement[];
    expect(anterior.disabled).toBe(true);
    expect(siguiente.disabled).toBe(false);
  });

  it('los botones de año tienen un nombre que un lector de pantalla puede leer', () => {
    const { html } = crear();
    expect(html.querySelector('.cabecera')?.textContent).toContain('Año anterior');
    expect(html.querySelector('.cabecera')?.textContent).toContain('Año siguiente');
  });

  it('los atajos eligen este mes y el mes siguiente', () => {
    const { boton, elegido } = crear();
    boton('Este mes').click();
    boton('Mes siguiente').click();
    expect(elegido).toHaveBeenNthCalledWith(1, '2026-10');
    expect(elegido).toHaveBeenNthCalledWith(2, '2026-11');
  });

  it('un atajo que cae fuera del rango no se ofrece', () => {
    const { boton } = crear({ maximo: '2026-10' });
    expect(boton('Este mes')).toBeTruthy();
    expect(boton('Mes siguiente')).toBeUndefined();
  });

  it('si el valor cambia desde afuera, el año visible lo sigue', () => {
    const { fixture, componente, html } = crear();
    fixture.componentRef.setInput('valor', '2024-05');
    fixture.detectChanges();
    expect(componente.anio()).toBe(2024);
    expect(html.querySelector('.anio')?.textContent).toBe('2024');
  });

  it('sin valor elegido empieza en el año actual', () => {
    expect(crear({ valor: '' }).componente.anio()).toBe(2026);
  });
});

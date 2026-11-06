import { TestBed } from '@angular/core/testing';
import type { ResumenCarga } from '../carga-masiva/carga-masiva.model';
import { PreviaCorreccionComponent } from './previa-correccion.component';

const resumen = (resultados: ResumenCarga['resultados']): ResumenCarga => ({
  cargados: 0,
  reemplazados: 0,
  sinCambios: 0,
  rechazados: 0,
  resultados,
});

const juan = { archivo: '1712345675.pdf', estado: 'REEMPLAZADO', mensaje: 'x', titular: 'PEREZ LOPEZ JUAN CARLOS' } as const;
const maria = { archivo: '1709876542.pdf', estado: 'SIN_CAMBIOS', mensaje: 'x', titular: 'GOMEZ RUIZ MARIA ELENA' } as const;
const malo = { archivo: 'rol_malo.pdf', estado: 'RECHAZADO', mensaje: 'El PDF está dañado', titular: null } as const;

describe('PreviaCorreccionComponent', () => {
  const crear = (resultados: ResumenCarga['resultados'], aplicando = false) => {
    const fixture = TestBed.createComponent(PreviaCorreccionComponent);
    fixture.componentRef.setInput('resumen', resumen(resultados));
    fixture.componentRef.setInput('aplicando', aplicando);
    fixture.detectChanges();
    const confirmar = vi.fn();
    const cancelar = vi.fn();
    fixture.componentInstance.confirmar.subscribe(confirmar);
    fixture.componentInstance.cancelar.subscribe(cancelar);
    const html = fixture.nativeElement as HTMLElement;
    const boton = (texto: string) =>
      Array.from(html.querySelectorAll('button')).find((b) => b.textContent?.includes(texto)) as HTMLButtonElement;
    return { fixture, componente: fixture.componentInstance, confirmar, cancelar, html, boton };
  };

  beforeEach(() => TestBed.configureTestingModule({ imports: [PreviaCorreccionComponent] }));

  it('anuncia qué rol se va a reemplazar, con el nombre del titular', () => {
    const { html } = crear([juan, maria, malo]);
    expect(html.textContent).toContain('El siguiente rol se va a reemplazar');
    expect(html.textContent).toContain('1712345675');
    expect(html.textContent).toContain('PEREZ LOPEZ JUAN CARLOS');
    expect(html.textContent).toContain('recibirá de nuevo el aviso por correo (1)');
  });

  it('cuenta lo que queda igual y muestra por qué se rechazó lo demás', () => {
    const { html } = crear([juan, maria, malo]);
    expect(html.textContent).toContain('1 sin cambios (no se envía correo)');
    expect(html.textContent).toContain('1 rechazados');
    expect(html.textContent).toContain('El PDF está dañado');
  });

  it('con varios reemplazos lo dice en plural y también anuncia lo nuevo', () => {
    const otro = { ...juan, archivo: '1723456784.pdf', titular: 'SILVA TORRES LUIS' };
    const nuevo = { ...juan, archivo: '1704567890.pdf', estado: 'CARGADO', titular: 'RAMOS VERA PEDRO' } as const;
    const { html } = crear([juan, otro, nuevo]);
    expect(html.textContent).toContain('Los siguientes 2 roles se van a reemplazar');
    expect(html.textContent).toContain('Se agregará 1 rol nuevo');
  });

  it('confirmar y cancelar avisan a quien lo usa', () => {
    const { boton, confirmar, cancelar } = crear([juan]);
    boton('Reemplazar y volver a enviar avisos').click();
    boton('Cancelar').click();
    expect(confirmar).toHaveBeenCalledTimes(1);
    expect(cancelar).toHaveBeenCalledTimes(1);
  });

  it('si nada cambia lo dice y no deja confirmar', () => {
    const { html, componente, boton } = crear([maria, malo]);
    expect(html.textContent).toContain('no cambia ningún rol');
    expect(componente.hayCambios()).toBe(false);
    expect(boton('Reemplazar y volver a enviar avisos').disabled).toBe(true);
  });
});

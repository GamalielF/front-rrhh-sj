import { TestBed } from '@angular/core/testing';
import type { DropdownItem } from '@lumen/ui';
import { FILTROS_VACIOS, FiltrosAuditoria, ModoAuditoria } from '../auditoria.model';
import { FiltrosAuditoriaComponent } from './filtros-auditoria.component';

describe('FiltrosAuditoriaComponent', () => {
  const crear = (modo: ModoAuditoria = 'accesos') => {
    const fixture = TestBed.createComponent(FiltrosAuditoriaComponent);
    fixture.componentRef.setInput('modo', modo);
    fixture.detectChanges();
    const emitidos: FiltrosAuditoria[] = [];
    fixture.componentInstance.buscar.subscribe((filtros) => emitidos.push(filtros));
    return { fixture, componente: fixture.componentInstance, emitidos, html: fixture.nativeElement as HTMLElement };
  };
  const opcion = (id: string) => ({ id }) as DropdownItem;

  beforeEach(() => TestBed.configureTestingModule({ imports: [FiltrosAuditoriaComponent] }));

  it('al buscar entrega todo lo escrito y lo elegido', () => {
    const { componente, emitidos } = crear();
    componente.formulario.patchValue({ desde: '2026-10-01', hasta: '2026-10-20', usuario: 'fsepa', periodo: '2026-10' });
    componente.elegirResultado(opcion('DENEGADO'));
    componente.elegirTipoAcceso(opcion('CONSULTA_AJENA'));
    componente.aplicar();
    expect(emitidos).toEqual([
      { desde: '2026-10-01', hasta: '2026-10-20', usuario: 'fsepa', periodo: '2026-10', resultado: 'DENEGADO', tipoAcceso: 'CONSULTA_AJENA', tipoAccion: '', minimo: 3 },
    ]);
  });

  it('elegir "Todos" en un menú vuelve a no filtrar por eso', () => {
    const { componente } = crear();
    componente.elegirResultado(opcion('DENEGADO'));
    componente.elegirResultado(opcion('todos'));
    expect(componente.resultado()).toBe('');
  });

  it('un rango inválido no busca y explica el problema', () => {
    const { fixture, componente, emitidos, html } = crear();
    componente.formulario.patchValue({ desde: '2026-10-20', hasta: '2026-10-10' });
    componente.aplicar();
    fixture.detectChanges();
    expect(emitidos).toEqual([]);
    expect(html.textContent).toContain('no puede ser posterior');
  });

  it('un período mal escrito no busca', () => {
    const { componente, emitidos } = crear();
    componente.formulario.patchValue({ periodo: 'octubre' });
    componente.aplicar();
    expect(emitidos).toEqual([]);
    expect(componente.error()).toContain('aaaa-mm');
  });

  it('el error se borra al corregir y volver a buscar', () => {
    const { componente, emitidos } = crear();
    componente.formulario.patchValue({ periodo: 'octubre' });
    componente.aplicar();
    componente.formulario.patchValue({ periodo: '2026-10' });
    componente.aplicar();
    expect(componente.error()).toBe('');
    expect(emitidos).toHaveLength(1);
  });

  it('limpiar vuelve todo al inicio y busca sin filtros', () => {
    const { componente, emitidos } = crear();
    componente.formulario.patchValue({ usuario: 'fsepa' });
    componente.elegirResultado(opcion('DENEGADO'));
    componente.limpiar();
    expect(emitidos).toEqual([FILTROS_VACIOS]);
    expect(componente.formulario.getRawValue().usuario).toBe('');
    expect(componente.resultado()).toBe('');
  });

  it('cada vista muestra solo los filtros que le sirven', () => {
    const accesos = crear('accesos').html.textContent;
    expect(accesos).toContain('Resultado: Todos');
    expect(accesos).toContain('Usuario');
    expect(accesos).not.toContain('Acción: Todas');
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({ imports: [FiltrosAuditoriaComponent] });
    const acciones = crear('acciones').html.textContent;
    expect(acciones).toContain('Acción: Todas');
    expect(acciones).not.toContain('Resultado: Todos');
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({ imports: [FiltrosAuditoriaComponent] });
    const denegados = crear('denegados').html.textContent;
    expect(denegados).toContain('Mínimo de intentos denegados');
    expect(denegados).not.toContain('Período');
  });

  it('en intentos denegados el mínimo viaja como número', () => {
    const { componente, emitidos } = crear('denegados');
    componente.formulario.patchValue({ minimo: '5' });
    componente.aplicar();
    expect(emitidos[0].minimo).toBe(5);
  });

  it('al cambiar de vista se olvidan las opciones de la anterior', () => {
    const { fixture, componente } = crear('accesos');
    componente.elegirResultado(opcion('DENEGADO'));
    fixture.componentRef.setInput('modo', 'acciones');
    fixture.detectChanges();
    expect(componente.resultado()).toBe('');
  });

  it('la tarjeta de filtros no recorta los menús desplegables que se abren sobre ella', () => {
    const { html } = crear();
    const tarjeta = html.querySelector('ui-card > div') as HTMLElement;
    expect(tarjeta).not.toBeNull();
    expect(getComputedStyle(tarjeta).overflow).toBe('visible');
  });
});

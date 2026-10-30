import { TestBed } from '@angular/core/testing';
import type { RolPagoResumenResponse } from '@models';
import { RolesPeriodoComponent } from './roles-periodo.component';
import { fallida, muchos, pendiente, rol } from './roles-periodo.testing';

describe('RolesPeriodoComponent: tabla de trabajo', () => {
  const crear = (roles: RolPagoResumenResponse[], publicado = true) => {
    const fixture = TestBed.createComponent(RolesPeriodoComponent);
    fixture.componentRef.setInput('roles', roles);
    fixture.componentRef.setInput('publicado', publicado);
    fixture.componentRef.setInput('periodo', '2026-11');
    fixture.detectChanges();
    const html = fixture.nativeElement as HTMLElement;
    const boton = (texto: string) =>
      Array.from(html.querySelectorAll('button')).find((b) => b.textContent?.includes(texto)) as HTMLButtonElement | undefined;
    return { fixture, componente: fixture.componentInstance, html, boton };
  };

  beforeEach(() => TestBed.configureTestingModule({ imports: [RolesPeriodoComponent] }));

  it('al empezar ordena por nombre, ignorando tildes y mayúsculas', () => {
    const { componente } = crear([rol(1, 'ZAMBRANO LUIS'), rol(2, 'ÁVILA ANA'), rol(3, 'benavides rosa')]);
    expect(componente.filas().map((fila) => fila.nombre)).toEqual(['ÁVILA ANA', 'benavides rosa', 'ZAMBRANO LUIS']);
  });

  it('ya no muestra el tamaño del archivo, que a RRHH no le sirve', () => {
    const { html } = crear([rol(1, 'PEREZ JUAN')]);
    expect(html.textContent).not.toContain('Tamaño');
  });

  describe('filtros rápidos por el estado del aviso', () => {
    const mezcla = [rol(1, 'A'), rol(2, 'B', fallida), rol(3, 'C'), rol(4, 'D', pendiente)];

    it('ofrecen cuántos hay de cada estado, con los problemas primero', () => {
      const { html } = crear(mezcla);
      const texto = html.textContent ?? '';
      expect(texto).toContain('Todos · 4');
      expect(texto).toContain('Con problema · 1');
      expect(texto).toContain('En cola · 1');
      expect(texto).toContain('Notificados · 2');
    });

    it('no aparecen cuando todos los avisos están igual (no hay nada que filtrar)', () => {
      const { html } = crear([rol(1, 'A'), rol(2, 'B')]);
      expect(html.textContent).not.toContain('Todos ·');
    });

    it('pulsar uno deja solo esas personas y marca el chip elegido', () => {
      const { fixture, componente, boton } = crear(mezcla);
      boton('Con problema')?.click();
      fixture.detectChanges();
      expect(componente.filas().map((fila) => fila.nombre)).toEqual(['B']);
      expect(componente.subtitulo()).toBe('1 de 4 roles');
      boton('Todos')?.click();
      fixture.detectChanges();
      expect(componente.filas()).toHaveLength(4);
    });

    it('se combinan con el buscador, y las cantidades siguen a lo que se busca', () => {
      const { fixture, componente, html } = crear(mezcla);
      componente.filtro.setValue('error');
      fixture.detectChanges();
      expect(componente.filas().map((fila) => fila.nombre)).toEqual(['B']);
      expect(html.textContent).not.toContain('En cola ·');
    });

    it('si el estado elegido deja de existir (por ejemplo, tras reenviar) vuelve a mostrar todos', () => {
      const { fixture, componente } = crear(mezcla);
      componente.filtrarGrupo('PROBLEMA');
      expect(componente.filas()).toHaveLength(1);
      fixture.componentRef.setInput('roles', [rol(1, 'A'), rol(2, 'B'), rol(3, 'C', pendiente)]);
      fixture.detectChanges();
      expect(componente.grupoActivo()).toBeNull();
      expect(componente.filas()).toHaveLength(3);
    });
  });

  describe('orden', () => {
    it('"Problemas primero" sube los errores y baja los ya notificados', () => {
      const { componente } = crear([rol(1, 'A'), rol(2, 'B', fallida), rol(3, 'C', pendiente)]);
      componente.ordenarPor({ id: 'PROBLEMAS' });
      expect(componente.filas().map((fila) => fila.nombre)).toEqual(['B', 'C', 'A']);
      expect(componente.etiquetaOrden()).toBe('Problemas primero');
    });

    it('la opción elegida aparece marcada en el menú', () => {
      const { componente } = crear([rol(1, 'A')]);
      componente.ordenarPor({ id: 'CEDULA' });
      expect(componente.opcionesOrden().find((opcion) => opcion.id === 'CEDULA')?.icon).toBe('@tui.check');
      expect(componente.opcionesOrden().find((opcion) => opcion.id === 'NOMBRE')?.icon).toBeUndefined();
    });
  });

  describe('paginación', () => {
    it('con pocas filas no muestra los controles', () => {
      const { html } = crear(muchos(10));
      expect(html.querySelector('ui-pagination')).toBeNull();
    });

    it('con más de diez muestra los controles y reparte de 25 en 25', () => {
      const { componente, html } = crear(muchos(60));
      expect(html.querySelector('ui-pagination')).not.toBeNull();
      expect(componente.filasPagina()).toHaveLength(25);
      componente.pagina.set(2);
      expect(componente.filasPagina()).toHaveLength(10);
      expect(componente.filasPagina()[0].nombre).toBe('PERSONA 051');
    });

    it('buscar, filtrar u ordenar vuelve a la primera página', () => {
      const { componente } = crear(muchos(60));
      componente.pagina.set(2);
      componente.filtro.setValue('persona');
      expect(componente.pagina()).toBe(0);
      componente.pagina.set(2);
      componente.ordenarPor({ id: 'CEDULA' });
      expect(componente.pagina()).toBe(0);
    });

    it('si la lista se acorta, la página visible no se pasa de la última', () => {
      const { fixture, componente } = crear(muchos(60));
      componente.pagina.set(2);
      fixture.componentRef.setInput('roles', muchos(30));
      fixture.detectChanges();
      expect(componente.paginaVisible()).toBe(1);
      expect(componente.filasPagina()).toHaveLength(5);
    });

    it('cambiar el tamaño de página reparte distinto y vuelve al principio', () => {
      const { componente } = crear(muchos(60));
      componente.pagina.set(2);
      componente.cambiarTamano(50);
      expect(componente.pagina()).toBe(0);
      expect(componente.filasPagina()).toHaveLength(50);
    });
  });
});

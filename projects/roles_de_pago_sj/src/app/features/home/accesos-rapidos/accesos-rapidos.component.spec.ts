import { TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { ACCESOS_RAPIDOS } from '../home.model';
import { AccesosRapidosComponent } from './accesos-rapidos.component';

describe('AccesosRapidosComponent', () => {
  beforeEach(() => TestBed.configureTestingModule({ imports: [AccesosRapidosComponent], providers: [provideRouter([])] }));

  it('muestra una tarjeta por acceso, con su título y su descripción', () => {
    const fixture = TestBed.createComponent(AccesosRapidosComponent);
    fixture.componentRef.setInput('accesos', ACCESOS_RAPIDOS.slice(0, 2));
    fixture.detectChanges();
    const texto = (fixture.nativeElement as HTMLElement).textContent;
    expect(texto).toContain('Períodos');
    expect(texto).toContain('Cargue los roles del mes');
    expect(texto).toContain('Usuarios y roles');
    expect(texto).not.toContain('Auditoría');
  });

  it('abrir lleva a la ruta del acceso', () => {
    const fixture = TestBed.createComponent(AccesosRapidosComponent);
    const navegar = vi.spyOn(TestBed.inject(Router), 'navigateByUrl').mockResolvedValue(true);
    fixture.componentInstance.abrir('/admin/auditoria');
    expect(navegar).toHaveBeenCalledWith('/admin/auditoria');
  });
});

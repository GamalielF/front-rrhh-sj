import { ChangeDetectionStrategy, Component, DestroyRef, computed, effect, inject, signal, untracked } from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable, finalize, forkJoin } from 'rxjs';
import { map } from 'rxjs/operators';
import { PageContainerComponent } from '@lumen/ui';
import { AvisoComponent } from '@components';
import { PerfilAplicacionService, puedeVerRolesAjenos } from '@services';
import { formatearPeriodo, ignorarNoEncontrado, mensajeDeError } from '@core/utils';
import type { ListadoPeriodoResponse, ResumenPeriodoResponse } from '@models';
import { PATRON_PERIODO, PeriodoFila, RolFila } from '../rrhh.model';
import { RrhhService } from '../rrhh.service';
import { aFilasPeriodos } from '../rrhh.util';
import { CargaMasivaComponent } from './carga-masiva';
import { CoberturaPeriodoComponent } from './cobertura-periodo';
import { NotificacionesPeriodoComponent } from './notificaciones-periodo';
import { ResumenPeriodoComponent } from './resumen-periodo';
import { RolesPeriodoComponent } from './roles-periodo';
import { SelectorPeriodoComponent } from './selector-periodo';
import { VerRolComponent } from './ver-rol';

@Component({
  selector: 'app-periodo-detalle',
  standalone: true,
  imports: [
    PageContainerComponent,
    AvisoComponent,
    SelectorPeriodoComponent,
    ResumenPeriodoComponent,
    CargaMasivaComponent,
    RolesPeriodoComponent,
    NotificacionesPeriodoComponent,
    CoberturaPeriodoComponent,
    VerRolComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './periodo-detalle.component.html',
  styleUrls: ['./periodo-detalle.component.css'],
})
export class PeriodoDetalleComponent {
  private ruta = inject(ActivatedRoute);
  private router = inject(Router);
  private servicio = inject(RrhhService);
  private destroyRef = inject(DestroyRef);
  private perfilAplicacion = inject(PerfilAplicacionService);

  readonly periodo = toSignal(this.ruta.paramMap.pipe(map((parametros) => parametros.get('periodo') ?? '')), {
    initialValue: '',
  });
  readonly mes = computed(() => formatearPeriodo(this.periodo()));
  readonly puedeVerAjenos = toSignal(this.perfilAplicacion.perfil().pipe(map(puedeVerRolesAjenos)), { initialValue: false });

  readonly periodos = signal<PeriodoFila[]>([]);
  readonly listado = signal<ListadoPeriodoResponse | null>(null);
  readonly resumen = signal<ResumenPeriodoResponse | null>(null);
  readonly cargando = signal(true);
  readonly rolSeleccionado = signal<RolFila | null>(null);
  readonly error = signal('');
  readonly estaPublicado = computed(
    () => (this.resumen() ?? this.listado())?.estadoPeriodo === 'PUBLICADO',
  );
  readonly esNuevo = computed(() => !this.cargando() && !this.error() && !this.listado());

  constructor() {
    effect(() => {
      const periodo = this.periodo();
      if (!PATRON_PERIODO.test(periodo)) {
        this.router.navigate(['/rrhh/periodos']);
        return;
      }
      untracked(() => this.cargar(periodo));
    });
  }

  irA(periodo: string): void {
    this.router.navigate(['/rrhh/periodos', periodo]);
  }

  verRol(rol: RolFila): void {
    this.rolSeleccionado.set(rol);
  }

  inactivar(rol: RolFila): void {
    this.cambiarEstado(this.servicio.inactivarRol(this.periodo(), rol.id));
  }

  activar(rol: RolFila): void {
    this.cambiarEstado(this.servicio.activarRol(this.periodo(), rol.id));
  }

  actualizarRoles(): void {
    this.servicio
      .listado(this.periodo())
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({ next: (listado) => this.listado.set(listado), error: () => undefined });
  }

  recargar(): void {
    this.cargar(this.periodo());
  }

  private cambiarEstado(operacion: Observable<unknown>): void {
    this.error.set('');
    operacion.pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: () => this.recargar(),
      error: (error: unknown) => this.error.set(mensajeDeError(error)),
    });
  }

  private cargar(periodo: string): void {
    this.cargando.set(true);
    this.error.set('');
    forkJoin({
      periodos: this.servicio.periodos(),
      listado: this.servicio.listado(periodo).pipe(ignorarNoEncontrado()),
      resumen: this.servicio.resumen(periodo).pipe(ignorarNoEncontrado()),
    })
      .pipe(
        finalize(() => this.cargando.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: ({ periodos, listado, resumen }) => {
          this.periodos.set(aFilasPeriodos(periodos));
          this.listado.set(listado);
          this.resumen.set(resumen);
        },
        error: (error: unknown) => this.error.set(mensajeDeError(error)),
      });
  }
}

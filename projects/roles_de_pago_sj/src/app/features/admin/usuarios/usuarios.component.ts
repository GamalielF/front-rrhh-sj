import { ChangeDetectionStrategy, Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { Subject, catchError, debounceTime, distinctUntilChanged, finalize, map, of, switchMap } from 'rxjs';
import { CardComponent, InputComponent, PageContainerComponent, PaginationComponent, TableComponent } from '@lumen/ui';
import { AvisoComponent, ConfirmacionComponent } from '@components';
import { mensajeDeError } from '@core/utils';
import { PerfilAplicacionService } from '@services';
import {
  CambioPendiente,
  CambioRol,
  COLUMNAS_USUARIOS,
  RETARDO_BUSQUEDA_MS,
  TAMANO_PAGINA,
  UsuarioFila,
} from './usuarios.model';
import { UsuariosService } from './usuarios.service';
import { accionesDeUsuario, describirCambio, requiereConfirmacion } from './usuarios-acciones.util';
import { aFilasUsuarios } from './usuarios.util';

@Component({
  selector: 'app-usuarios',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    PageContainerComponent,
    CardComponent,
    InputComponent,
    PaginationComponent,
    TableComponent,
    AvisoComponent,
    ConfirmacionComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './usuarios.component.html',
  styleUrls: ['./usuarios.component.css'],
})
export class UsuariosComponent {
  private servicio = inject(UsuariosService);
  private perfilAplicacion = inject(PerfilAplicacionService);
  private destroyRef = inject(DestroyRef);
  private recarga$ = new Subject<void>();
  private usuarioActual = toSignal(this.perfilAplicacion.perfil().pipe(map((perfil) => perfil?.username ?? '')), {
    initialValue: '',
  });

  readonly columnas = COLUMNAS_USUARIOS;
  readonly busqueda = new FormControl('', { nonNullable: true });
  readonly usuarios = signal<UsuarioFila[]>([]);
  readonly privilegiados = signal<UsuarioFila[]>([]);
  readonly pagina = signal(0);
  readonly tamano = signal(TAMANO_PAGINA);
  readonly total = signal(0);
  readonly cargando = signal(true);
  readonly cargandoPrivilegiados = signal(true);
  readonly error = signal('');
  readonly mensaje = signal('');
  readonly pendiente = signal<CambioPendiente | null>(null);
  readonly aplicando = signal(false);
  readonly errorCambio = signal('');

  readonly acciones = computed(() =>
    accionesDeUsuario({ usuarioActual: this.usuarioActual() }, (fila, cambio) => this.solicitar(fila, cambio)),
  );

  constructor() {
    this.recarga$
      .pipe(
        switchMap(() =>
          this.servicio.buscar(this.busqueda.value, this.pagina(), this.tamano()).pipe(
            map((pagina) => ({ pagina, fallo: null as unknown })),
            catchError((fallo: unknown) => of({ pagina: null, fallo })),
          ),
        ),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe(({ pagina, fallo }) => {
        this.cargando.set(false);
        if (pagina) {
          this.usuarios.set(aFilasUsuarios(pagina.elementos));
          this.total.set(pagina.totalElementos);
        } else {
          this.error.set(mensajeDeError(fallo));
        }
      });

    this.busqueda.valueChanges
      .pipe(debounceTime(RETARDO_BUSQUEDA_MS), distinctUntilChanged(), takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        this.pagina.set(0);
        this.recargarUsuarios();
      });

    this.cargarPrivilegiados();
    this.recargarUsuarios();
  }

  cambiarPagina(pagina: number): void {
    this.pagina.set(pagina);
    this.recargarUsuarios();
  }

  cambiarTamano(tamano: number): void {
    this.tamano.set(tamano);
    this.pagina.set(0);
    this.recargarUsuarios();
  }

  solicitar(fila: UsuarioFila, cambio: CambioRol): void {
    const pendiente = describirCambio(fila, cambio);
    this.mensaje.set('');
    this.error.set('');
    if (requiereConfirmacion(cambio)) {
      this.errorCambio.set('');
      this.pendiente.set(pendiente);
    } else {
      this.aplicar(pendiente);
    }
  }

  confirmar(): void {
    const pendiente = this.pendiente();
    if (pendiente) {
      this.aplicar(pendiente);
    }
  }

  cancelar(): void {
    if (!this.aplicando()) {
      this.pendiente.set(null);
    }
  }

  private aplicar(pendiente: CambioPendiente): void {
    this.aplicando.set(true);
    this.servicio
      .aplicar(pendiente.fila.username, pendiente.cambio)
      .pipe(
        finalize(() => this.aplicando.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: () => {
          this.pendiente.set(null);
          this.mensaje.set(pendiente.exito);
          this.cargarPrivilegiados();
          this.recargarUsuarios();
        },
        error: (error: unknown) => this.informarFallo(error),
      });
  }

  private informarFallo(error: unknown): void {
    const motivo = mensajeDeError(error);
    if (this.pendiente()) {
      this.errorCambio.set(motivo);
    } else {
      this.error.set(motivo);
    }
  }

  private recargarUsuarios(): void {
    this.cargando.set(true);
    this.recarga$.next();
  }

  private cargarPrivilegiados(): void {
    this.cargandoPrivilegiados.set(true);
    this.servicio
      .privilegiados()
      .pipe(
        finalize(() => this.cargandoPrivilegiados.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (usuarios) => this.privilegiados.set(aFilasUsuarios(usuarios)),
        error: (error: unknown) => this.error.set(mensajeDeError(error)),
      });
  }
}

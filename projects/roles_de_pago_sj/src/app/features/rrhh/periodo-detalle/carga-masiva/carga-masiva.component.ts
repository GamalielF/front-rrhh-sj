import { ChangeDetectionStrategy, Component, DestroyRef, computed, inject, input, output, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { finalize, last } from 'rxjs';
import { BadgeComponent, ButtonComponent, CardComponent, InputComponent, TableComponent } from '@lumen/ui';
import { AvisoComponent } from '@components';
import { formatearTamano, mensajeDeError } from '@core/utils';
import { MENSAJES_MOTIVO_CORRECCION } from '../motivo-correccion/motivo-correccion.model';
import { PreviaCorreccionComponent } from '../previa-correccion';
import { MOTIVO_MAXIMO, MOTIVO_MINIMO } from '../ver-rol/ver-rol.model';
import {
  ArchivoDescartado,
  COLUMNAS_DESCARTADOS,
  COLUMNAS_RECHAZADOS,
  MAX_ARCHIVOS_LOTE,
  MAX_BYTES_LOTE,
  ProgresoCarga,
  ResumenCarga,
} from './carga-masiva.model';
import { CargaMasivaService } from './carga-masiva.service';
import { clasificarArchivos, crearLotes, sumarBytes } from './carga-masiva.util';

@Component({
  selector: 'app-carga-masiva',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    BadgeComponent,
    ButtonComponent,
    CardComponent,
    InputComponent,
    TableComponent,
    AvisoComponent,
    PreviaCorreccionComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './carga-masiva.component.html',
  styleUrls: ['./carga-masiva.component.css'],
})
export class CargaMasivaComponent {
  private servicio = inject(CargaMasivaService);
  private destroyRef = inject(DestroyRef);

  readonly periodo = input.required<string>();
  /** Período ya publicado: se corrige en dos pasos (revisar y confirmar con un motivo). */
  readonly correccion = input(false);
  readonly cargaFinalizada = output<void>();

  readonly columnasDescartados = COLUMNAS_DESCARTADOS;
  readonly columnasRechazados = COLUMNAS_RECHAZADOS;
  readonly mensajesMotivo = MENSAJES_MOTIVO_CORRECCION;
  readonly motivo = new FormControl('', {
    nonNullable: true,
    validators: [Validators.required, Validators.minLength(MOTIVO_MINIMO), Validators.maxLength(MOTIVO_MAXIMO)],
  });

  readonly archivosValidos = signal<File[]>([]);
  readonly descartados = signal<ArchivoDescartado[]>([]);
  readonly arrastrando = signal(false);
  readonly subiendo = signal(false);
  readonly revisando = signal(false);
  readonly previa = signal<ResumenCarga | null>(null);
  readonly progreso = signal<ProgresoCarga | null>(null);
  readonly error = signal('');

  readonly tamanoTotal = computed(() => formatearTamano(sumarBytes(this.archivosValidos())));
  readonly totalLotes = computed(() => crearLotes(this.archivosValidos(), MAX_ARCHIVOS_LOTE, MAX_BYTES_LOTE).length);
  readonly rechazadosPorServidor = computed(
    () => this.progreso()?.resumen.resultados.filter((resultado) => resultado.estado === 'RECHAZADO') ?? [],
  );

  alElegir(evento: Event): void {
    const entrada = evento.target as HTMLInputElement;
    this.seleccionar(Array.from(entrada.files ?? []));
    entrada.value = '';
  }

  alArrastrar(evento: DragEvent): void {
    evento.preventDefault();
    this.arrastrando.set(true);
  }

  alSoltar(evento: DragEvent): void {
    evento.preventDefault();
    this.arrastrando.set(false);
    this.seleccionar(Array.from(evento.dataTransfer?.files ?? []));
  }

  limpiar(): void {
    this.seleccionar([]);
  }

  /** Solo en corrección: pregunta qué pasaría con cada archivo, sin guardar nada. */
  revisar(): void {
    const lotes = crearLotes(this.archivosValidos(), MAX_ARCHIVOS_LOTE, MAX_BYTES_LOTE);
    if (lotes.length === 0 || this.revisando() || this.subiendo()) {
      return;
    }
    this.error.set('');
    this.revisando.set(true);
    this.servicio
      .cargarEnLotes(this.periodo(), lotes, { simular: true })
      .pipe(
        last(),
        finalize(() => this.revisando.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (avance) => this.previa.set(avance.resumen),
        error: (error: unknown) => this.error.set(mensajeDeError(error)),
      });
  }

  cancelarPrevia(): void {
    this.previa.set(null);
  }

  subir(): void {
    const lotes = crearLotes(this.archivosValidos(), MAX_ARCHIVOS_LOTE, MAX_BYTES_LOTE);
    if (lotes.length === 0 || this.subiendo()) {
      return;
    }
    if (this.correccion()) {
      this.motivo.markAsTouched();
      if (this.motivo.invalid) {
        return;
      }
    }
    this.error.set('');
    this.subiendo.set(true);
    const carga = this.correccion()
      ? this.servicio.cargarEnLotes(this.periodo(), lotes, { motivo: this.motivo.value.trim() })
      : this.servicio.cargarEnLotes(this.periodo(), lotes);
    carga
      .pipe(
        finalize(() => this.subiendo.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (progreso) => this.progreso.set(progreso),
        error: (error: unknown) => {
          this.error.set(mensajeDeError(error));
          this.cargaFinalizada.emit();
        },
        complete: () => {
          this.archivosValidos.set([]);
          this.previa.set(null);
          this.motivo.reset('');
          this.cargaFinalizada.emit();
        },
      });
  }

  private seleccionar(archivos: File[]): void {
    if (this.subiendo()) {
      return;
    }
    const { validos, descartados } = clasificarArchivos(archivos);
    this.archivosValidos.set(validos);
    this.descartados.set(descartados);
    this.progreso.set(null);
    this.previa.set(null);
    this.error.set('');
  }
}

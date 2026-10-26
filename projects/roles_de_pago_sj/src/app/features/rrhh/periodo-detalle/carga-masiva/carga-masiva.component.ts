import { ChangeDetectionStrategy, Component, DestroyRef, computed, inject, input, output, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize } from 'rxjs';
import { BadgeComponent, ButtonComponent, CardComponent, TableComponent } from '@lumen/ui';
import { AvisoComponent } from '@components';
import { formatearTamano, mensajeDeError } from '@core/utils';
import {
  ArchivoDescartado,
  COLUMNAS_DESCARTADOS,
  COLUMNAS_RECHAZADOS,
  MAX_ARCHIVOS_LOTE,
  MAX_BYTES_LOTE,
  ProgresoCarga,
} from './carga-masiva.model';
import { CargaMasivaService } from './carga-masiva.service';
import { clasificarArchivos, crearLotes, sumarBytes } from './carga-masiva.util';

@Component({
  selector: 'app-carga-masiva',
  standalone: true,
  imports: [BadgeComponent, ButtonComponent, CardComponent, TableComponent, AvisoComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './carga-masiva.component.html',
  styleUrls: ['./carga-masiva.component.css'],
})
export class CargaMasivaComponent {
  private servicio = inject(CargaMasivaService);
  private destroyRef = inject(DestroyRef);

  readonly periodo = input.required<string>();
  readonly cargaFinalizada = output<void>();

  readonly columnasDescartados = COLUMNAS_DESCARTADOS;
  readonly columnasRechazados = COLUMNAS_RECHAZADOS;

  readonly archivosValidos = signal<File[]>([]);
  readonly descartados = signal<ArchivoDescartado[]>([]);
  readonly arrastrando = signal(false);
  readonly subiendo = signal(false);
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

  subir(): void {
    const lotes = crearLotes(this.archivosValidos(), MAX_ARCHIVOS_LOTE, MAX_BYTES_LOTE);
    if (lotes.length === 0 || this.subiendo()) {
      return;
    }
    this.error.set('');
    this.subiendo.set(true);
    this.servicio
      .cargarEnLotes(this.periodo(), lotes)
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
    this.error.set('');
  }
}

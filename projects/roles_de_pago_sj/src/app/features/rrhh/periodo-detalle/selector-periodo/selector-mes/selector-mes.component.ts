import { ChangeDetectionStrategy, Component, computed, effect, input, output, signal, untracked } from '@angular/core';
import { ButtonComponent } from '@lumen/ui';
import { mesSiguiente, periodoActual } from '../../../rrhh.util';
import { anioInicial, celdasDelAnio } from './selector-mes.util';

@Component({
  selector: 'app-selector-mes',
  standalone: true,
  imports: [ButtonComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './selector-mes.component.html',
  styleUrls: ['./selector-mes.component.css'],
})
export class SelectorMesComponent {
  readonly valor = input('');
  readonly minimo = input.required<string>();
  readonly maximo = input.required<string>();
  readonly existentes = input<readonly string[]>([]);
  readonly hoy = input(new Date());
  readonly elegido = output<string>();

  private anioNavegado = signal<number | null>(null);

  readonly esteMes = computed(() => periodoActual(this.hoy()));
  readonly anio = computed(
    () => this.anioNavegado() ?? anioInicial(this.valor(), this.esteMes(), this.minimo(), this.maximo()),
  );
  readonly celdas = computed(() =>
    celdasDelAnio(this.anio(), {
      minimo: this.minimo(),
      maximo: this.maximo(),
      seleccionado: this.valor(),
      existentes: this.existentes(),
    }),
  );
  readonly puedeRetroceder = computed(() => this.anio() > Number(this.minimo().slice(0, 4)));
  readonly puedeAvanzar = computed(() => this.anio() < Number(this.maximo().slice(0, 4)));
  readonly atajos = computed(() =>
    [
      { etiqueta: 'Este mes', periodo: this.esteMes() },
      { etiqueta: 'Mes siguiente', periodo: mesSiguiente(this.esteMes()) },
    ].filter((atajo) => atajo.periodo >= this.minimo() && atajo.periodo <= this.maximo()),
  );

  constructor() {
    effect(() => {
      this.valor();
      untracked(() => this.anioNavegado.set(null));
    });
  }

  cambiarAnio(diferencia: number): void {
    this.anioNavegado.set(this.anio() + diferencia);
  }

  elegir(periodo: string): void {
    this.elegido.emit(periodo);
  }
}

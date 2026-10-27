import { ChangeDetectionStrategy, Component, inject, input } from '@angular/core';
import { Router } from '@angular/router';
import { ButtonComponent, CardComponent, GridComponent } from '@lumen/ui';
import { AccesoRapido } from '../home.model';

@Component({
  selector: 'app-accesos-rapidos',
  standalone: true,
  imports: [ButtonComponent, CardComponent, GridComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './accesos-rapidos.component.html',
  styleUrls: ['./accesos-rapidos.component.css'],
})
export class AccesosRapidosComponent {
  private router = inject(Router);

  readonly accesos = input<AccesoRapido[]>([]);

  abrir(ruta: string): void {
    this.router.navigateByUrl(ruta);
  }
}

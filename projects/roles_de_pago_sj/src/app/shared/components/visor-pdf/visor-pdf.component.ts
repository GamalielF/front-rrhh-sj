import { ChangeDetectionStrategy, Component, effect, inject, input, signal } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { ButtonComponent } from '@lumen/ui';
import { base64ToBlob, descargarBlob } from '@core/utils';
import type { RolPagoPdfResponse } from '@models';

@Component({
  selector: 'app-visor-pdf',
  standalone: true,
  imports: [ButtonComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './visor-pdf.component.html',
  styleUrls: ['./visor-pdf.component.css'],
})
export class VisorPdfComponent {
  private sanitizer = inject(DomSanitizer);

  private url = '';

  readonly pdf = input.required<RolPagoPdfResponse>();
  readonly permitirDescarga = input(false);
  readonly direccion = signal<SafeResourceUrl | null>(null);

  constructor() {
    effect((alLimpiar) => {
      const { contenidoBase64, tipoContenido } = this.pdf();
      const url = URL.createObjectURL(base64ToBlob(contenidoBase64, tipoContenido));
      this.url = url;
      this.direccion.set(this.sanitizer.bypassSecurityTrustResourceUrl(url));
      alLimpiar(() => URL.revokeObjectURL(url));
    });
  }

  descargar(): void {
    const { contenidoBase64, tipoContenido, periodo } = this.pdf();
    descargarBlob(base64ToBlob(contenidoBase64, tipoContenido), `rol-de-pago-${periodo}.pdf`);
  }

  abrirAparte(): void {
    window.open(this.url, '_blank', 'noopener');
  }
}

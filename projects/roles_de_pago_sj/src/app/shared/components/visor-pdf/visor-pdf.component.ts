import { ChangeDetectionStrategy, Component, effect, inject, input, signal } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import type { RolPagoPdfResponse } from '@models';
import { base64ToBlob } from './visor-pdf.util';

@Component({
  selector: 'app-visor-pdf',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './visor-pdf.component.html',
  styleUrls: ['./visor-pdf.component.css'],
})
export class VisorPdfComponent {
  private sanitizer = inject(DomSanitizer);

  readonly pdf = input.required<RolPagoPdfResponse>();
  readonly direccion = signal<SafeResourceUrl | null>(null);

  constructor() {
    effect((alLimpiar) => {
      const { contenidoBase64, tipoContenido } = this.pdf();
      const url = URL.createObjectURL(base64ToBlob(contenidoBase64, tipoContenido));
      this.direccion.set(this.sanitizer.bypassSecurityTrustResourceUrl(url));
      alLimpiar(() => URL.revokeObjectURL(url));
    });
  }
}

import { Component, Input, OnChanges, SimpleChanges, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import * as QRCode from 'qrcode';

@Component({
  selector: 'ui-qr-code',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './qr-code.component.html',
  styleUrls: ['./qr-code.component.css'],
})
export class QrCodeComponent implements OnChanges {
  private sanitizer = inject(DomSanitizer);
  private cdr = inject(ChangeDetectorRef);

  @Input() value = '';
  @Input() size = 180;

  svgHtml: SafeHtml = '';

  ngOnChanges(changes: SimpleChanges): void {
    if (this.value) {
      QRCode.toString(
        this.value,
        {
          type: 'svg',
          margin: 1,
          width: this.size,
          errorCorrectionLevel: 'M',
        },
        (err, svgString) => {
          if (!err && svgString) {
            this.svgHtml = this.sanitizer.bypassSecurityTrustHtml(svgString);
          } else {
            this.svgHtml = '';
          }
          this.cdr.detectChanges();
        }
      );
    } else {
      this.svgHtml = '';
    }
  }
}

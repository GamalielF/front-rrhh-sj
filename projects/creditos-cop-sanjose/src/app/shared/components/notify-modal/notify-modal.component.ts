import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Credit, WhatsappTemplate, WhatsappRequestFull, WhatsappRequest, WhatsappResponse, WhatsAppVariables } from '@models';
import { WhatsappService } from '@services';
import { AuthService } from '@lumen/auth';
import { RecipientSelectorComponent, RecipientData, RecipientSelection } from '@components/recipient-selector';
import { ModalComponent, ButtonComponent, IconComponent } from '@lumen/ui';
import { CreditGroup } from './notify-modal.model';

@Component({
  selector: 'app-notify-modal',
  standalone: true,
  imports: [CommonModule, ModalComponent, ButtonComponent, IconComponent, RecipientSelectorComponent],
  templateUrl: './notify-modal.component.html',
})
export class NotifyModalComponent implements OnChanges {
  @Input() credit: Credit | null = null;
  @Input() credits: Credit[] = [];
  @Input() isOpen = false;
  @Output() close = new EventEmitter<void>();

  private whatsapp = inject(WhatsappService);
  private auth = inject(AuthService);
  private cdr = inject(ChangeDetectorRef);

  creditGroups: CreditGroup[] = [];
  selections = new Map<string, RecipientSelection>();
  sending = false;
  apiResponse: WhatsappResponse | null = null;
  activeCredits: Credit[] = [];

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['credit'] || changes['credits'] || changes['isOpen']) {
      this.reset();
      this.activeCredits = this.credits && this.credits.length > 0
        ? this.credits
        : (this.credit ? [this.credit] : []);
      if (this.activeCredits.length > 0) this.buildCreditGroups();
    }
  }

  get canSend(): boolean {
    return [...this.selections.values()].some(s => s.included && s.selectedPhones?.length > 0);
  }

  get noRecipientsWithPhone(): boolean {
    return this.creditGroups.every(g => g.recipients.every(r => !r.rawPhones));
  }

  onSelectionChange(sel: RecipientSelection): void { this.selections.set(sel.recipientId, sel); }
  onClose(): void { this.close.emit(); }

  send(): void {
    if (!this.activeCredits.length) return;

    const requests: WhatsappRequest[] = [];
    for (const group of this.creditGroups) {
      for (const recipient of group.recipients) {
        const sel = this.selections.get(recipient.id);
        if (!sel?.included || !sel.selectedPhones?.length) continue;
        const template = 'WELCOME_WHATSAPP';
        const variables = this.buildTemplateVariables(template, recipient, group.credit);
        for (const phone of sel.selectedPhones.map(p => p.trim().replace(/^0/, '593'))) {
          if (!phone) continue;
          requests.push({
            channel: 'WHATSAPP',
            destinatario: phone,
            codigoPlantilla: template,
            mensaje: 'Notificación de Crédito COP San José',
            variables,
            media: {
              type: 'IMAGE',
              url: 'https://raw.githubusercontent.com/mariosavala/graf-coop/refs/heads/main/CUMPLEA%C3%91OS.jpg',
              mimeType: 'image/jpeg',
              fileName: 'CUMPLEA%C3%91OS.jpg'
            }
          });
        }
      }
    }
    if (!requests.length) return;
    this.sending = true;
    this.whatsapp.sendNotifications({ notifications: requests } as WhatsappRequestFull).subscribe({
      next: (res) => { this.apiResponse = res; this.sending = false; this.cdr.detectChanges(); },
      error: (err) => {
        this.apiResponse = { success: false, status: err.status || 'ERROR', message: err.message || 'Error al conectar con el servidor', timestamp: new Date().toISOString() };
        this.sending = false;
        this.cdr.detectChanges();
      }
    });
  }

  private buildCreditGroups(): void {
    this.creditGroups = this.activeCredits.map(c => ({ credit: c, recipients: this.getRecipientsForCredit(c) }));
  }

  private getRecipientsForCredit(c: Credit): RecipientData[] {
    const code = c.creditCode;
    return [
      { id: `${code}_socio`, roleLabel: 'Socio', fullName: c.fullName, rawPhones: this.mergePhones(c.cellphone, c.telephone) },
      ...(c.guarantor1FullName ? [{ id: `${code}_garante1`, roleLabel: 'Garante 1', fullName: c.guarantor1FullName, rawPhones: this.mergePhones(c.guarantor1Cellphone, c.guarantor1Telephone) }] : []),
      ...(c.guarantor2FullName ? [{ id: `${code}_garante2`, roleLabel: 'Garante 2', fullName: c.guarantor2FullName, rawPhones: this.mergePhones(c.guarantor2Cellphone, c.guarantor2Telephone) }] : []),
    ];
  }

  private buildTemplateVariables(_template: WhatsappTemplate, recipient: RecipientData | undefined, credit: Credit): WhatsAppVariables {
    return { FirstName: recipient?.fullName ?? credit.fullName, CompanyName: 'COP San Jose', UserName: credit.advisorCode } satisfies WhatsAppVariables;
  }

  private mergePhones(a: string | null, b: string | null): string | null {
    const parts = [a, b].filter(Boolean);
    return parts.length ? parts.join(', ') : null;
  }

  private reset(): void { this.selections.clear(); this.creditGroups = []; this.apiResponse = null; this.sending = false; }
}

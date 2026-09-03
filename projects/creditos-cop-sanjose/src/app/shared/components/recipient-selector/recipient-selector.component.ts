import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RecipientData, RecipientSelection } from './recipent-selector.model';

@Component({
  selector: 'app-recipient-selector',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './recipient-selector.component.html',
})
export class RecipientSelectorComponent implements OnChanges {
  @Input() recipient!: RecipientData;
  @Input() initialIncluded = true;
  @Output() selectionChange = new EventEmitter<RecipientSelection>();

  phones: string[] = [];
  selectedPhones: string[] = [];
  included = true;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['recipient'] || changes['initialIncluded']) {
      this.phones = this.parsePhones(this.recipient?.rawPhones);
      this.included = this.initialIncluded && this.phones.length > 0;
      this.selectedPhones = this.included ? [...this.phones] : [];
      this.emitChange();
    }
  }

  get allSelected(): boolean {
    return this.phones.length > 0 && this.selectedPhones.length === this.phones.length;
  }

  isPhoneSelected(phone: string): boolean {
    return this.selectedPhones.includes(phone);
  }

  toggleIncluded(): void {
    this.included = !this.included;
    this.selectedPhones = this.included ? [...this.phones] : [];
    this.emitChange();
  }

  togglePhone(phone: string): void {
    this.selectedPhones = this.isPhoneSelected(phone)
      ? this.selectedPhones.filter(p => p !== phone)
      : [...this.selectedPhones, phone];
    this.included = this.selectedPhones.length > 0;
    this.emitChange();
  }

  toggleSelectAll(): void {
    if (this.allSelected) {
      this.selectedPhones = [];
      this.included = false;
    } else {
      this.selectedPhones = [...this.phones];
      this.included = true;
    }
    this.emitChange();
  }

  private parsePhones(raw: string | null | undefined): string[] {
    if (!raw) return [];
    return raw.split(',').map(p => p.trim()).filter(p => p.length > 0);
  }

  private emitChange(): void {
    this.selectionChange.emit({
      recipientId: this.recipient?.id ?? '',
      selectedPhones: [...this.selectedPhones],
      included: this.included && this.selectedPhones.length > 0
    });
  }
}

import { CommonModule, CurrencyPipe } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  IonBackButton,
  IonBadge,
  IonButton,
  IonButtons,
  IonCol,
  IonContent,
  IonGrid,
  IonHeader,
  IonIcon,
  IonRow,
  IonTitle,
  IonToast,
  IonToolbar,
} from '@ionic/angular';
import { FinanceService } from '../../services/finance.service';

@Component({
  selector: 'app-banks',
  templateUrl: './banks.page.html',
  styleUrls: ['./banks.page.scss'],
  imports: [
    CommonModule,
    CurrencyPipe,
    RouterLink,
    IonHeader,
    IonToolbar,
    IonButtons,
    IonBackButton,
    IonTitle,
    IonButton,
    IonIcon,
    IonContent,
    IonGrid,
    IonRow,
    IonCol,
    IonBadge,
    IonToast,
  ],
})
export class BanksPage {
  public readonly finance = inject(FinanceService);

  readonly toastOpen = signal<boolean>(false);
  readonly toastMessage = signal<string>('');
  readonly toastColor = signal<string>('success');

  onToggleBank(bankId: string, bankName: string, currentlyConnected: boolean): void {
    this.finance.toggleBankConnection(bankId);
    if (!currentlyConnected) {
      this.showToast(`${bankName} conectado via Open Finance com sucesso!`, 'success');
    } else {
      this.showToast(`Conexão com ${bankName} desconectada.`, 'medium');
    }
  }

  onSyncNow(): void {
    const count = this.finance.syncConnectedBanks();
    if (count > 0) {
      this.showToast(
        'Extrato sincronizado! Nova compra importada para você classificar na aba Receitas & Gastos.',
        'primary'
      );
    } else {
      this.showToast('Conecte pelo menos um banco abaixo antes de sincronizar.', 'warning');
    }
  }

  private showToast(msg: string, color: string): void {
    this.toastMessage.set(msg);
    this.toastColor.set(color);
    this.toastOpen.set(true);
  }
}

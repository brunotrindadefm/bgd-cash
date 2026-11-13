import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import {
  IonBadge,
  IonButton,
  IonButtons,
  IonCol,
  IonContent,
  IonGrid,
  IonHeader,
  IonIcon,
  IonInput,
  IonItem,
  IonLabel,
  IonRow,
  IonSegment,
  IonSegmentButton,
  IonSelect,
  IonSelectOption,
  IonTitle,
  IonToast,
  IonToggle,
  IonToolbar,
} from '@ionic/angular';
import { TransactionType } from '../models/finance.models';
import { FinanceService } from '../services/finance.service';

@Component({
  selector: 'app-tab3',
  templateUrl: 'tab3.page.html',
  styleUrls: ['tab3.page.scss'],
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonButtons,
    IonButton,
    IonIcon,
    IonContent,
    IonSegment,
    IonSegmentButton,
    IonLabel,
    IonGrid,
    IonRow,
    IonCol,
    IonItem,
    IonInput,
    IonSelect,
    IonSelectOption,
    IonToggle,
    IonBadge,
    IonToast,
  ],
})
export class Tab3Page {
  public readonly finance = inject(FinanceService);
  private readonly router = inject(Router);

  readonly profileTab = signal<'categories' | 'settings'>('categories');

  // New Category Form
  readonly newCatName = signal<string>('');
  readonly newCatType = signal<TransactionType | 'both'>('expense');
  readonly newCatColor = signal<string>('#10b981');
  readonly newCatIcon = signal<string>('pricetag-outline');

  readonly availableIcons = [
    { name: 'fast-food-outline', label: 'Comida' },
    { name: 'cafe-outline', label: 'Café' },
    { name: 'pizza-outline', label: 'Pizza' },
    { name: 'cart-outline', label: 'Mercado' },
    { name: 'car-sport-outline', label: 'Carro' },
    { name: 'airplane-outline', label: 'Viagem' },
    { name: 'home-outline', label: 'Casa' },
    { name: 'medkit-outline', label: 'Saúde' },
    { name: 'fitness-outline', label: 'Academia' },
    { name: 'game-controller-outline', label: 'Jogos' },
    { name: 'tv-outline', label: 'Streaming' },
    { name: 'school-outline', label: 'Educação' },
    { name: 'shirt-outline', label: 'Roupas' },
    { name: 'paw-outline', label: 'Pet' },
    { name: 'gift-outline', label: 'Presente' },
    { name: 'cash-outline', label: 'Salário' },
    { name: 'trending-up-outline', label: 'Investimento' },
    { name: 'pricetag-outline', label: 'Geral' },
  ];

  readonly availableColors = [
    '#ef4444',
    '#f59e0b',
    '#10b981',
    '#059669',
    '#3b82f6',
    '#6366f1',
    '#8b5cf6',
    '#ec4899',
    '#14b8a6',
    '#64748b',
  ];

  // Editable Profile Fields
  readonly editName = signal<string>(this.finance.profile().name);
  readonly editEmail = signal<string>(this.finance.profile().email);

  // Toast feedback
  readonly toastOpen = signal<boolean>(false);
  readonly toastMessage = signal<string>('');
  readonly toastColor = signal<string>('success');

  onSubTabChange(value: string | number | undefined): void {
    if (value === 'categories' || value === 'settings') {
      this.profileTab.set(value);
      this.editName.set(this.finance.profile().name);
      this.editEmail.set(this.finance.profile().email);
    }
  }

  onAddCategory(): void {
    const name = this.newCatName().trim();
    if (!name) {
      this.showToast('Informe um nome para a nova categoria.', 'warning');
      return;
    }

    this.finance.addCategory({
      name,
      type: this.newCatType(),
      color: this.newCatColor(),
      icon: this.newCatIcon(),
    });

    this.newCatName.set('');
    this.showToast(`Categoria "${name}" adicionada! Já disponível no Select.`, 'success');
  }

  onRemoveCategory(catId: string, catName: string): void {
    const ok = this.finance.removeCategory(catId);
    if (ok) {
      this.showToast(`Categoria "${catName}" removida.`, 'medium');
    } else {
      this.showToast('Mantenha pelo menos uma categoria ativa no sistema.', 'warning');
    }
  }

  onSaveProfile(): void {
    const name = this.editName().trim();
    const email = this.editEmail().trim();
    if (!name) {
      this.showToast('O nome não pode ficar vazio.', 'warning');
      return;
    }
    this.finance.updateProfile({ name, email });
    this.showToast('Dados do perfil atualizados com sucesso!', 'success');
  }

  onToggleDarkMode(enabled: boolean): void {
    this.finance.updateProfile({ darkMode: enabled });
  }

  onToggleAutoSuggest(enabled: boolean): void {
    this.finance.updateProfile({ autoSuggestCategory: enabled });
  }

  onToggleNotifications(enabled: boolean): void {
    this.finance.updateProfile({ notificationsEnabled: enabled });
  }

  async onTestNotification(): Promise<void> {
    const granted = await this.finance.requestNotificationPermission();
    if (granted) {
      this.finance.sendNotification(
        'BGD Cash • Notificação PWA',
        'Notificações ativadas! Você receberá alertas sobre novos gastos e contas agendadas.'
      );
      this.showToast('Notificação de teste disparada com sucesso!', 'success');
    } else {
      this.showToast('Permissão de notificações não concedida no navegador.', 'warning');
    }
  }

  onResetDemo(): void {
    this.finance.resetDemoData();
    this.editName.set(this.finance.profile().name);
    this.editEmail.set(this.finance.profile().email);
    this.showToast('Dados de demonstração restaurados!', 'primary');
  }

  onLogout(): void {
    this.finance.logout();
    this.router.navigateByUrl('/login');
  }

  private showToast(message: string, color: string): void {
    this.toastMessage.set(message);
    this.toastColor.set(color);
    this.toastOpen.set(true);
  }
}

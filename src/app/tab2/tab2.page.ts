import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import {
  IonBadge,
  IonButton,
  IonButtons,
  IonChip,
  IonCol,
  IonContent,
  IonGrid,
  IonHeader,
  IonIcon,
  IonInput,
  IonItem,
  IonLabel,
  IonModal,
  IonRow,
  IonSegment,
  IonSegmentButton,
  IonSelect,
  IonSelectOption,
  IonTextarea,
  IonTitle,
  IonToast,
  IonToolbar,
} from '@ionic/angular';
import { Transaction, TransactionTiming, TransactionType } from '../models/finance.models';
import { FinanceService } from '../services/finance.service';

@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss'],
  imports: [
    CommonModule,
    FormsModule,
    CurrencyPipe,
    DatePipe,
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
    IonBadge,
    IonChip,
    IonGrid,
    IonRow,
    IonCol,
    IonItem,
    IonInput,
    IonSelect,
    IonSelectOption,
    IonTextarea,
    IonToast,
    IonModal,
  ],
})
export class Tab2Page {
  public readonly finance = inject(FinanceService);
  private readonly route = inject(ActivatedRoute);

  readonly activeSegment = signal<'past' | 'upcoming' | 'add'>('past');
  readonly filterMode = signal<'all' | 'review' | 'bank'>('all');

  // Confirmation modal state for deleting a transaction
  readonly pendingDeleteTx = signal<Transaction | null>(null);

  // Form states for adding a new Income / Expense
  readonly formType = signal<TransactionType>('expense');
  readonly formTitle = signal<string>('');
  readonly formAmount = signal<number | null>(null);
  readonly formCategoryId = signal<string>('cat-food');
  readonly formTiming = signal<TransactionTiming>('past');
  readonly formDate = signal<string>(new Date().toISOString().split('T')[0]);
  readonly formBankId = signal<string>('manual');
  readonly formNotes = signal<string>('');

  // Toast feedback (positioned at top)
  readonly toastOpen = signal<boolean>(false);
  readonly toastMessage = signal<string>('');
  readonly toastColor = signal<string>('success');

  readonly filteredPastTransactions = computed(() => {
    const list = this.finance.pastTransactions();
    const mode = this.filterMode();
    if (mode === 'review') return list.filter((t) => t.needsReview);
    if (mode === 'bank') return list.filter((t) => t.source === 'bank');
    return list;
  });

  readonly availableCategoriesForForm = computed(() => {
    const type = this.formType();
    return this.finance
      .categories()
      .filter((c) => c.type === 'both' || c.type === type);
  });

  constructor() {
    this.route.queryParamMap.subscribe((params) => {
      const view = params.get('view');
      if (view === 'past' || view === 'upcoming' || view === 'add') {
        this.activeSegment.set(view);
      }
    });
  }

  onSegmentChange(value: string | number | undefined): void {
    if (value === 'past' || value === 'upcoming' || value === 'add') {
      this.activeSegment.set(value);
    }
  }

  onFormTypeChange(type: TransactionType): void {
    this.formType.set(type);
    const matching = this.availableCategoriesForForm();
    if (matching.length > 0 && !matching.some((c) => c.id === this.formCategoryId())) {
      this.formCategoryId.set(matching[0].id);
    }
  }

  onTitleInput(title: string): void {
    this.formTitle.set(title);
    if (this.finance.profile().autoSuggestCategory && title.trim().length >= 3) {
      const suggested = this.finance.inferCategoryForTitle(title, this.formType());
      this.formCategoryId.set(suggested);
    }
  }

  onChangeTransactionCategory(transactionId: string, newCategoryId: string): void {
    if (!newCategoryId) return;
    this.finance.updateTransactionCategory(transactionId, newCategoryId);
    const cat = this.finance.getCategoryById(newCategoryId);
    this.showToast(`Gasto classificado como "${cat.name}" com sucesso!`, 'success');
  }

  onConfirmSuggestion(transactionId: string): void {
    this.finance.confirmTransactionCategory(transactionId);
    this.showToast('Classificação sugerida confirmada!', 'primary');
  }

  onRealizeTransaction(transactionId: string): void {
    this.finance.realizeUpcomingTransaction(transactionId);
    this.showToast('Transação movida para Últimas Transações (Realizadas)!', 'success');
  }

  openDeleteModal(tx: Transaction): void {
    this.pendingDeleteTx.set(tx);
  }

  closeDeleteModal(): void {
    this.pendingDeleteTx.set(null);
  }

  confirmDeleteTransaction(): void {
    const tx = this.pendingDeleteTx();
    if (!tx) return;
    this.finance.deleteTransaction(tx.id);
    this.pendingDeleteTx.set(null);
    this.showToast(`Transação "${tx.title}" excluída com sucesso.`, 'danger');
  }

  onSyncBanks(): void {
    const importedCount = this.finance.syncConnectedBanks();
    if (importedCount > 0) {
      this.showToast(
        'Nova transação sincronizada do banco! Classifique a categoria abaixo.',
        'tertiary'
      );
    } else {
      this.showToast('Conecte ao menos um banco para sincronizar transações.', 'warning');
    }
  }

  onSubmitNewTransaction(): void {
    const title = this.formTitle().trim();
    const amount = Number(this.formAmount());
    if (!title || !amount || amount <= 0) {
      this.showToast('Preencha a descrição e um valor válido maior que zero.', 'warning');
      return;
    }

    const bankId = this.formBankId() === 'manual' ? undefined : this.formBankId();
    const source = bankId ? 'bank' : 'manual';

    this.finance.addTransaction({
      title,
      amount,
      type: this.formType(),
      timing: this.formTiming(),
      date: this.formDate(),
      categoryId: this.formCategoryId(),
      source,
      bankId,
      notes: this.formNotes().trim() || undefined,
    });

    const targetTab = this.formTiming();
    this.formTitle.set('');
    this.formAmount.set(null);
    this.formNotes.set('');
    this.activeSegment.set(targetTab);
    this.showToast(
      this.formType() === 'income'
        ? 'Nova receita cadastrada com sucesso!'
        : 'Nova despesa cadastrada com sucesso!',
      'success'
    );
  }

  private showToast(message: string, color: string): void {
    this.toastMessage.set(message);
    this.toastColor.set(color);
    this.toastOpen.set(true);
  }
}

import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
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
  IonLabel,
  IonModal,
  IonProgressBar,
  IonRow,
  IonSegment,
  IonSegmentButton,
  IonSelect,
  IonSelectOption,
  IonTitle,
  IonToast,
  IonToolbar,
} from '@ionic/angular';
import { Transaction } from '../models/finance.models';
import { FinanceService } from '../services/finance.service';

export interface PieSlice {
  categoryName: string;
  color: string;
  icon: string;
  total: number;
  percentage: number;
  dashArray: string;
  dashOffset: number;
}

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss'],
  imports: [
    CommonModule,
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
    IonGrid,
    IonRow,
    IonCol,
    IonBadge,
    IonChip,
    IonLabel,
    IonProgressBar,
    IonSegment,
    IonSegmentButton,
    IonSelect,
    IonSelectOption,
    IonToast,
    IonModal,
  ],
})
export class Tab1Page {
  public readonly finance = inject(FinanceService);

  // Alternar na Home entre Últimas Transações e Seguintes (Futuras)
  readonly homeTxView = signal<'past' | 'upcoming'>('past');
  readonly pendingDeleteTx = signal<Transaction | null>(null);

  readonly toastOpen = signal<boolean>(false);
  readonly toastMsg = signal<string>('');
  readonly toastColor = signal<string>('success');

  readonly displayedHomeTransactions = computed(() => {
    if (this.homeTxView() === 'upcoming') {
      return this.finance.upcomingTransactions().slice(0, 5);
    }
    return this.finance.recentFiveTransactions();
  });

  readonly pieCircumference = 2 * Math.PI * 68; // r = 68

  readonly pieSlices = computed<PieSlice[]>(() => {
    const items = this.finance.expensesByCategory();
    const total = items.reduce((acc, s) => acc + s.total, 0);
    if (total <= 0) return [];

    let accumulatedPercent = 0;
    return items.map((item) => {
      const exactRatio = item.total / total;
      const arcLength = exactRatio * this.pieCircumference;
      const gap = this.pieCircumference - arcLength;
      const offset = -accumulatedPercent * this.pieCircumference;
      accumulatedPercent += exactRatio;

      return {
        categoryName: item.category.name,
        color: item.category.color,
        icon: item.category.icon,
        total: item.total,
        percentage: item.percentage,
        dashArray: `${arcLength} ${gap}`,
        dashOffset: offset,
      };
    });
  });

  readonly lineChartGeometry = computed(() => {
    const points = this.finance.monthlyEvolution();
    const width = 360;
    const height = 160;
    const padX = 28;
    const padY = 22;
    const usableW = width - padX * 2;
    const usableH = height - padY * 2;

    const maxVal = Math.max(
      ...points.map((p) => Math.max(p.income, p.expense)),
      1000
    );

    const stepX = points.length > 1 ? usableW / (points.length - 1) : usableW;

    const incomeCoords = points.map((p, idx) => ({
      x: Math.round(padX + idx * stepX),
      y: Math.round(padY + usableH - (p.income / maxVal) * usableH),
      val: p.income,
      month: p.month,
    }));

    const expenseCoords = points.map((p, idx) => ({
      x: Math.round(padX + idx * stepX),
      y: Math.round(padY + usableH - (p.expense / maxVal) * usableH),
      val: p.expense,
      month: p.month,
    }));

    const incomePolyline = incomeCoords.map((c) => `${c.x},${c.y}`).join(' ');
    const expensePolyline = expenseCoords.map((c) => `${c.x},${c.y}`).join(' ');

    const firstX = incomeCoords[0]?.x ?? padX;
    const lastX = incomeCoords[incomeCoords.length - 1]?.x ?? width - padX;
    const baselineY = height - padY;

    const incomeArea = `${firstX},${baselineY} ${incomePolyline} ${lastX},${baselineY}`;
    const expenseArea = `${firstX},${baselineY} ${expensePolyline} ${lastX},${baselineY}`;

    return {
      incomeCoords,
      expenseCoords,
      incomePolyline,
      expensePolyline,
      incomeArea,
      expenseArea,
    };
  });

  onHomeViewChange(val: string | number | undefined): void {
    if (val === 'past' || val === 'upcoming') {
      this.homeTxView.set(val);
    }
  }

  onQuickClassify(txId: string, catId: string): void {
    if (!catId) return;
    this.finance.updateTransactionCategory(txId, catId);
    const cat = this.finance.getCategoryById(catId);
    this.toastColor.set('success');
    this.toastMsg.set(`Classificado como "${cat.name}"!`);
    this.toastOpen.set(true);
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
    this.toastColor.set('danger');
    this.toastMsg.set(`Transação "${tx.title}" excluída.`);
    this.toastOpen.set(true);
  }
}

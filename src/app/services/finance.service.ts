import { Injectable, computed, signal } from '@angular/core';
import {
  BankAccount,
  Category,
  CategorySummary,
  MonthlyPoint,
  Transaction,
  TransactionTiming,
  TransactionType,
  UserProfile,
} from '../models/finance.models';

const STORAGE_KEYS = {
  CATEGORIES: 'bgd_cash_categories_v1',
  TRANSACTIONS: 'bgd_cash_transactions_v1',
  BANKS: 'bgd_cash_banks_v1',
  PROFILE: 'bgd_cash_profile_v1',
};

const DEFAULT_CATEGORIES: Category[] = [
  {
    id: 'cat-food',
    name: 'Comida',
    icon: 'fast-food-outline',
    color: '#ef4444',
    type: 'expense',
    isDefault: true,
    keywords: ['ifood', 'rappi', 'restaurante', 'lanche', 'pizza', 'burger', 'mercado', 'supermercado', 'padaria', 'cafe'],
  },
  {
    id: 'cat-transport',
    name: 'Transporte',
    icon: 'car-sport-outline',
    color: '#f59e0b',
    type: 'expense',
    isDefault: true,
    keywords: ['uber', '99', 'posto', 'gasolina', 'combustivel', 'estacionamento', 'pedagio', 'metro'],
  },
  {
    id: 'cat-housing',
    name: 'Moradia',
    icon: 'home-outline',
    color: '#3b82f6',
    type: 'expense',
    isDefault: true,
    keywords: ['aluguel', 'condominio', 'luz', 'energia', 'agua', 'internet', 'vivo', 'claro', 'iptu'],
  },
  {
    id: 'cat-subs',
    name: 'Assinaturas',
    icon: 'tv-outline',
    color: '#8b5cf6',
    type: 'expense',
    isDefault: true,
    keywords: ['netflix', 'spotify', 'prime', 'disney', 'youtube', 'icloud', 'chatgpt', 'HBO'],
  },
  {
    id: 'cat-health',
    name: 'Saúde',
    icon: 'medkit-outline',
    color: '#10b981',
    type: 'expense',
    isDefault: true,
    keywords: ['farmacia', 'drogasil', 'drogaria', 'academia', 'smartfit', 'medico', 'consulta', 'exame'],
  },
  {
    id: 'cat-leisure',
    name: 'Lazer',
    icon: 'game-controller-outline',
    color: '#ec4899',
    type: 'expense',
    isDefault: true,
    keywords: ['cinema', 'ingresso', 'show', 'bar', 'viagem', 'hotel', 'steam', 'playstation'],
  },
  {
    id: 'cat-salary',
    name: 'Salário',
    icon: 'cash-outline',
    color: '#059669',
    type: 'income',
    isDefault: true,
    keywords: ['salario', 'pagamento', 'folha', 'adiantamento', '13o'],
  },
  {
    id: 'cat-freelance',
    name: 'Renda Extra',
    icon: 'trending-up-outline',
    color: '#0ea5e9',
    type: 'income',
    isDefault: true,
    keywords: ['freelance', 'pix recebido', 'projeto', 'consultoria', 'venda', 'dividendo'],
  },
];

const DEFAULT_BANKS: BankAccount[] = [
  {
    id: 'bank-nubank',
    name: 'Nubank',
    shortName: 'NU',
    color: '#820ad1',
    textColor: '#ffffff',
    icon: 'card-outline',
    connected: true,
    lastSync: 'Hoje, 14:30',
    accountNumber: 'Ag 0001 • CC 84920-1',
    balance: 3420.5,
  },
  {
    id: 'bank-itau',
    name: 'Itaú Unibanco',
    shortName: 'IT',
    color: '#ec7000',
    textColor: '#ffffff',
    icon: 'business-outline',
    connected: true,
    lastSync: 'Hoje, 14:28',
    accountNumber: 'Ag 4312 • CC 10943-8',
    balance: 2150.0,
  },
  {
    id: 'bank-inter',
    name: 'Banco Inter',
    shortName: 'IN',
    color: '#ff7a00',
    textColor: '#ffffff',
    icon: 'wallet-outline',
    connected: false,
    accountNumber: 'Open Finance disponível',
    balance: 0,
  },
  {
    id: 'bank-bradesco',
    name: 'Bradesco',
    shortName: 'BR',
    color: '#cc092f',
    textColor: '#ffffff',
    icon: 'shield-checkmark-outline',
    connected: false,
    accountNumber: 'Open Finance disponível',
    balance: 0,
  },
];

const DEFAULT_TRANSACTIONS: Transaction[] = [
  {
    id: 'tx-1',
    title: 'iFood • Burger King & Sushi',
    merchant: 'IFOOD *RESTAURANTES',
    amount: 74.9,
    type: 'expense',
    timing: 'past',
    date: '2026-10-20',
    categoryId: 'cat-food',
    suggestedCategoryId: 'cat-food',
    needsReview: true,
    source: 'bank',
    bankId: 'bank-nubank',
    notes: 'Importado via Open Finance • Classificado automaticamente como Comida',
  },
  {
    id: 'tx-2',
    title: 'Uber • Viagem Centro',
    merchant: 'UBER *TRIP SAO PAULO',
    amount: 36.5,
    type: 'expense',
    timing: 'past',
    date: '2026-10-19',
    categoryId: 'cat-transport',
    suggestedCategoryId: 'cat-transport',
    needsReview: true,
    source: 'bank',
    bankId: 'bank-nubank',
    notes: 'Importado via Open Finance • Confirme a categoria do gasto',
  },
  {
    id: 'tx-3',
    title: 'iFood Mercado • Compras da Semana',
    merchant: 'IFOOD *MERCADO',
    amount: 385.4,
    type: 'expense',
    timing: 'past',
    date: '2026-10-18',
    categoryId: 'cat-food',
    needsReview: false,
    source: 'bank',
    bankId: 'bank-nubank',
    notes: 'Compra no iFood classificada em Comida',
  },
  {
    id: 'tx-4',
    title: 'Aluguel + Condomínio Outubro',
    merchant: 'IMOBILIARIA CENTRAL PIX',
    amount: 1650.0,
    type: 'expense',
    timing: 'past',
    date: '2026-10-15',
    categoryId: 'cat-housing',
    needsReview: false,
    source: 'bank',
    bankId: 'bank-itau',
  },
  {
    id: 'tx-5',
    title: 'Salário Mensal (Empresa Tech)',
    merchant: 'TED SALARIO EMPRESA LTDA',
    amount: 5800.0,
    type: 'income',
    timing: 'past',
    date: '2026-10-05',
    categoryId: 'cat-salary',
    needsReview: false,
    source: 'bank',
    bankId: 'bank-itau',
  },
  {
    id: 'tx-6',
    title: 'Cinema IMAX & Pipoca',
    merchant: 'CINEMARK BRASIL',
    amount: 118.0,
    type: 'expense',
    timing: 'past',
    date: '2026-10-12',
    categoryId: 'cat-leisure',
    needsReview: false,
    source: 'bank',
    bankId: 'bank-nubank',
  },
  {
    id: 'tx-7',
    title: 'Drogasil Farmácia & Vitaminas',
    merchant: 'RAIA DROGASIL SA',
    amount: 94.6,
    type: 'expense',
    timing: 'past',
    date: '2026-10-10',
    categoryId: 'cat-health',
    needsReview: false,
    source: 'bank',
    bankId: 'bank-itau',
  },
  {
    id: 'tx-8',
    title: 'Projeto Freelance UI/UX',
    merchant: 'Recebimento Manual PIX',
    amount: 1350.0,
    type: 'income',
    timing: 'past',
    date: '2026-10-14',
    categoryId: 'cat-freelance',
    needsReview: false,
    source: 'manual',
  },
  // Seguintes / Próximas transações (agendadas no banco ou recorrentes)
  {
    id: 'tx-9',
    title: 'iFood • Pedido Agendado Almoço',
    merchant: 'IFOOD *AGENDADO',
    amount: 58.9,
    type: 'expense',
    timing: 'upcoming',
    date: '2026-10-22',
    categoryId: 'cat-food',
    suggestedCategoryId: 'cat-food',
    needsReview: true,
    source: 'bank',
    bankId: 'bank-nubank',
    notes: 'Lançamento seguinte previsto no cartão • Decida a categoria',
  },
  {
    id: 'tx-10',
    title: 'Netflix Ultra HD 4K',
    merchant: 'NETFLIX.COM ASSINATURA',
    amount: 59.9,
    type: 'expense',
    timing: 'upcoming',
    date: '2026-10-25',
    categoryId: 'cat-subs',
    suggestedCategoryId: 'cat-subs',
    needsReview: true,
    source: 'bank',
    bankId: 'bank-nubank',
  },
  {
    id: 'tx-11',
    title: 'Internet Vivo Fibra 600MB',
    merchant: 'TELEFONICA BRASIL SA',
    amount: 149.9,
    type: 'expense',
    timing: 'upcoming',
    date: '2026-10-28',
    categoryId: 'cat-housing',
    needsReview: false,
    source: 'bank',
    bankId: 'bank-itau',
  },
  {
    id: 'tx-12',
    title: 'Academia SmartFit Plano Black',
    merchant: 'SMARTFIT ESCOLA GINASTICA',
    amount: 139.9,
    type: 'expense',
    timing: 'upcoming',
    date: '2026-10-30',
    categoryId: 'cat-health',
    needsReview: false,
    source: 'bank',
    bankId: 'bank-nubank',
  },
  {
    id: 'tx-13',
    title: '2ª Parcela Consultoria Dev',
    merchant: 'PIX Agendado Cliente',
    amount: 1200.0,
    type: 'income',
    timing: 'upcoming',
    date: '2026-10-29',
    categoryId: 'cat-freelance',
    needsReview: false,
    source: 'manual',
  },
];

const DEFAULT_PROFILE: UserProfile = {
  name: 'Luiz Maia',
  email: 'maia@bgdcash.com.br',
  avatarInitials: 'GO',
  monthlyGoal: 3500,
  darkMode: false,
  autoSuggestCategory: true,
  notificationsEnabled: true,
  isAuthenticated: true,
};

@Injectable({
  providedIn: 'root',
})
export class FinanceService {
  readonly categories = signal<Category[]>(this.loadFromStorage(STORAGE_KEYS.CATEGORIES, DEFAULT_CATEGORIES));
  readonly banks = signal<BankAccount[]>(this.loadFromStorage(STORAGE_KEYS.BANKS, DEFAULT_BANKS));
  readonly transactions = signal<Transaction[]>(this.loadFromStorage(STORAGE_KEYS.TRANSACTIONS, DEFAULT_TRANSACTIONS));
  readonly profile = signal<UserProfile>(this.loadFromStorage(STORAGE_KEYS.PROFILE, DEFAULT_PROFILE));

  readonly connectedBanks = computed(() => this.banks().filter((b) => b.connected));

  readonly pastTransactions = computed(() =>
    [...this.transactions()]
      .filter((t) => t.timing === 'past')
      .sort((a, b) => b.date.localeCompare(a.date))
  );

  readonly upcomingTransactions = computed(() =>
    [...this.transactions()]
      .filter((t) => t.timing === 'upcoming')
      .sort((a, b) => a.date.localeCompare(b.date))
  );

  readonly recentFiveTransactions = computed(() => this.pastTransactions().slice(0, 5));

  readonly pendingReviewCount = computed(
    () => this.transactions().filter((t) => t.needsReview).length
  );

  readonly totalIncome = computed(() =>
    this.pastTransactions()
      .filter((t) => t.type === 'income')
      .reduce((acc, item) => acc + item.amount, 0)
  );

  readonly totalExpense = computed(() =>
    this.pastTransactions()
      .filter((t) => t.type === 'expense')
      .reduce((acc, item) => acc + item.amount, 0)
  );

  readonly currentBalance = computed(() => this.totalIncome() - this.totalExpense());

  readonly upcomingExpenseTotal = computed(() =>
    this.upcomingTransactions()
      .filter((t) => t.type === 'expense')
      .reduce((acc, item) => acc + item.amount, 0)
  );

  readonly upcomingIncomeTotal = computed(() =>
    this.upcomingTransactions()
      .filter((t) => t.type === 'income')
      .reduce((acc, item) => acc + item.amount, 0)
  );

  readonly expensesByCategory = computed<CategorySummary[]>(() => {
    const expenses = this.pastTransactions().filter((t) => t.type === 'expense');
    const totalExp = expenses.reduce((sum, t) => sum + t.amount, 0);
    const map = new Map<string, { total: number; count: number }>();

    for (const tx of expenses) {
      const prev = map.get(tx.categoryId) ?? { total: 0, count: 0 };
      map.set(tx.categoryId, { total: prev.total + tx.amount, count: prev.count + 1 });
    }

    const summaries: CategorySummary[] = [];
    for (const [catId, data] of map.entries()) {
      const category = this.getCategoryById(catId);
      summaries.push({
        category,
        total: data.total,
        count: data.count,
        percentage: totalExp > 0 ? Math.round((data.total / totalExp) * 100) : 0,
      });
    }

    return summaries.sort((a, b) => b.total - a.total);
  });

  readonly monthlyEvolution = computed<MonthlyPoint[]>(() => {
    const currentInc = this.totalIncome();
    const currentExp = this.totalExpense();
    return [
      { month: 'Mai', income: 6100, expense: 3120 },
      { month: 'Jun', income: 6450, expense: 2890 },
      { month: 'Jul', income: 5900, expense: 3410 },
      { month: 'Ago', income: 6800, expense: 2950 },
      { month: 'Set', income: 6600, expense: 2780 },
      { month: 'Out', income: currentInc || 7150, expense: currentExp || 2359 },
    ];
  });

  constructor() {
    this.applyDarkMode(this.profile().darkMode);
    this.updateAppBadge();
  }

  toggleTheme(): void {
    const nextDark = !this.profile().darkMode;
    this.updateProfile({ darkMode: nextDark });
  }

  updateAppBadge(): void {
    if (typeof navigator !== 'undefined' && 'setAppBadge' in navigator) {
      const count = this.pendingReviewCount();
      if (count > 0) {
        (navigator as any).setAppBadge(count).catch(() => {});
      } else if ('clearAppBadge' in navigator) {
        (navigator as any).clearAppBadge().catch(() => {});
      }
    }
  }

  async requestNotificationPermission(): Promise<boolean> {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    }
    return false;
  }

  sendNotification(title: string, body: string): void {
    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
      try {
        new Notification(title, {
          body,
          icon: 'assets/icons/icon-192x192.png',
          badge: 'assets/icons/icon-72x72.png',
        });
      } catch {
        // Fallback for browsers requiring service worker notifications
        if ('serviceWorker' in navigator) {
          navigator.serviceWorker.ready.then((reg) => {
            reg.showNotification(title, {
              body,
              icon: 'assets/icons/icon-192x192.png',
              badge: 'assets/icons/icon-72x72.png',
            });
          }).catch(() => {});
        }
      }
    }
  }

  getCategoryById(id: string): Category {
    return (
      this.categories().find((c) => c.id === id) ?? {
        id: 'cat-other',
        name: 'Outros',
        icon: 'pricetag-outline',
        color: '#64748b',
        type: 'both',
      }
    );
  }

  getBankById(id?: string): BankAccount | undefined {
    if (!id) return undefined;
    return this.banks().find((b) => b.id === id);
  }

  inferCategoryForTitle(title: string, type: TransactionType): string {
    const normalized = title.toLowerCase();
    for (const cat of this.categories()) {
      if (cat.type !== 'both' && cat.type !== type) continue;
      if (cat.keywords?.some((kw) => normalized.includes(kw.toLowerCase()))) {
        return cat.id;
      }
    }
    const fallback = this.categories().find((c) => c.type === type || c.type === 'both');
    return fallback ? fallback.id : 'cat-food';
  }

  updateTransactionCategory(transactionId: string, categoryId: string): void {
    const updated = this.transactions().map((tx) =>
      tx.id === transactionId
        ? { ...tx, categoryId, needsReview: false }
        : tx
    );
    this.transactions.set(updated);
    this.saveToStorage(STORAGE_KEYS.TRANSACTIONS, updated);
    this.updateAppBadge();
  }

  confirmTransactionCategory(transactionId: string): void {
    const updated = this.transactions().map((tx) =>
      tx.id === transactionId ? { ...tx, needsReview: false } : tx
    );
    this.transactions.set(updated);
    this.saveToStorage(STORAGE_KEYS.TRANSACTIONS, updated);
    this.updateAppBadge();
  }

  realizeUpcomingTransaction(transactionId: string): void {
    const today = new Date().toISOString().split('T')[0];
    const updated = this.transactions().map((tx) =>
      tx.id === transactionId
        ? { ...tx, timing: 'past' as TransactionTiming, date: today, needsReview: false }
        : tx
    );
    this.transactions.set(updated);
    this.saveToStorage(STORAGE_KEYS.TRANSACTIONS, updated);
  }

  addTransaction(payload: {
    title: string;
    amount: number;
    type: TransactionType;
    timing: TransactionTiming;
    date: string;
    categoryId: string;
    source?: 'bank' | 'manual';
    bankId?: string;
    notes?: string;
  }): Transaction {
    const newTx: Transaction = {
      id: 'tx-' + Date.now(),
      title: payload.title.trim(),
      merchant: payload.source === 'bank' ? payload.title.toUpperCase() : 'Lançamento Manual',
      amount: Number(payload.amount),
      type: payload.type,
      timing: payload.timing,
      date: payload.date,
      categoryId: payload.categoryId,
      needsReview: false,
      source: payload.source ?? 'manual',
      bankId: payload.bankId,
      notes: payload.notes,
    };

    const updated = [newTx, ...this.transactions()];
    this.transactions.set(updated);
    this.saveToStorage(STORAGE_KEYS.TRANSACTIONS, updated);
    return newTx;
  }

  deleteTransaction(transactionId: string): void {
    const updated = this.transactions().filter((tx) => tx.id !== transactionId);
    this.transactions.set(updated);
    this.saveToStorage(STORAGE_KEYS.TRANSACTIONS, updated);
    this.updateAppBadge();
  }

  addCategory(payload: {
    name: string;
    icon: string;
    color: string;
    type: TransactionType | 'both';
  }): Category {
    const newCat: Category = {
      id: 'cat-' + Date.now(),
      name: payload.name.trim(),
      icon: payload.icon || 'pricetag-outline',
      color: payload.color || '#10b981',
      type: payload.type,
      isDefault: false,
      keywords: [payload.name.trim().toLowerCase()],
    };
    const updated = [...this.categories(), newCat];
    this.categories.set(updated);
    this.saveToStorage(STORAGE_KEYS.CATEGORIES, updated);
    return newCat;
  }

  removeCategory(categoryId: string): boolean {
    const list = this.categories();
    if (list.length <= 1) return false;
    const fallback = list.find((c) => c.id !== categoryId) ?? list[0];

    const updatedCats = list.filter((c) => c.id !== categoryId);
    this.categories.set(updatedCats);
    this.saveToStorage(STORAGE_KEYS.CATEGORIES, updatedCats);

    // Reassign transactions using removed category to fallback
    const updatedTx = this.transactions().map((tx) =>
      tx.categoryId === categoryId ? { ...tx, categoryId: fallback.id } : tx
    );
    this.transactions.set(updatedTx);
    this.saveToStorage(STORAGE_KEYS.TRANSACTIONS, updatedTx);
    return true;
  }

  toggleBankConnection(bankId: string): void {
    const nowStr = 'Agora mesmo';
    const updated = this.banks().map((bank) => {
      if (bank.id !== bankId) return bank;
      const nextConnected = !bank.connected;
      return {
        ...bank,
        connected: nextConnected,
        lastSync: nextConnected ? nowStr : undefined,
        accountNumber: nextConnected
          ? bank.accountNumber.includes('Ag')
            ? bank.accountNumber
            : 'Ag 0001 • CC ' + Math.floor(10000 + Math.random() * 89999) + '-5'
          : 'Open Finance disponível',
        balance: nextConnected ? (bank.balance > 0 ? bank.balance : 1280.75) : 0,
      };
    });
    this.banks.set(updated);
    this.saveToStorage(STORAGE_KEYS.BANKS, updated);
  }

  syncConnectedBanks(): number {
    const connected = this.connectedBanks();
    if (connected.length === 0) return 0;

    const primaryBank = connected[0];
    const samples = [
      {
        title: 'iFood • Pizzaria Napolitana',
        merchant: 'IFOOD *PIZZARIA',
        amount: 82.5,
        type: 'expense' as TransactionType,
        timing: 'past' as TransactionTiming,
      },
      {
        title: 'Uber • Corrida Aeroporto',
        merchant: 'UBER *TRIP',
        amount: 49.9,
        type: 'expense' as TransactionType,
        timing: 'past' as TransactionTiming,
      },
      {
        title: 'iFood • Marmita Fit Agendada',
        merchant: 'IFOOD *AGENDAMENTO',
        amount: 44.0,
        type: 'expense' as TransactionType,
        timing: 'upcoming' as TransactionTiming,
      },
      {
        title: 'Spotify Premium Duo',
        merchant: 'SPOTIFY BRASIL',
        amount: 27.9,
        type: 'expense' as TransactionType,
        timing: 'upcoming' as TransactionTiming,
      },
    ];

    const pick = samples[Math.floor(Math.random() * samples.length)];
    const inferredCat = this.inferCategoryForTitle(pick.title, pick.type);
    const today = new Date().toISOString().split('T')[0];

    const importedTx: Transaction = {
      id: 'tx-sync-' + Date.now(),
      title: pick.title,
      merchant: pick.merchant,
      amount: pick.amount,
      type: pick.type,
      timing: pick.timing,
      date: today,
      categoryId: inferredCat,
      suggestedCategoryId: inferredCat,
      needsReview: true,
      source: 'bank',
      bankId: primaryBank.id,
      notes: 'Sincronizado via Open Finance • Confirme ou altere a categoria',
    };

    const updatedTx = [importedTx, ...this.transactions()];
    this.transactions.set(updatedTx);
    this.saveToStorage(STORAGE_KEYS.TRANSACTIONS, updatedTx);

    const updatedBanks = this.banks().map((b) =>
      b.connected ? { ...b, lastSync: 'Sincronizado agora' } : b
    );
    this.banks.set(updatedBanks);
    this.saveToStorage(STORAGE_KEYS.BANKS, updatedBanks);

    this.updateAppBadge();
    this.sendNotification(
      'Nova transação Open Finance!',
      `${pick.title} (${pick.amount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}) importada para classificação.`
    );

    return 1;
  }

  updateProfile(partial: Partial<UserProfile>): void {
    const current = this.profile();
    const nextName = partial.name ?? current.name;
    const initials = nextName
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0].toUpperCase())
      .join('') || 'BG';

    const updated: UserProfile = {
      ...current,
      ...partial,
      avatarInitials: initials,
    };

    if (partial.darkMode !== undefined) {
      this.applyDarkMode(partial.darkMode);
    }

    this.profile.set(updated);
    this.saveToStorage(STORAGE_KEYS.PROFILE, updated);
  }

  login(email: string, name?: string): void {
    const current = this.profile();
    const displayName = name?.trim() || current.name || 'Luiz Maia';
    this.updateProfile({
      email: email.trim() || current.email,
      name: displayName,
      isAuthenticated: true,
    });
  }

  logout(): void {
    this.updateProfile({ isAuthenticated: false });
  }

  resetDemoData(): void {
    const isDark = this.profile().darkMode;
    this.categories.set(DEFAULT_CATEGORIES);
    this.banks.set(DEFAULT_BANKS);
    this.transactions.set(DEFAULT_TRANSACTIONS);
    const nextProfile = { ...DEFAULT_PROFILE, darkMode: isDark, isAuthenticated: true };
    this.profile.set(nextProfile);

    this.saveToStorage(STORAGE_KEYS.CATEGORIES, DEFAULT_CATEGORIES);
    this.saveToStorage(STORAGE_KEYS.BANKS, DEFAULT_BANKS);
    this.saveToStorage(STORAGE_KEYS.TRANSACTIONS, DEFAULT_TRANSACTIONS);
    this.saveToStorage(STORAGE_KEYS.PROFILE, nextProfile);
  }

  private applyDarkMode(isDark: boolean): void {
    if (typeof document !== 'undefined') {
      document.documentElement.classList.toggle('ion-palette-dark', isDark);
      const themeColorMeta = document.querySelector('meta[name="theme-color"]');
      if (themeColorMeta) {
        themeColorMeta.setAttribute('content', isDark ? '#0b1120' : '#059669');
      }
    }
  }

  private loadFromStorage<T>(key: string, fallback: T): T {
    try {
      const raw = localStorage.getItem(key);
      if (!raw) return fallback;
      return JSON.parse(raw) as T;
    } catch {
      return fallback;
    }
  }

  private saveToStorage<T>(key: string, value: T): void {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // Ignore storage quota errors
    }
  }
}

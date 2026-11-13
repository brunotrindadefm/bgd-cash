export type TransactionType = 'expense' | 'income';
export type TransactionTiming = 'past' | 'upcoming';

export interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
  type: TransactionType | 'both';
  isDefault?: boolean;
  keywords?: string[];
}

export interface BankAccount {
  id: string;
  name: string;
  shortName: string;
  color: string;
  textColor: string;
  icon: string;
  connected: boolean;
  lastSync?: string;
  accountNumber: string;
  balance: number;
}

export interface Transaction {
  id: string;
  title: string;
  merchant?: string;
  amount: number;
  type: TransactionType;
  timing: TransactionTiming;
  date: string; // YYYY-MM-DD
  categoryId: string;
  suggestedCategoryId?: string;
  needsReview?: boolean; // True when imported from bank and waiting user confirmation/decision
  source: 'bank' | 'manual';
  bankId?: string;
  notes?: string;
}

export interface UserProfile {
  name: string;
  email: string;
  avatarInitials: string;
  monthlyGoal: number;
  darkMode: boolean;
  autoSuggestCategory: boolean;
  notificationsEnabled: boolean;
  isAuthenticated: boolean;
}

export interface CategorySummary {
  category: Category;
  total: number;
  percentage: number;
  count: number;
}

export interface MonthlyPoint {
  month: string;
  income: number;
  expense: number;
}

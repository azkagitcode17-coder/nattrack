export type TransactionType = 'income' | 'expense';

export type PaymentMethod = 'Transfer Bank' | 'Tunai' | 'E-Wallet' | 'Kartu Kredit';

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  category: string;
  date: string; // YYYY-MM-DD
  note: string;
  paymentMethod: PaymentMethod;
  createdAt: number;
}

export interface Budget {
  category: string;
  monthlyLimit: number;
}

export interface SavingsGoal {
  id: string;
  title: string;
  targetAmount: number;
  currentAmount: number;
  targetDate: string;
  notes?: string;
}

export type PeriodFilter = 'month' | 'last_month' | 'year' | 'all';

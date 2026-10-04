import { Transaction, Budget, SavingsGoal } from '../types';

export const EXPENSE_CATEGORIES = [
  'Makanan & Minuman',
  'Transportasi',
  'Belanja & Kebutuhan',
  'Tagihan & Utilitas',
  'Tempat Tinggal',
  'Hiburan & Rekreasi',
  'Kesehatan',
  'Pendidikan',
  'Investasi',
  'Lain-lain',
] as const;

export const INCOME_CATEGORIES = [
  'Gaji Pokok',
  'Bonus & THR',
  'Freelance & Proyek',
  'Hasil Investasi / Dividen',
  'Bisnis & Penjualan',
  'Hadiah & Hibah',
  'Lain-lain',
] as const;

export const PAYMENT_METHODS = [
  'Transfer Bank',
  'Tunai',
  'E-Wallet',
  'Kartu Kredit',
] as const;

// Clean starter state with 0 dummy records as requested
export const INITIAL_TRANSACTIONS: Transaction[] = [];

export const INITIAL_BUDGETS: Budget[] = [];

export const INITIAL_GOALS: SavingsGoal[] = [];

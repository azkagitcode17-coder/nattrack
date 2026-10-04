import React from 'react';
import { Transaction } from '../types';
import { formatRupiah } from '../utils/formatters';
import { CreditCard, Calendar, PieChart, ShieldCheck } from 'lucide-react';

interface FinancialSummaryProps {
  transactions: Transaction[];
}

export const FinancialSummary: React.FC<FinancialSummaryProps> = ({ transactions }) => {
  const expenses = transactions.filter((t) => t.type === 'expense');
  const incomes = transactions.filter((t) => t.type === 'income');

  const totalExpense = expenses.reduce((sum, t) => sum + t.amount, 0);
  const totalIncome = incomes.reduce((sum, t) => sum + t.amount, 0);

  // Group days count
  const uniqueExpenseDays = new Set(expenses.map((t) => t.date)).size || 1;
  const avgDailyExpense = Math.round(totalExpense / uniqueExpenseDays);

  // Top category
  const catMap = new Map<string, number>();
  expenses.forEach((t) => {
    catMap.set(t.category, (catMap.get(t.category) || 0) + t.amount);
  });
  let topCategory = '-';
  let topCategoryAmount = 0;
  catMap.forEach((amt, cat) => {
    if (amt > topCategoryAmount) {
      topCategoryAmount = amt;
      topCategory = cat;
    }
  });

  // Top payment method
  const methodMap = new Map<string, number>();
  transactions.forEach((t) => {
    methodMap.set(t.paymentMethod, (methodMap.get(t.paymentMethod) || 0) + 1);
  });
  let mostUsedMethod = '-';
  let maxMethodCount = 0;
  methodMap.forEach((cnt, m) => {
    if (cnt > maxMethodCount) {
      maxMethodCount = cnt;
      mostUsedMethod = m;
    }
  });

  // Highest single expense
  const highestExpense = expenses.reduce(
    (max, t) => (t.amount > max.amount ? t : max),
    { amount: 0, note: '-' } as { amount: number; note: string }
  );

  return (
    <div className="rounded-xl bg-white p-5 sm:p-6 shadow-xs border border-neutral-200/80">
      <div className="flex items-center justify-between pb-3.5 border-b border-neutral-100">
        <div>
          <h3 className="text-base font-semibold text-neutral-900">
            Analisis & Wawasan Finansial
          </h3>
          <p className="text-xs text-neutral-500 mt-0.5">
            Ringkasan data kebiasaan transaksi untuk efisiensi pengeluaran
          </p>
        </div>
        <div className="w-8 h-8 rounded-lg bg-[#FDF2F4] text-[#701428] flex items-center justify-center">
          <ShieldCheck className="w-4 h-4" />
        </div>
      </div>

      <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 1. Rata-rata Pengeluaran Harian */}
        <div className="p-3.5 rounded-lg bg-neutral-50/80 border border-neutral-100">
          <div className="flex items-center gap-2 text-xs text-neutral-500 font-medium mb-1.5">
            <Calendar className="w-3.5 h-3.5 text-[#701428]" />
            <span>Rata-rata Harian</span>
          </div>
          <div className="text-lg font-bold font-mono-numbers text-neutral-900">
            {formatRupiah(avgDailyExpense)}
          </div>
          <div className="text-[11px] text-neutral-400 mt-1">
            Dari {uniqueExpenseDays} hari aktif belanja
          </div>
        </div>

        {/* 2. Kategori Pengeluaran Terbesar */}
        <div className="p-3.5 rounded-lg bg-neutral-50/80 border border-neutral-100">
          <div className="flex items-center gap-2 text-xs text-neutral-500 font-medium mb-1.5">
            <PieChart className="w-3.5 h-3.5 text-[#701428]" />
            <span>Kategori Terbesar</span>
          </div>
          <div className="text-sm font-bold text-neutral-900 truncate">
            {topCategory}
          </div>
          <div className="text-[11px] text-neutral-400 mt-1 font-mono-numbers">
            {formatRupiah(topCategoryAmount)} ({totalExpense > 0 ? ((topCategoryAmount / totalExpense) * 100).toFixed(0) : 0}%)
          </div>
        </div>

        {/* 3. Pengeluaran Tertinggi */}
        <div className="p-3.5 rounded-lg bg-neutral-50/80 border border-neutral-100">
          <div className="flex items-center gap-2 text-xs text-neutral-500 font-medium mb-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-[#701428]" />
            <span>Transaksi Terbesar</span>
          </div>
          <div className="text-lg font-bold font-mono-numbers text-neutral-900">
            {formatRupiah(highestExpense.amount)}
          </div>
          <div className="text-[11px] text-neutral-400 mt-1 truncate">
            {highestExpense.note}
          </div>
        </div>

        {/* 4. Metode Bayar Terfavorit */}
        <div className="p-3.5 rounded-lg bg-neutral-50/80 border border-neutral-100">
          <div className="flex items-center gap-2 text-xs text-neutral-500 font-medium mb-1.5">
            <CreditCard className="w-3.5 h-3.5 text-[#701428]" />
            <span>Metode Dominan</span>
          </div>
          <div className="text-sm font-bold text-neutral-900">
            {mostUsedMethod}
          </div>
          <div className="text-[11px] text-neutral-400 mt-1 font-mono-numbers">
            {maxMethodCount} kali digunakan
          </div>
        </div>
      </div>
    </div>
  );
};

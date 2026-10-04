/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useMemo } from 'react';
import { Header } from './components/Header';
import { BottomNavBar } from './components/BottomNavBar';
import { MetricCards } from './components/MetricCards';
import { QuickAddBar } from './components/QuickAddBar';
import { CashflowChart } from './components/CashflowChart';
import { CategoryBreakdown } from './components/CategoryBreakdown';
import { TransactionList } from './components/TransactionList';
import { TransactionBottomSheet } from './components/TransactionBottomSheet';
import { Transaction, PeriodFilter } from './types';
import { INITIAL_TRANSACTIONS } from './data/defaultData';
import { ChevronRight, Sparkles } from 'lucide-react';

export default function App() {
  // Ultra-simplified 2-view navigation: 'summary' (Statistik & Metrik) | 'history' (Riwayat Transaksi)
  const [activeTab, setActiveTab] = useState<'summary' | 'history'>('summary');

  // Time Period state
  const [period, setPeriod] = useState<PeriodFilter>('month');

  // Selected Category filter
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string | null>(null);

  // Bottom Sheet for adding / editing transactions
  const [isTxSheetOpen, setIsTxSheetOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);

  // Storage initialization
  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    try {
      const isClean = localStorage.getItem('nattrack_clean_v3');
      if (!isClean) {
        localStorage.removeItem('maroon_finance_txs');
        localStorage.removeItem('maroon_finance_budgets');
        localStorage.removeItem('maroon_finance_goals');
        localStorage.removeItem('nattrack_budgets');
        localStorage.removeItem('nattrack_goals');
        localStorage.setItem('nattrack_clean_v3', 'true');
        return INITIAL_TRANSACTIONS;
      }
      const saved = localStorage.getItem('nattrack_txs');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return INITIAL_TRANSACTIONS;
  });

  // Local storage synchronization
  useEffect(() => {
    try {
      localStorage.setItem('nattrack_txs', JSON.stringify(transactions));
    } catch (e) {
      console.error(e);
    }
  }, [transactions]);

  // Period filtering
  const periodFilteredTransactions = useMemo(() => {
    const now = new Date();
    const curYear = now.getFullYear();
    const curMonth = now.getMonth();

    return transactions.filter((t) => {
      const [yearStr, monthStr] = t.date.split('-');
      const tYear = parseInt(yearStr, 10);
      const tMonth = parseInt(monthStr, 10) - 1;

      if (period === 'month') {
        return tYear === curYear && tMonth === curMonth;
      }
      if (period === 'last_month') {
        const lastMonth = curMonth === 0 ? 11 : curMonth - 1;
        const lastMonthYear = curMonth === 0 ? curYear - 1 : curYear;
        return tYear === lastMonthYear && tMonth === lastMonth;
      }
      if (period === 'year') {
        return tYear === curYear;
      }
      return true;
    });
  }, [transactions, period]);

  // Totals
  const totalIncome = useMemo(() => {
    return periodFilteredTransactions
      .filter((t) => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
  }, [periodFilteredTransactions]);

  const totalExpense = useMemo(() => {
    return periodFilteredTransactions
      .filter((t) => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
  }, [periodFilteredTransactions]);

  const totalBalance = useMemo(() => {
    return transactions.reduce((acc, t) => {
      return t.type === 'income' ? acc + t.amount : acc - t.amount;
    }, 0);
  }, [transactions]);

  const periodLabel = useMemo(() => {
    if (period === 'month') return 'Bulan Ini';
    if (period === 'last_month') return 'Bulan Lalu';
    if (period === 'year') return 'Tahun Ini';
    return 'Semua Waktu';
  }, [period]);

  // Transaction Handlers
  const handleSaveTransaction = (
    data: Omit<Transaction, 'id' | 'createdAt'>,
    existingId?: string
  ) => {
    if (existingId) {
      setTransactions((prev) =>
        prev.map((t) => (t.id === existingId ? { ...t, ...data } : t))
      );
    } else {
      const newTx: Transaction = {
        ...data,
        id: `tx-${Date.now()}`,
        createdAt: Date.now(),
      };
      setTransactions((prev) => [newTx, ...prev]);
    }
  };

  const handleDeleteTransaction = (id: string) => {
    setTransactions((prev) => prev.filter((t) => t.id !== id));
  };

  const handleDuplicateTransaction = (tx: Transaction) => {
    const duplicated: Transaction = {
      ...tx,
      id: `tx-${Date.now()}`,
      note: `${tx.note} (Salinan)`,
      date: new Date().toISOString().split('T')[0],
      createdAt: Date.now(),
    };
    setTransactions((prev) => [duplicated, ...prev]);
  };

  const handleEditClick = (tx: Transaction) => {
    setEditingTransaction(tx);
    setIsTxSheetOpen(true);
  };

  const handleOpenNewTransaction = () => {
    setEditingTransaction(null);
    setIsTxSheetOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#FBF9F9] text-neutral-900 flex flex-col font-sans select-none sm:select-auto">
      {/* Mobile-First Minimal Header */}
      <Header
        activeTab={activeTab}
        onTabChange={setActiveTab}
        period={period}
        onPeriodChange={setPeriod}
        onOpenNewTransaction={handleOpenNewTransaction}
      />

      {/* Main Viewport Container */}
      <main className="flex-1 max-w-md md:max-w-3xl lg:max-w-4xl w-full mx-auto px-3.5 sm:px-6 py-4 sm:py-6 pb-28 sm:pb-12 space-y-4 sm:space-y-6">
        {/* VIEW 1: Statistik & Ringkasan (Pemasukan, Pengeluaran, Diagram) */}
        {activeTab === 'summary' && (
          <div className="space-y-4 sm:space-y-6 animate-in fade-in duration-150">
            {/* 1. Pemasukan, Pengeluaran & Saldo */}
            <MetricCards
              totalIncome={totalIncome}
              totalExpense={totalExpense}
              balance={totalBalance}
              periodLabel={periodLabel}
            />

            {/* 2. Form Catat Pemasukan / Pengeluaran Cepat */}
            <div className="space-y-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-500 pl-1">
                Catat Transaksi Cepat
              </span>
              <QuickAddBar onAddTransaction={handleSaveTransaction} />
            </div>

            {/* Empty state notice if 0 records */}
            {transactions.length === 0 && (
              <div className="p-4 rounded-2xl bg-white border border-[#701428]/25 shadow-xs flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-xl bg-[#FDF2F4] text-[#701428] flex items-center justify-center shrink-0">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-xs font-bold text-neutral-900 truncate">
                      Buku Kas Siap Dipakai
                    </h3>
                    <p className="text-[11px] text-neutral-500 truncate">
                      Catat pengeluaran atau pemasukan pertama Anda di atas
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleOpenNewTransaction}
                  className="min-h-[36px] px-3 text-xs font-bold text-white bg-[#701428] hover:bg-[#891B33] active:bg-[#580F20] rounded-xl cursor-pointer shrink-0"
                >
                  + Catat
                </button>
              </div>
            )}

            {/* 3. Diagram Statistik Pengeluaran & Pemasukan */}
            <div className="space-y-4">
              <CashflowChart transactions={periodFilteredTransactions} />

              <CategoryBreakdown
                transactions={periodFilteredTransactions}
                selectedCategory={selectedCategoryFilter}
                onSelectCategory={(cat) => {
                  setSelectedCategoryFilter(cat);
                  if (cat) {
                    setActiveTab('history');
                  }
                }}
              />
            </div>

            {/* 4. Riwayat Transaksi Terkini Preview */}
            <div className="space-y-2 pt-1">
              <div className="flex items-center justify-between px-1">
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-neutral-900">
                    Riwayat Transaksi
                  </h3>
                  <p className="text-[11px] text-neutral-500">
                    Ketuk baris transaksi untuk ubah atau hapus
                  </p>
                </div>
                {periodFilteredTransactions.length > 4 && (
                  <button
                    onClick={() => setActiveTab('history')}
                    className="inline-flex items-center gap-0.5 text-xs font-bold text-[#701428] active:text-[#891B33] cursor-pointer"
                  >
                    <span>Semua ({periodFilteredTransactions.length})</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              <TransactionList
                transactions={periodFilteredTransactions.slice(0, 5)}
                onEdit={handleEditClick}
                onDelete={handleDeleteTransaction}
                onDuplicate={handleDuplicateTransaction}
                onAddNew={handleOpenNewTransaction}
                selectedCategoryFilter={selectedCategoryFilter}
                onClearCategoryFilter={() => setSelectedCategoryFilter(null)}
              />
            </div>
          </div>
        )}

        {/* VIEW 2: Riwayat Transaksi Lengkap */}
        {activeTab === 'history' && (
          <div className="space-y-4 animate-in fade-in duration-150">
            <div className="px-1 flex items-center justify-between">
              <div>
                <h2 className="text-base sm:text-lg font-bold text-neutral-900">
                  Riwayat Transaksi
                </h2>
                <p className="text-xs text-neutral-500">
                  Total {periodFilteredTransactions.length} transaksi pada {periodLabel}
                </p>
              </div>
              <button
                onClick={handleOpenNewTransaction}
                className="min-h-[38px] px-3.5 rounded-xl bg-[#701428] text-white text-xs font-bold flex items-center gap-1.5 active:bg-[#580F20] shadow-xs cursor-pointer"
              >
                <span>+ Catat</span>
              </button>
            </div>

            <TransactionList
              transactions={periodFilteredTransactions}
              onEdit={handleEditClick}
              onDelete={handleDeleteTransaction}
              onDuplicate={handleDuplicateTransaction}
              onAddNew={handleOpenNewTransaction}
              selectedCategoryFilter={selectedCategoryFilter}
              onClearCategoryFilter={() => setSelectedCategoryFilter(null)}
            />
          </div>
        )}
      </main>

      {/* Mobile Fixed Bottom Navigation (Thumb Zone: Statistik, [+] Catat, Riwayat) */}
      <BottomNavBar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onOpenQuickAdd={handleOpenNewTransaction}
      />

      {/* Slide-Up Bottom Sheet for Transaction Entry & Edit */}
      <TransactionBottomSheet
        isOpen={isTxSheetOpen}
        onClose={() => {
          setIsTxSheetOpen(false);
          setEditingTransaction(null);
        }}
        onSave={handleSaveTransaction}
        initialData={editingTransaction}
      />
    </div>
  );
}

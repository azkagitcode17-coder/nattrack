import React, { useState } from 'react';
import {
  Search,
  Filter,
  ArrowDownRight,
  ArrowUpRight,
  Plus,
  X,
  ChevronRight,
} from 'lucide-react';
import { Transaction, TransactionType } from '../types';
import { formatRupiah, formatDateIndo } from '../utils/formatters';
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES, PAYMENT_METHODS } from '../data/defaultData';
import { TransactionActionDrawer } from './TransactionActionDrawer';

interface TransactionListProps {
  transactions: Transaction[];
  onEdit: (transaction: Transaction) => void;
  onDelete: (id: string) => void;
  onDuplicate: (transaction: Transaction) => void;
  onAddNew: () => void;
  selectedCategoryFilter?: string | null;
  onClearCategoryFilter?: () => void;
}

export const TransactionList: React.FC<TransactionListProps> = ({
  transactions,
  onEdit,
  onDelete,
  onDuplicate,
  onAddNew,
  selectedCategoryFilter,
  onClearCategoryFilter,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | TransactionType>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>(
    selectedCategoryFilter || 'all'
  );
  const [methodFilter, setMethodFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'highest' | 'lowest'>('newest');
  const [selectedTxForAction, setSelectedTxForAction] = useState<Transaction | null>(null);

  React.useEffect(() => {
    if (selectedCategoryFilter) {
      setCategoryFilter(selectedCategoryFilter);
    }
  }, [selectedCategoryFilter]);

  const filteredTransactions = transactions
    .filter((t) => {
      const matchSearch =
        t.note.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.paymentMethod.toLowerCase().includes(searchQuery.toLowerCase());
      if (!matchSearch) return false;

      if (typeFilter !== 'all' && t.type !== typeFilter) return false;
      if (categoryFilter !== 'all' && t.category !== categoryFilter) return false;
      if (methodFilter !== 'all' && t.paymentMethod !== methodFilter) return false;

      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'newest') return b.date.localeCompare(a.date) || b.createdAt - a.createdAt;
      if (sortBy === 'oldest') return a.date.localeCompare(b.date) || a.createdAt - b.createdAt;
      if (sortBy === 'highest') return b.amount - a.amount;
      if (sortBy === 'lowest') return a.amount - b.amount;
      return 0;
    });

  const allCategories = Array.from(
    new Set([...EXPENSE_CATEGORIES, ...INCOME_CATEGORIES])
  );

  return (
    <div className="rounded-2xl bg-white shadow-xs border border-neutral-200/80 overflow-hidden">
      {/* Mobile-Friendly Search & Filter Bar */}
      <div className="p-3.5 sm:p-5 border-b border-neutral-100 space-y-3">
        {/* Search input with 44px min-height */}
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
          <input
            type="text"
            placeholder="Cari transaksi..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full min-h-[44px] pl-10 pr-9 py-2 text-xs bg-neutral-50 focus:bg-white border border-neutral-200 rounded-xl focus:outline-hidden focus:border-[#701428] transition-colors"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-neutral-200 text-neutral-600 flex items-center justify-center cursor-pointer"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>

        {/* Horizontal Type Filter Segmented Control */}
        <div className="grid grid-cols-3 p-1 bg-neutral-100 rounded-xl gap-1">
          <button
            onClick={() => setTypeFilter('all')}
            className={`min-h-[38px] text-xs font-semibold rounded-lg transition-colors cursor-pointer flex items-center justify-center ${
              typeFilter === 'all'
                ? 'bg-white text-neutral-900 shadow-xs'
                : 'text-neutral-600 hover:text-neutral-900'
            }`}
          >
            Semua
          </button>
          <button
            onClick={() => setTypeFilter('expense')}
            className={`min-h-[38px] text-xs font-semibold rounded-lg transition-colors cursor-pointer flex items-center justify-center ${
              typeFilter === 'expense'
                ? 'bg-white text-[#701428] shadow-xs'
                : 'text-neutral-600 hover:text-[#701428]'
            }`}
          >
            Pengeluaran
          </button>
          <button
            onClick={() => setTypeFilter('income')}
            className={`min-h-[38px] text-xs font-semibold rounded-lg transition-colors cursor-pointer flex items-center justify-center ${
              typeFilter === 'income'
                ? 'bg-white text-emerald-700 shadow-xs'
                : 'text-neutral-600 hover:text-emerald-700'
            }`}
          >
            Pemasukan
          </button>
        </div>

        {/* Secondary Category & Sort Dropdowns */}
        <div className="grid grid-cols-2 gap-2 pt-0.5">
          <select
            value={categoryFilter}
            onChange={(e) => {
              setCategoryFilter(e.target.value);
              if (e.target.value === 'all') onClearCategoryFilter?.();
            }}
            className="w-full min-h-[40px] px-2.5 py-1.5 text-xs bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-hidden focus:border-[#701428] text-neutral-700 truncate"
          >
            <option value="all">Semua Kategori</option>
            {allCategories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="w-full min-h-[40px] px-2.5 py-1.5 text-xs bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-hidden focus:border-[#701428] text-neutral-700 truncate"
          >
            <option value="newest">Terbaru</option>
            <option value="oldest">Terlama</option>
            <option value="highest">Nominal Terbesar</option>
            <option value="lowest">Nominal Terkecil</option>
          </select>
        </div>
      </div>

      {/* Transaction List Rows - Touch Friendly (min 56px height) */}
      {filteredTransactions.length === 0 ? (
        <div className="py-12 text-center px-4">
          <div className="w-12 h-12 mx-auto rounded-full bg-[#FDF2F4] text-[#701428] flex items-center justify-center mb-2.5">
            <Filter className="w-5 h-5" />
          </div>
          <h4 className="text-sm font-semibold text-neutral-800">
            Belum Ada Transaksi
          </h4>
          <p className="text-xs text-neutral-500 mt-1 max-w-xs mx-auto">
            {searchQuery || categoryFilter !== 'all' || typeFilter !== 'all'
              ? 'Tidak ada transaksi yang cocok dengan filter yang dipilih.'
              : 'Mulai dengan mencatat transaksi pengeluaran atau pemasukan pertama Anda.'}
          </p>
          <button
            onClick={onAddNew}
            className="mt-4 min-h-[44px] px-4 py-2 inline-flex items-center gap-1.5 text-xs font-bold text-white bg-[#701428] hover:bg-[#891B33] rounded-xl shadow-xs cursor-pointer active:scale-95 transition-transform"
          >
            <Plus className="w-4 h-4" />
            <span>Catat Transaksi Sekarang</span>
          </button>
        </div>
      ) : (
        <div className="divide-y divide-neutral-100">
          {filteredTransactions.map((tx) => {
            const isExpense = tx.type === 'expense';

            return (
              <div
                key={tx.id}
                onClick={() => setSelectedTxForAction(tx)}
                className="min-h-[58px] flex items-center justify-between p-3.5 sm:p-4 active:bg-neutral-100/80 hover:bg-neutral-50/70 transition-colors cursor-pointer select-none"
              >
                {/* Left: Icon & Details */}
                <div className="flex items-center gap-3 min-w-0 pr-3">
                  <div
                    className={`w-9 h-9 rounded-xl shrink-0 flex items-center justify-center ${
                      isExpense
                        ? 'bg-[#FDF2F4] text-[#701428]'
                        : 'bg-emerald-50 text-emerald-700'
                    }`}
                  >
                    {isExpense ? (
                      <ArrowDownRight className="w-4 h-4" />
                    ) : (
                      <ArrowUpRight className="w-4 h-4" />
                    )}
                  </div>

                  <div className="min-w-0">
                    <div className="text-xs sm:text-sm font-semibold text-neutral-900 truncate">
                      {tx.note}
                    </div>
                    <div className="flex items-center gap-1.5 text-[11px] text-neutral-500 mt-0.5 truncate">
                      <span className="font-medium text-neutral-700">{tx.category}</span>
                      <span aria-hidden="true" className="text-neutral-300">·</span>
                      <span className="font-mono-numbers">{formatDateIndo(tx.date)}</span>
                    </div>
                  </div>
                </div>

                {/* Right: Nominal & Chevron */}
                <div className="flex items-center gap-2 shrink-0">
                  <div
                    className={`text-xs sm:text-sm font-bold font-mono-numbers text-right ${
                      isExpense ? 'text-neutral-900' : 'text-emerald-700'
                    }`}
                  >
                    {isExpense ? '-' : '+'}
                    {formatRupiah(tx.amount)}
                  </div>
                  <ChevronRight className="w-4 h-4 text-neutral-300" />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Touch Action Drawer for the selected transaction */}
      <TransactionActionDrawer
        transaction={selectedTxForAction}
        onClose={() => setSelectedTxForAction(null)}
        onEdit={onEdit}
        onDuplicate={onDuplicate}
        onDelete={onDelete}
      />
    </div>
  );
};

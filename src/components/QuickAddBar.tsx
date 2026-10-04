import React, { useState } from 'react';
import { Plus, ArrowDownRight, ArrowUpRight } from 'lucide-react';
import { TransactionType, PaymentMethod, Transaction } from '../types';
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES } from '../data/defaultData';

interface QuickAddBarProps {
  onAddTransaction: (data: Omit<Transaction, 'id' | 'createdAt'>) => void;
}

export const QuickAddBar: React.FC<QuickAddBarProps> = ({ onAddTransaction }) => {
  const [type, setType] = useState<TransactionType>('expense');
  const [amountStr, setAmountStr] = useState<string>('');
  const [category, setCategory] = useState<string>(EXPENSE_CATEGORIES[0]);
  const [note, setNote] = useState<string>('');
  const [paymentMethod] = useState<PaymentMethod>('Transfer Bank');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanAmount = parseInt(amountStr.replace(/\D/g, '') || '0', 10);
    if (cleanAmount <= 0) return;

    onAddTransaction({
      type,
      amount: cleanAmount,
      category,
      date: new Date().toISOString().split('T')[0],
      note: note.trim() || category,
      paymentMethod,
    });

    setAmountStr('');
    setNote('');
  };

  const handleTypeChange = (newType: TransactionType) => {
    setType(newType);
    if (newType === 'expense') {
      setCategory(EXPENSE_CATEGORIES[0]);
    } else {
      setCategory(INCOME_CATEGORIES[0]);
    }
  };

  const handleQuickAddAmount = (add: number) => {
    const cur = parseInt(amountStr.replace(/\D/g, '') || '0', 10);
    setAmountStr((cur + add).toString());
  };

  const numericAmount = parseInt(amountStr.replace(/\D/g, '') || '0', 10);

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white rounded-2xl p-3.5 sm:p-4 shadow-xs border border-neutral-200/80 transition-all space-y-3"
    >
      {/* Row 1: Type Switcher & Amount */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5 items-center">
        {/* Type Toggle */}
        <div className="sm:col-span-4 grid grid-cols-2 p-1 bg-neutral-100 rounded-xl gap-1">
          <button
            type="button"
            onClick={() => handleTypeChange('expense')}
            className={`min-h-[40px] flex items-center justify-center gap-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              type === 'expense'
                ? 'bg-[#701428] text-white shadow-xs'
                : 'text-neutral-600 hover:text-neutral-900'
            }`}
          >
            <ArrowDownRight className="w-3.5 h-3.5" />
            <span>Pengeluaran</span>
          </button>
          <button
            type="button"
            onClick={() => handleTypeChange('income')}
            className={`min-h-[40px] flex items-center justify-center gap-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              type === 'income'
                ? 'bg-emerald-700 text-white shadow-xs'
                : 'text-neutral-600 hover:text-neutral-900'
            }`}
          >
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>Pemasukan</span>
          </button>
        </div>

        {/* Amount Input with big numeric font */}
        <div className="sm:col-span-8 relative">
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400 text-sm font-bold font-mono-numbers">
            Rp
          </span>
          <input
            type="text"
            inputMode="numeric"
            placeholder="0"
            value={numericAmount > 0 ? numericAmount.toLocaleString('id-ID') : amountStr}
            onChange={(e) => setAmountStr(e.target.value.replace(/\D/g, ''))}
            className="w-full min-h-[42px] pl-10 pr-3 text-base sm:text-lg font-extrabold font-mono-numbers bg-neutral-50 focus:bg-white border border-neutral-200 rounded-xl focus:outline-hidden focus:border-[#701428] transition-colors text-neutral-900"
          />
        </div>
      </div>

      {/* Row 2: Quick Amount Pills for Fast Thumb Tapping */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
        <span className="text-[10px] text-neutral-400 font-semibold shrink-0 uppercase tracking-wider pr-1">
          Pintasan:
        </span>
        {[10000, 20000, 50000, 100000, 500000].map((amt) => (
          <button
            key={amt}
            type="button"
            onClick={() => handleQuickAddAmount(amt)}
            className="min-h-[32px] px-2.5 rounded-lg bg-neutral-100 active:bg-[#701428] active:text-white text-neutral-700 text-xs font-bold font-mono-numbers shrink-0 cursor-pointer shadow-2xs transition-colors"
          >
            +{amt >= 1000000 ? `${amt / 1000000}jt` : `${amt / 1000}rb`}
          </button>
        ))}
        {numericAmount > 0 && (
          <button
            type="button"
            onClick={() => setAmountStr('')}
            className="min-h-[32px] px-2 rounded-lg text-[11px] font-semibold text-rose-600 bg-rose-50 cursor-pointer shrink-0"
          >
            Hapus
          </button>
        )}
      </div>

      {/* Row 3: Category, Note & Save Button */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5">
        <div className="sm:col-span-4">
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full min-h-[42px] px-3 py-1.5 text-xs font-semibold bg-neutral-50 focus:bg-white border border-neutral-200 rounded-xl focus:outline-hidden focus:border-[#701428] cursor-pointer text-neutral-800"
          >
            {(type === 'expense' ? EXPENSE_CATEGORIES : INCOME_CATEGORIES).map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        <div className="sm:col-span-5">
          <input
            type="text"
            placeholder="Catatan (cth: Makan siang, Kopi)..."
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="w-full min-h-[42px] px-3 py-1.5 text-xs bg-neutral-50 focus:bg-white border border-neutral-200 rounded-xl focus:outline-hidden focus:border-[#701428] transition-colors"
          />
        </div>

        <div className="sm:col-span-3">
          <button
            type="submit"
            disabled={numericAmount <= 0}
            className="w-full min-h-[42px] rounded-xl font-bold text-xs text-white bg-[#701428] hover:bg-[#891B33] active:bg-[#580F20] disabled:opacity-40 disabled:pointer-events-none shadow-sm shadow-[#701428]/25 flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 transition-transform"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Simpan</span>
          </button>
        </div>
      </div>
    </form>
  );
};

import React, { useState, useEffect } from 'react';
import { X, ArrowDownRight, ArrowUpRight, Check } from 'lucide-react';
import { Transaction, TransactionType, PaymentMethod } from '../types';
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES, PAYMENT_METHODS } from '../data/defaultData';

interface TransactionBottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (transaction: Omit<Transaction, 'id' | 'createdAt'>, existingId?: string) => void;
  initialData?: Transaction | null;
}

export const TransactionBottomSheet: React.FC<TransactionBottomSheetProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData,
}) => {
  const [type, setType] = useState<TransactionType>('expense');
  const [amountStr, setAmountStr] = useState<string>('');
  const [category, setCategory] = useState<string>(EXPENSE_CATEGORIES[0]);
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [note, setNote] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('Transfer Bank');

  useEffect(() => {
    if (initialData) {
      setType(initialData.type);
      setAmountStr(initialData.amount.toString());
      setCategory(initialData.category);
      setDate(initialData.date);
      setNote(initialData.note || '');
      setPaymentMethod(initialData.paymentMethod);
    } else if (isOpen) {
      setType('expense');
      setAmountStr('');
      setCategory(EXPENSE_CATEGORIES[0]);
      setDate(new Date().toISOString().split('T')[0]);
      setNote('');
      setPaymentMethod('Transfer Bank');
    }
  }, [initialData, isOpen]);

  const handleTypeChange = (newType: TransactionType) => {
    setType(newType);
    if (newType === 'expense' && !EXPENSE_CATEGORIES.includes(category as any)) {
      setCategory(EXPENSE_CATEGORIES[0]);
    } else if (newType === 'income' && !INCOME_CATEGORIES.includes(category as any)) {
      setCategory(INCOME_CATEGORIES[0]);
    }
  };

  const handleAddAmount = (add: number) => {
    const current = parseInt(amountStr.replace(/\D/g, '') || '0', 10);
    setAmountStr((current + add).toString());
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanAmount = parseInt(amountStr.replace(/\D/g, '') || '0', 10);
    if (cleanAmount <= 0) return;

    onSave(
      {
        type,
        amount: cleanAmount,
        category,
        date,
        note: note.trim() || category,
        paymentMethod,
      },
      initialData?.id
    );

    onClose();
  };

  if (!isOpen) return null;

  const numericAmount = parseInt(amountStr.replace(/\D/g, '') || '0', 10);
  const categories = type === 'expense' ? EXPENSE_CATEGORIES : INCOME_CATEGORIES;

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end bg-black/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200">
      {/* Tap outside to dismiss area */}
      <div className="flex-1" onClick={onClose} />

      {/* Slide-Up Bottom Sheet */}
      <div
        className="w-full max-w-lg mx-auto bg-white rounded-t-3xl shadow-2xl border-t border-neutral-200 max-h-[90vh] flex flex-col animate-in slide-in-from-bottom duration-250 overflow-hidden"
        role="dialog"
        aria-modal="true"
      >
        {/* Grab Handle */}
        <div className="pt-3 pb-1 cursor-grab" onClick={onClose}>
          <div className="w-12 h-1.5 bg-neutral-300 rounded-full mx-auto" />
        </div>

        {/* Sheet Header */}
        <div className="flex items-center justify-between px-5 py-2.5 border-b border-neutral-100">
          <h2 className="text-base font-bold text-neutral-900">
            {initialData ? 'Ubah Catatan Transaksi' : 'Catat Transaksi'}
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-500 hover:text-neutral-800 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 space-y-4">
          {/* Segmented Type Toggle - Large Touch Targets */}
          <div className="grid grid-cols-2 p-1 bg-neutral-100 rounded-xl gap-1">
            <button
              type="button"
              onClick={() => handleTypeChange('expense')}
              className={`min-h-[44px] flex items-center justify-center gap-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                type === 'expense'
                  ? 'bg-[#701428] text-white shadow-xs'
                  : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              <ArrowDownRight className="w-4 h-4" />
              <span>Pengeluaran</span>
            </button>
            <button
              type="button"
              onClick={() => handleTypeChange('income')}
              className={`min-h-[44px] flex items-center justify-center gap-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                type === 'income'
                  ? 'bg-emerald-700 text-white shadow-xs'
                  : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              <ArrowUpRight className="w-4 h-4" />
              <span>Pemasukan</span>
            </button>
          </div>

          {/* Big Amount Input */}
          <div className="bg-neutral-50 p-3 rounded-2xl border border-neutral-200 focus-within:border-[#701428] focus-within:bg-white transition-colors">
            <span className="block text-[11px] font-medium text-neutral-500 mb-1">
              Nominal Transaksi
            </span>
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold text-neutral-400 font-mono-numbers">
                Rp
              </span>
              <input
                type="text"
                inputMode="numeric"
                required
                autoFocus
                placeholder="0"
                value={numericAmount > 0 ? numericAmount.toLocaleString('id-ID') : amountStr}
                onChange={(e) => setAmountStr(e.target.value.replace(/\D/g, ''))}
                className="w-full text-2xl font-extrabold font-mono-numbers text-neutral-900 bg-transparent focus:outline-hidden"
              />
            </div>

            {/* Quick Tap Nominal Buttons (Thumb Friendly) */}
            <div className="flex flex-wrap gap-1.5 mt-3 pt-2.5 border-t border-neutral-200/60">
              {[10000, 20000, 50000, 100000, 500000].map((amt) => (
                <button
                  key={amt}
                  type="button"
                  onClick={() => handleAddAmount(amt)}
                  className="min-h-[36px] px-3 text-xs font-semibold font-mono-numbers bg-white border border-neutral-200 text-neutral-700 active:bg-[#701428] active:text-white rounded-lg cursor-pointer transition-colors shadow-2xs"
                >
                  +{amt >= 1000000 ? `${amt / 1000000}jt` : `${amt / 1000}rb`}
                </button>
              ))}
              <button
                type="button"
                onClick={() => setAmountStr('')}
                className="min-h-[36px] px-3 text-xs font-semibold text-rose-600 bg-white border border-rose-200 rounded-lg cursor-pointer"
              >
                Reset
              </button>
            </div>
          </div>

          {/* Category Chips - Quick Touch Selector */}
          <div>
            <span className="block text-xs font-semibold text-neutral-700 mb-2">
              Pilih Kategori
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {categories.map((cat) => {
                const isSelected = category === cat;
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setCategory(cat)}
                    className={`min-h-[42px] px-3 py-2 rounded-xl text-xs font-medium text-left flex items-center justify-between border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-[#FDF2F4] border-[#701428] text-[#701428] font-bold shadow-2xs'
                        : 'bg-white border-neutral-200 text-neutral-700 active:bg-neutral-50'
                    }`}
                  >
                    <span className="truncate pr-1">{cat}</span>
                    {isSelected && <Check className="w-3.5 h-3.5 shrink-0 text-[#701428]" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Note Input */}
          <div>
            <label className="block text-xs font-semibold text-neutral-700 mb-1.5">
              Catatan / Keterangan
            </label>
            <input
              type="text"
              placeholder="Contoh: Sarapan pagi, Bensin Shell, Kopi..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full min-h-[44px] px-3 py-2 text-xs bg-neutral-50 focus:bg-white border border-neutral-200 rounded-xl focus:outline-hidden focus:border-[#701428]"
            />
          </div>

          {/* Date & Payment Method */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1.5">
                Tanggal
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full min-h-[44px] px-2.5 py-2 text-xs bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-hidden focus:border-[#701428] cursor-pointer"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1.5">
                Metode Bayar
              </label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                className="w-full min-h-[44px] px-2.5 py-2 text-xs bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-hidden focus:border-[#701428] cursor-pointer"
              >
                {PAYMENT_METHODS.map((pm) => (
                  <option key={pm} value={pm}>
                    {pm}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Sticky Bottom Save Action Button */}
          <div className="pt-3 pb-2">
            <button
              type="submit"
              disabled={numericAmount <= 0}
              className="w-full min-h-[48px] rounded-xl font-bold text-sm text-white bg-[#701428] hover:bg-[#891B33] active:bg-[#580F20] disabled:opacity-40 disabled:pointer-events-none shadow-md shadow-[#701428]/25 flex items-center justify-center gap-2 cursor-pointer transition-transform active:scale-[0.98]"
            >
              <span>{initialData ? 'Simpan Perubahan' : 'Catat Transaksi Sekarang'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

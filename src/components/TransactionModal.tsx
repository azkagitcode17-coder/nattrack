import React, { useState, useEffect } from 'react';
import { X, ArrowDownRight, ArrowUpRight } from 'lucide-react';
import { Transaction, TransactionType, PaymentMethod } from '../types';
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES, PAYMENT_METHODS } from '../data/defaultData';
import { formatRupiah } from '../utils/formatters';

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (transaction: Omit<Transaction, 'id' | 'createdAt'>, existingId?: string) => void;
  initialData?: Transaction | null;
}

export const TransactionModal: React.FC<TransactionModalProps> = ({
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
    } else {
      // Reset form
      setType('expense');
      setAmountStr('');
      setCategory(EXPENSE_CATEGORIES[0]);
      setDate(new Date().toISOString().split('T')[0]);
      setNote('');
      setPaymentMethod('Transfer Bank');
    }
  }, [initialData, isOpen]);

  // Adjust category when switching type if needed
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs transition-opacity">
      <div
        className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-neutral-200/90 overflow-hidden animate-in fade-in zoom-in-95 duration-150"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-100">
          <h2 className="text-base font-semibold text-neutral-900">
            {initialData ? 'Ubah Transaksi' : 'Catat Transaksi Baru'}
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Segmented Type Toggle (Pengeluaran vs Pemasukan) */}
          <div className="grid grid-cols-2 p-1 bg-neutral-100 rounded-xl gap-1">
            <button
              type="button"
              onClick={() => handleTypeChange('expense')}
              className={`flex items-center justify-center gap-2 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
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
              className={`flex items-center justify-center gap-2 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                type === 'income'
                  ? 'bg-emerald-700 text-white shadow-xs'
                  : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              <ArrowUpRight className="w-4 h-4" />
              <span>Pemasukan</span>
            </button>
          </div>

          {/* Amount Input */}
          <div>
            <label className="block text-xs font-medium text-neutral-700 mb-1.5">
              Nominal (Rupiah)
            </label>
            <div className="relative rounded-xl border border-neutral-300 focus-within:border-[#701428] focus-within:ring-2 focus-within:ring-[#701428]/10 transition-all overflow-hidden">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400 text-sm font-semibold font-mono-numbers">
                Rp
              </span>
              <input
                type="text"
                inputMode="numeric"
                required
                autoFocus
                placeholder="0"
                value={numericAmount > 0 ? numericAmount.toLocaleString('id-ID') : amountStr}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, '');
                  setAmountStr(val);
                }}
                className="w-full pl-12 pr-4 py-2.5 text-lg font-bold font-mono-numbers text-neutral-900 placeholder:text-neutral-300 focus:outline-hidden"
              />
            </div>

            {/* Quick Amount Add Pills */}
            <div className="flex flex-wrap gap-1.5 mt-2">
              {[20000, 50000, 100000, 500000, 1000000].map((quick) => (
                <button
                  key={quick}
                  type="button"
                  onClick={() => handleAddAmount(quick)}
                  className="px-2.5 py-1 text-[11px] font-medium font-mono-numbers text-neutral-600 bg-neutral-100 hover:bg-[#FDF2F4] hover:text-[#701428] hover:border-[#701428]/30 border border-transparent rounded-md transition-colors cursor-pointer"
                >
                  +{quick >= 1000000 ? `${quick / 1000000}jt` : `${quick / 1000}rb`}
                </button>
              ))}
            </div>
          </div>

          {/* Category & Payment Method Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-neutral-700 mb-1.5">
                Kategori
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 text-xs font-medium text-neutral-900 bg-white border border-neutral-300 rounded-lg focus:outline-hidden focus:border-[#701428] focus:ring-2 focus:ring-[#701428]/10 cursor-pointer"
              >
                {(type === 'expense' ? EXPENSE_CATEGORIES : INCOME_CATEGORIES).map(
                  (cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  )
                )}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-700 mb-1.5">
                Metode Pembayaran
              </label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                className="w-full px-3 py-2 text-xs font-medium text-neutral-900 bg-white border border-neutral-300 rounded-lg focus:outline-hidden focus:border-[#701428] focus:ring-2 focus:ring-[#701428]/10 cursor-pointer"
              >
                {PAYMENT_METHODS.map((pm) => (
                  <option key={pm} value={pm}>
                    {pm}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Date & Note */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-neutral-700 mb-1.5">
                Tanggal
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 text-xs font-medium text-neutral-900 bg-white border border-neutral-300 rounded-lg focus:outline-hidden focus:border-[#701428] focus:ring-2 focus:ring-[#701428]/10 cursor-pointer"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-700 mb-1.5">
                Catatan / Deskripsi
              </label>
              <input
                type="text"
                placeholder="e.g. Makan siang, Bensin, Kopi"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="w-full px-3 py-2 text-xs text-neutral-900 bg-white border border-neutral-300 rounded-lg focus:outline-hidden focus:border-[#701428] focus:ring-2 focus:ring-[#701428]/10"
              />
            </div>
          </div>

          {/* Footer buttons */}
          <div className="pt-2 flex items-center justify-end gap-3 border-t border-neutral-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 rounded-lg transition-colors cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={numericAmount <= 0}
              className="px-5 py-2 text-xs font-semibold text-white bg-[#701428] hover:bg-[#891B33] disabled:opacity-50 disabled:pointer-events-none rounded-lg shadow-sm transition-all cursor-pointer"
            >
              {initialData ? 'Perbarui Transaksi' : 'Simpan Transaksi'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

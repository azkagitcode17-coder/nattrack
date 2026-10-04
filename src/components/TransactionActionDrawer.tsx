import React from 'react';
import { Edit2, Copy, Trash2, X, ArrowDownRight, ArrowUpRight } from 'lucide-react';
import { Transaction } from '../types';
import { formatRupiah, formatDateIndo } from '../utils/formatters';

interface TransactionActionDrawerProps {
  transaction: Transaction | null;
  onClose: () => void;
  onEdit: (tx: Transaction) => void;
  onDuplicate: (tx: Transaction) => void;
  onDelete: (id: string) => void;
}

export const TransactionActionDrawer: React.FC<TransactionActionDrawerProps> = ({
  transaction,
  onClose,
  onEdit,
  onDuplicate,
  onDelete,
}) => {
  if (!transaction) return null;

  const isExpense = transaction.type === 'expense';

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end bg-black/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200">
      <div className="flex-1" onClick={onClose} />

      <div
        className="w-full max-w-lg mx-auto bg-white rounded-t-3xl shadow-2xl border-t border-neutral-200 p-5 space-y-4 animate-in slide-in-from-bottom duration-250 safe-area-pb"
        role="dialog"
      >
        <div className="w-12 h-1.5 bg-neutral-300 rounded-full mx-auto -mt-1 cursor-grab" onClick={onClose} />

        {/* Transaction Brief Header */}
        <div className="flex items-center justify-between pt-1 pb-3 border-b border-neutral-100">
          <div className="flex items-center gap-3 min-w-0 pr-2">
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                isExpense ? 'bg-[#FDF2F4] text-[#701428]' : 'bg-emerald-50 text-emerald-700'
              }`}
            >
              {isExpense ? <ArrowDownRight className="w-5 h-5" /> : <ArrowUpRight className="w-5 h-5" />}
            </div>
            <div className="min-w-0">
              <h4 className="text-sm font-bold text-neutral-900 truncate">
                {transaction.note}
              </h4>
              <p className="text-xs text-neutral-500 font-mono-numbers">
                {transaction.category} · {formatDateIndo(transaction.date)}
              </p>
            </div>
          </div>
          <div className={`text-base font-extrabold font-mono-numbers shrink-0 ${
            isExpense ? 'text-neutral-900' : 'text-emerald-700'
          }`}>
            {isExpense ? '-' : '+'}{formatRupiah(transaction.amount)}
          </div>
        </div>

        {/* Action Buttons - Large Touch Targets (min 48px) */}
        <div className="space-y-2">
          <button
            onClick={() => {
              onClose();
              onEdit(transaction);
            }}
            className="w-full min-h-[48px] px-4 rounded-xl bg-neutral-50 active:bg-neutral-100 flex items-center gap-3 text-sm font-semibold text-neutral-800 transition-colors cursor-pointer"
          >
            <Edit2 className="w-4 h-4 text-[#701428]" />
            <span>Ubah Data Transaksi</span>
          </button>

          <button
            onClick={() => {
              onClose();
              onDuplicate(transaction);
            }}
            className="w-full min-h-[48px] px-4 rounded-xl bg-neutral-50 active:bg-neutral-100 flex items-center gap-3 text-sm font-semibold text-neutral-800 transition-colors cursor-pointer"
          >
            <Copy className="w-4 h-4 text-[#701428]" />
            <span>Duplikat Transaksi Hari Ini</span>
          </button>

          <button
            onClick={() => {
              onClose();
              onDelete(transaction.id);
            }}
            className="w-full min-h-[48px] px-4 rounded-xl bg-rose-50 active:bg-rose-100 flex items-center gap-3 text-sm font-semibold text-rose-700 transition-colors cursor-pointer"
          >
            <Trash2 className="w-4 h-4 text-rose-600" />
            <span>Hapus Transaksi Ini</span>
          </button>
        </div>

        {/* Close Button */}
        <div className="pt-1">
          <button
            onClick={onClose}
            className="w-full min-h-[44px] rounded-xl border border-neutral-200 text-xs font-bold text-neutral-600 active:bg-neutral-100 flex items-center justify-center cursor-pointer"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { Eye, EyeOff, TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight, Sparkles } from 'lucide-react';
import { formatRupiah } from '../utils/formatters';

interface MetricCardsProps {
  totalIncome: number;
  totalExpense: number;
  balance: number;
  periodLabel: string;
}

export const MetricCards: React.FC<MetricCardsProps> = ({
  totalIncome,
  totalExpense,
  balance,
  periodLabel,
}) => {
  const [showBalance, setShowBalance] = useState(true);

  const savingsRate = totalIncome > 0 
    ? Math.max(0, Math.round(((totalIncome - totalExpense) / totalIncome) * 100))
    : 0;

  const netCashFlow = totalIncome - totalExpense;

  return (
    <div className="space-y-3">
      {/* 1. Main Saldo Card (Dominant Imperial Maroon Wallet Surface) */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#701428] via-[#851932] to-[#580F20] text-white p-5 shadow-md shadow-[#701428]/20 border border-[#701428]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-[11px] uppercase tracking-wider text-rose-200/90 font-bold">
              Total Saldo Bersih
            </span>
            <button
              type="button"
              onClick={() => setShowBalance(!showBalance)}
              className="p-1 text-rose-200/80 hover:text-white cursor-pointer"
              title={showBalance ? 'Sembunyikan Saldo' : 'Tampilkan Saldo'}
            >
              {showBalance ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            </button>
          </div>
          <div className="text-[11px] text-rose-200/80 font-medium">
            {periodLabel}
          </div>
        </div>

        <div className="mt-2.5">
          <div className="text-2xl sm:text-3xl font-extrabold font-mono-numbers tracking-tight">
            {showBalance ? formatRupiah(balance) : 'Rp ••••••••'}
          </div>
          <div className="mt-2 flex items-center justify-between text-xs text-rose-200/80">
            <span>
              Arus Kas:{' '}
              <strong className="text-white font-mono-numbers">
                {netCashFlow >= 0 ? '+' : ''}{formatRupiah(netCashFlow)}
              </strong>
            </span>
            <span className="flex items-center gap-1 text-emerald-300 font-medium">
              <Sparkles className="w-3 h-3" />
              Tabungan {savingsRate}%
            </span>
          </div>
        </div>
      </div>

      {/* 2. Side-by-Side Pemasukan & Pengeluaran (2-Column Mobile Grid) */}
      <div className="grid grid-cols-2 gap-2.5 sm:gap-4">
        {/* Pemasukan */}
        <div className="rounded-2xl bg-white p-3.5 shadow-2xs border border-neutral-200/80">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wider">
              Pemasukan
            </span>
            <div className="w-6 h-6 rounded-md bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <TrendingUp className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-base sm:text-xl font-bold font-mono-numbers text-emerald-700 tracking-tight truncate">
              {formatRupiah(totalIncome)}
            </div>
            <div className="text-[10px] text-neutral-400 mt-0.5 flex items-center gap-0.5">
              <ArrowUpRight className="w-3 h-3 text-emerald-600" />
              <span>Masuk {periodLabel}</span>
            </div>
          </div>
        </div>

        {/* Pengeluaran */}
        <div className="rounded-2xl bg-white p-3.5 shadow-2xs border border-neutral-200/80">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wider">
              Pengeluaran
            </span>
            <div className="w-6 h-6 rounded-md bg-[#FDF2F4] text-[#701428] flex items-center justify-center">
              <TrendingDown className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-base sm:text-xl font-bold font-mono-numbers text-neutral-900 tracking-tight truncate">
              {formatRupiah(totalExpense)}
            </div>
            <div className="text-[10px] text-neutral-400 mt-0.5 flex items-center gap-0.5">
              <ArrowDownRight className="w-3 h-3 text-[#701428]" />
              <span>Keluar {periodLabel}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

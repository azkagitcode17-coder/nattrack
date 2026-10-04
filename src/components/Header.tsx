import React, { useState } from 'react';
import { Calendar, ChevronDown, Plus } from 'lucide-react';
import { PeriodFilter } from '../types';

interface HeaderProps {
  activeTab: 'summary' | 'history';
  onTabChange: (tab: 'summary' | 'history') => void;
  period: PeriodFilter;
  onPeriodChange: (p: PeriodFilter) => void;
  onOpenNewTransaction: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onTabChange,
  period,
  onPeriodChange,
  onOpenNewTransaction,
}) => {
  const [isPeriodMenuOpen, setIsPeriodMenuOpen] = useState(false);

  const periodLabels: Record<PeriodFilter, string> = {
    month: 'Bulan Ini',
    last_month: 'Bulan Lalu',
    year: 'Tahun Ini',
    all: 'Semua',
  };

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-[#701428]/10 transition-all">
      <div className="max-w-md md:max-w-4xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-14 sm:h-15 gap-3">
          {/* Brand Mark */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => onTabChange('summary')}
              className="text-left group cursor-pointer flex items-center gap-2 select-none"
            >
              <div className="w-8 h-8 rounded-xl bg-[#701428] flex items-center justify-center text-white font-extrabold text-sm tracking-wider shadow-xs shadow-[#701428]/30">
                N
              </div>
              <span className="font-bold tracking-tight text-lg text-neutral-900">
                Nat<span className="text-[#701428] font-extrabold">TRACK</span>
              </span>
            </button>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden sm:flex items-center gap-6 text-sm font-medium">
            <button
              onClick={() => onTabChange('summary')}
              className={`transition-colors py-1 cursor-pointer whitespace-nowrap ${
                activeTab === 'summary'
                  ? 'text-[#701428] font-bold border-b-2 border-[#701428]'
                  : 'text-neutral-600 hover:text-[#701428]'
              }`}
            >
              Diagram & Statistik
            </button>
            <button
              onClick={() => onTabChange('history')}
              className={`transition-colors py-1 cursor-pointer whitespace-nowrap ${
                activeTab === 'history'
                  ? 'text-[#701428] font-bold border-b-2 border-[#701428]'
                  : 'text-neutral-600 hover:text-[#701428]'
              }`}
            >
              Riwayat Transaksi
            </button>
          </nav>

          {/* Right Action: Period Filter & Catat */}
          <div className="flex items-center gap-2">
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsPeriodMenuOpen(!isPeriodMenuOpen)}
                className="min-h-[38px] px-3 rounded-xl bg-neutral-100 hover:bg-neutral-200/80 active:bg-neutral-200 text-xs font-semibold text-neutral-800 flex items-center gap-1.5 cursor-pointer transition-colors"
              >
                <Calendar className="w-3.5 h-3.5 text-[#701428]" />
                <span>{periodLabels[period]}</span>
                <ChevronDown className="w-3 h-3 text-neutral-500" />
              </button>

              {isPeriodMenuOpen && (
                <div
                  className="absolute right-0 top-full mt-1.5 w-36 bg-white rounded-xl shadow-xl border border-neutral-200/90 py-1.5 z-40 animate-in fade-in zoom-in-95 text-xs font-medium"
                  onMouseLeave={() => setIsPeriodMenuOpen(false)}
                >
                  {(['month', 'last_month', 'year', 'all'] as const).map((pKey) => (
                    <button
                      key={pKey}
                      type="button"
                      onClick={() => {
                        onPeriodChange(pKey);
                        setIsPeriodMenuOpen(false);
                      }}
                      className={`w-full text-left px-3.5 py-2 cursor-pointer transition-colors ${
                        period === pKey
                          ? 'bg-[#FDF2F4] text-[#701428] font-bold'
                          : 'text-neutral-700 hover:bg-neutral-100'
                      }`}
                    >
                      {periodLabels[pKey]}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <button
              onClick={onOpenNewTransaction}
              className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white bg-[#701428] hover:bg-[#891B33] active:bg-[#580F20] shadow-xs rounded-xl cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Catat</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

import React from 'react';
import { LayoutDashboard, ReceiptText, Plus } from 'lucide-react';

interface BottomNavBarProps {
  activeTab: 'summary' | 'history';
  onTabChange: (tab: 'summary' | 'history') => void;
  onOpenQuickAdd: () => void;
}

export const BottomNavBar: React.FC<BottomNavBarProps> = ({
  activeTab,
  onTabChange,
  onOpenQuickAdd,
}) => {
  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-neutral-200/80 shadow-lg safe-area-pb"
      aria-label="Navigasi Utama"
    >
      <div className="max-w-md mx-auto px-6 flex items-center justify-between h-16">
        {/* Tab 1: Ringkasan & Diagram */}
        <button
          onClick={() => onTabChange('summary')}
          className={`flex-1 min-h-[48px] flex flex-col items-center justify-center cursor-pointer transition-colors active:scale-95 ${
            activeTab === 'summary'
              ? 'text-[#701428]'
              : 'text-neutral-500 hover:text-neutral-900'
          }`}
        >
          <LayoutDashboard className={`w-5 h-5 ${activeTab === 'summary' ? 'stroke-[2.5]' : 'stroke-2'}`} />
          <span className={`text-[11px] tracking-tight mt-1 ${activeTab === 'summary' ? 'font-bold text-[#701428]' : 'font-medium'}`}>
            Statistik
          </span>
        </button>

        {/* Center Primary Action: Big Elevated (+) Button */}
        <div className="flex-1 flex justify-center -mt-6">
          <button
            onClick={onOpenQuickAdd}
            className="w-14 h-14 rounded-full bg-[#701428] active:bg-[#580F20] text-white shadow-xl shadow-[#701428]/35 flex items-center justify-center cursor-pointer active:scale-90 transition-transform border-4 border-white"
            aria-label="Catat Transaksi"
          >
            <Plus className="w-7 h-7 stroke-[2.5]" />
          </button>
        </div>

        {/* Tab 2: Riwayat Transaksi */}
        <button
          onClick={() => onTabChange('history')}
          className={`flex-1 min-h-[48px] flex flex-col items-center justify-center cursor-pointer transition-colors active:scale-95 ${
            activeTab === 'history'
              ? 'text-[#701428]'
              : 'text-neutral-500 hover:text-neutral-900'
          }`}
        >
          <ReceiptText className={`w-5 h-5 ${activeTab === 'history' ? 'stroke-[2.5]' : 'stroke-2'}`} />
          <span className={`text-[11px] tracking-tight mt-1 ${activeTab === 'history' ? 'font-bold text-[#701428]' : 'font-medium'}`}>
            Riwayat
          </span>
        </button>
      </div>
    </nav>
  );
};

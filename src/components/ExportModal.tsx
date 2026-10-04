import React, { useRef } from 'react';
import { X, FileSpreadsheet, FileJson, RotateCcw, Upload } from 'lucide-react';
import { Transaction, Budget, SavingsGoal } from '../types';
import { INITIAL_TRANSACTIONS, INITIAL_BUDGETS, INITIAL_GOALS } from '../data/defaultData';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  transactions: Transaction[];
  budgets: Budget[];
  goals: SavingsGoal[];
  onRestoreData: (data: { transactions: Transaction[]; budgets: Budget[]; goals: SavingsGoal[] }) => void;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  transactions,
  budgets,
  goals,
  onRestoreData,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const exportToCSV = () => {
    const headers = ['ID', 'Tipe', 'Nominal', 'Kategori', 'Tanggal', 'Catatan', 'Metode Pembayaran'];
    const rows = transactions.map((t) => [
      t.id,
      t.type === 'income' ? 'Pemasukan' : 'Pengeluaran',
      t.amount,
      `"${t.category.replace(/"/g, '""')}"`,
      t.date,
      `"${t.note.replace(/"/g, '""')}"`,
      t.paymentMethod,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `nattrack-transaksi-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportToJSON = () => {
    const backupData = {
      app: 'NatTRACK',
      version: '1.0',
      exportedAt: new Date().toISOString(),
      transactions,
      budgets,
      goals,
    };

    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(backupData, null, 2));
    const link = document.createElement('a');
    link.setAttribute('href', dataStr);
    link.setAttribute('download', `nattrack-cadangan-${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed.transactions && Array.isArray(parsed.transactions)) {
          onRestoreData({
            transactions: parsed.transactions,
            budgets: parsed.budgets || INITIAL_BUDGETS,
            goals: parsed.goals || INITIAL_GOALS,
          });
          alert('Data berhasil dipulihkan dari berkas cadangan!');
          onClose();
        } else {
          alert('Format berkas cadangan tidak valid.');
        }
      } catch (err) {
        alert('Gagal membaca berkas JSON.');
      }
    };
    reader.readAsText(file);
  };

  const handleResetToDemo = () => {
    if (confirm('Apakah Anda yakin ingin mengatur ulang data ke data percontohan awal?')) {
      onRestoreData({
        transactions: INITIAL_TRANSACTIONS,
        budgets: INITIAL_BUDGETS,
        goals: INITIAL_GOALS,
      });
      alert('Data telah diatur ulang ke data percontohan.');
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-neutral-200 overflow-hidden animate-in fade-in zoom-in-95">
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-100">
          <h3 className="text-base font-semibold text-neutral-900">
            Ekspor & Cadangan Data
          </h3>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-neutral-400 hover:text-neutral-700 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 space-y-3.5">
          {/* 1. CSV Download */}
          <button
            onClick={exportToCSV}
            className="w-full flex items-center justify-between p-3.5 rounded-xl border border-neutral-200 hover:border-[#701428] hover:bg-[#FDF2F4]/40 transition-colors text-left group cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
                <FileSpreadsheet className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-semibold text-neutral-900 group-hover:text-[#701428]">
                  Unduh Laporan Excel / CSV
                </div>
                <div className="text-[11px] text-neutral-500">
                  Format tabel untuk pembukuan atau spreadsheet
                </div>
              </div>
            </div>
          </button>

          {/* 2. JSON Backup */}
          <button
            onClick={exportToJSON}
            className="w-full flex items-center justify-between p-3.5 rounded-xl border border-neutral-200 hover:border-[#701428] hover:bg-[#FDF2F4]/40 transition-colors text-left group cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-[#FDF2F4] text-[#701428] flex items-center justify-center">
                <FileJson className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-semibold text-neutral-900 group-hover:text-[#701428]">
                  Cadangkan Seluruh Data (JSON)
                </div>
                <div className="text-[11px] text-neutral-500">
                  Termasuk transaksi, anggaran, dan target tabungan
                </div>
              </div>
            </div>
          </button>

          {/* 3. Restore JSON */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept=".json"
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="w-full flex items-center justify-between p-3.5 rounded-xl border border-neutral-200 hover:border-neutral-400 hover:bg-neutral-50 transition-colors text-left group cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-neutral-100 text-neutral-700 flex items-center justify-center">
                <Upload className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-semibold text-neutral-900">
                  Pulihkan dari Berkas Cadangan
                </div>
                <div className="text-[11px] text-neutral-500">
                  Unggah berkas JSON cadangan yang pernah dibuat
                </div>
              </div>
            </div>
          </button>

          {/* 4. Reset to Demo */}
          <div className="pt-2 border-t border-neutral-100">
            <button
              onClick={handleResetToDemo}
              className="w-full flex items-center justify-between p-3 rounded-lg text-rose-700 hover:bg-rose-50 text-left transition-colors cursor-pointer text-xs"
            >
              <div className="flex items-center gap-2">
                <RotateCcw className="w-4 h-4" />
                <span className="font-medium">Atur Ulang ke Data Percontohan</span>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

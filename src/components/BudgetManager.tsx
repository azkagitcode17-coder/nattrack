import React, { useState } from 'react';
import { Budget, Transaction } from '../types';
import { formatRupiah } from '../utils/formatters';
import { Settings2, Plus, AlertCircle, CheckCircle2, X } from 'lucide-react';
import { EXPENSE_CATEGORIES } from '../data/defaultData';

interface BudgetManagerProps {
  budgets: Budget[];
  transactions: Transaction[];
  onUpdateBudgets: (updated: Budget[]) => void;
}

export const BudgetManager: React.FC<BudgetManagerProps> = ({
  budgets,
  transactions,
  onUpdateBudgets,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [tempBudgets, setTempBudgets] = useState<Budget[]>(budgets);
  const [newCategory, setNewCategory] = useState<string>(EXPENSE_CATEGORIES[0]);
  const [newLimitStr, setNewLimitStr] = useState<string>('');

  // Calculate total spent per category for expenses
  const spentMap = new Map<string, number>();
  transactions
    .filter((t) => t.type === 'expense')
    .forEach((t) => {
      spentMap.set(t.category, (spentMap.get(t.category) || 0) + t.amount);
    });

  const totalBudget = budgets.reduce((acc, b) => acc + b.monthlyLimit, 0);
  const totalSpentInBudgeted = budgets.reduce(
    (acc, b) => acc + (spentMap.get(b.category) || 0),
    0
  );
  const overallPercentage =
    totalBudget > 0 ? (totalSpentInBudgeted / totalBudget) * 100 : 0;

  const handleOpenEdit = () => {
    setTempBudgets([...budgets]);
    setIsEditing(true);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateBudgets(tempBudgets);
    setIsEditing(false);
  };

  const handleAddBudgetRow = () => {
    const limit = parseInt(newLimitStr.replace(/\D/g, '') || '0', 10);
    if (limit <= 0) return;

    // Check if category already exists
    const exists = tempBudgets.find((b) => b.category === newCategory);
    if (exists) {
      setTempBudgets(
        tempBudgets.map((b) =>
          b.category === newCategory ? { ...b, monthlyLimit: limit } : b
        )
      );
    } else {
      setTempBudgets([...tempBudgets, { category: newCategory, monthlyLimit: limit }]);
    }
    setNewLimitStr('');
  };

  const handleDeleteBudget = (cat: string) => {
    setTempBudgets(tempBudgets.filter((b) => b.category !== cat));
  };

  return (
    <div className="space-y-6">
      {/* Top Banner / Summary */}
      <div className="rounded-xl bg-white p-5 sm:p-6 shadow-xs border border-neutral-200/80">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-neutral-100">
          <div>
            <h3 className="text-base font-semibold text-neutral-900">
              Pengawasan Anggaran Bulanan
            </h3>
            <p className="text-xs text-neutral-500 mt-0.5">
              Kontrol pengeluaran per kategori agar keuangan tetap terukur
            </p>
          </div>
          <button
            onClick={handleOpenEdit}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-[#701428] bg-[#FDF2F4] hover:bg-[#F8E2E6] border border-[#701428]/20 rounded-lg transition-colors cursor-pointer self-start sm:self-auto"
          >
            <Settings2 className="w-3.5 h-3.5" />
            <span>Kelola Batas Anggaran</span>
          </button>
        </div>

        {/* Global Budget Progress */}
        <div className="mt-5 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-neutral-500 font-medium">
              Total Terpakai: <span className="font-mono-numbers font-semibold text-neutral-900">{formatRupiah(totalSpentInBudgeted)}</span> dari <span className="font-mono-numbers font-semibold text-neutral-900">{formatRupiah(totalBudget)}</span>
            </span>
            <span className="font-mono-numbers font-bold text-neutral-900">
              {overallPercentage.toFixed(1)}%
            </span>
          </div>

          <div className="w-full bg-neutral-100 rounded-full h-2.5 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                overallPercentage >= 100
                  ? 'bg-rose-600'
                  : overallPercentage >= 80
                  ? 'bg-amber-500'
                  : 'bg-[#701428]'
              }`}
              style={{ width: `${Math.min(overallPercentage, 100)}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-[11px] text-neutral-400 pt-1">
            <span>Sisa Plafon Anggaran: {formatRupiah(Math.max(0, totalBudget - totalSpentInBudgeted))}</span>
            <span>{budgets.length} Kategori Ditetapkan</span>
          </div>
        </div>
      </div>

      {/* Category Budgets Grid */}
      {budgets.length === 0 ? (
        <div className="rounded-xl bg-white p-12 text-center border border-neutral-200/80 shadow-xs">
          <div className="w-12 h-12 mx-auto rounded-full bg-[#FDF2F4] text-[#701428] flex items-center justify-center mb-3">
            <Settings2 className="w-5 h-5" />
          </div>
          <h4 className="text-sm font-semibold text-neutral-800">
            Belum Ada Anggaran Ditetapkan
          </h4>
          <p className="text-xs text-neutral-500 mt-1 max-w-sm mx-auto">
            Tetapkan batas pengeluaran per kategori agar keuangan Anda senantiasa terkontrol dan terencana.
          </p>
          <button
            onClick={handleOpenEdit}
            className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-[#701428] hover:bg-[#891B33] rounded-lg transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Mulai Tetapkan Anggaran</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {budgets.map((b) => {
            const spent = spentMap.get(b.category) || 0;
            const pct = b.monthlyLimit > 0 ? (spent / b.monthlyLimit) * 100 : 0;
            const isOver = pct >= 100;
            const isWarning = pct >= 80 && !isOver;

            return (
              <div
                key={b.category}
                className="rounded-xl bg-white p-4 shadow-xs border border-neutral-200/80 hover:border-[#701428]/30 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-xs font-semibold text-neutral-900">
                      {b.category}
                    </span>
                    {isOver ? (
                      <span className="inline-flex items-center gap-1 text-[11px] text-rose-600 font-medium">
                        <AlertCircle className="w-3 h-3" /> Melebihi
                      </span>
                    ) : isWarning ? (
                      <span className="inline-flex items-center gap-1 text-[11px] text-amber-600 font-medium">
                        <AlertCircle className="w-3 h-3" /> Waspada
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[11px] text-emerald-600 font-medium">
                        <CheckCircle2 className="w-3 h-3" /> Terkendali
                      </span>
                    )}
                  </div>

                  <div className="mt-3 flex items-baseline justify-between text-xs">
                    <span className="font-mono-numbers text-base font-bold text-neutral-900">
                      {formatRupiah(spent)}
                    </span>
                    <span className="font-mono-numbers text-neutral-400">
                      / {formatRupiah(b.monthlyLimit)}
                    </span>
                  </div>

                  {/* Progress bar */}
                  <div className="w-full bg-neutral-100 rounded-full h-2 mt-2 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${
                        isOver
                          ? 'bg-rose-600'
                          : isWarning
                          ? 'bg-amber-500'
                          : 'bg-[#701428]'
                      }`}
                      style={{ width: `${Math.min(pct, 100)}%` }}
                    />
                  </div>
                </div>

                <div className="mt-3 pt-2.5 border-t border-neutral-100 flex items-center justify-between text-[11px] text-neutral-500">
                  <span>
                    {isOver
                      ? `Defisit: ${formatRupiah(spent - b.monthlyLimit)}`
                      : `Sisa: ${formatRupiah(b.monthlyLimit - spent)}`}
                  </span>
                  <span className="font-mono-numbers font-medium">{pct.toFixed(0)}%</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Edit Budgets Modal */}
      {isEditing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-neutral-200 overflow-hidden animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-100">
              <h3 className="text-base font-semibold text-neutral-900">
                Kelola Plafon Anggaran Bulanan
              </h3>
              <button
                onClick={() => setIsEditing(false)}
                className="p-1 rounded-lg text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
              {/* Existing budgets edit list */}
              <div className="space-y-3">
                {tempBudgets.map((tb, idx) => (
                  <div
                    key={tb.category}
                    className="flex items-center justify-between gap-3 p-3 bg-neutral-50 rounded-lg border border-neutral-200/80"
                  >
                    <span className="text-xs font-medium text-neutral-800 flex-1 truncate">
                      {tb.category}
                    </span>
                    <div className="relative w-36">
                      <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-neutral-400 text-xs font-mono-numbers">
                        Rp
                      </span>
                      <input
                        type="text"
                        value={tb.monthlyLimit.toLocaleString('id-ID')}
                        onChange={(e) => {
                          const val = parseInt(e.target.value.replace(/\D/g, '') || '0', 10);
                          const copy = [...tempBudgets];
                          copy[idx].monthlyLimit = val;
                          setTempBudgets(copy);
                        }}
                        className="w-full pl-8 pr-2 py-1 text-xs font-semibold font-mono-numbers bg-white border border-neutral-300 rounded focus:outline-hidden focus:border-[#701428]"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => handleDeleteBudget(tb.category)}
                      className="p-1 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded cursor-pointer"
                      title="Hapus Kategori"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>

              {/* Add New Budget Category */}
              <div className="pt-3 border-t border-neutral-200">
                <span className="text-xs font-semibold text-neutral-700 block mb-2">
                  Tambah Kategori Anggaran
                </span>
                <div className="flex gap-2">
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="flex-1 px-2.5 py-1.5 text-xs bg-white border border-neutral-300 rounded-lg focus:outline-hidden focus:border-[#701428]"
                  >
                    {EXPENSE_CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                  <div className="relative w-32">
                    <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-neutral-400 text-xs font-mono-numbers">
                      Rp
                    </span>
                    <input
                      type="text"
                      placeholder="Plafon"
                      value={newLimitStr ? parseInt(newLimitStr.replace(/\D/g, '') || '0').toLocaleString('id-ID') : ''}
                      onChange={(e) => setNewLimitStr(e.target.value)}
                      className="w-full pl-8 pr-2 py-1.5 text-xs font-mono-numbers bg-white border border-neutral-300 rounded-lg focus:outline-hidden focus:border-[#701428]"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleAddBudgetRow}
                    className="px-3 py-1.5 text-xs font-medium text-white bg-[#701428] hover:bg-[#891B33] rounded-lg cursor-pointer shrink-0"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 px-6 py-3.5 bg-neutral-50 border-t border-neutral-100">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 text-xs font-medium text-neutral-600 hover:text-neutral-900 cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleSaveEdit}
                className="px-4 py-2 text-xs font-semibold text-white bg-[#701428] hover:bg-[#891B33] rounded-lg cursor-pointer"
              >
                Simpan Perubahan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { Target, Plus, CheckCircle2, Calendar, Sparkles, X, Trash2 } from 'lucide-react';
import { SavingsGoal } from '../types';
import { formatRupiah, formatDateIndo } from '../utils/formatters';

interface SavingsGoalsProps {
  goals: SavingsGoal[];
  onUpdateGoals: (updated: SavingsGoal[]) => void;
}

export const SavingsGoals: React.FC<SavingsGoalsProps> = ({
  goals,
  onUpdateGoals,
}) => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [depositModalGoal, setDepositModalGoal] = useState<SavingsGoal | null>(null);
  const [depositAmountStr, setDepositAmountStr] = useState<string>('');

  // New goal state
  const [title, setTitle] = useState('');
  const [targetAmountStr, setTargetAmountStr] = useState('');
  const [initialAmountStr, setInitialAmountStr] = useState('');
  const [targetDate, setTargetDate] = useState('');
  const [notes, setNotes] = useState('');

  const triggerConfetti = () => {
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#701428', '#A32342', '#F2C9D2', '#D4AF37'],
    });
  };

  const handleCreateGoal = (e: React.FormEvent) => {
    e.preventDefault();
    const targetAmt = parseInt(targetAmountStr.replace(/\D/g, '') || '0', 10);
    const initAmt = parseInt(initialAmountStr.replace(/\D/g, '') || '0', 10);
    if (!title.trim() || targetAmt <= 0) return;

    const newGoal: SavingsGoal = {
      id: `goal-${Date.now()}`,
      title: title.trim(),
      targetAmount: targetAmt,
      currentAmount: initAmt,
      targetDate: targetDate || '2027-12-31',
      notes: notes.trim(),
    };

    onUpdateGoals([...goals, newGoal]);
    setIsAddModalOpen(false);

    // Reset
    setTitle('');
    setTargetAmountStr('');
    setInitialAmountStr('');
    setTargetDate('');
    setNotes('');

    if (initAmt >= targetAmt) {
      triggerConfetti();
    }
  };

  const handleDepositSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!depositModalGoal) return;
    const addAmt = parseInt(depositAmountStr.replace(/\D/g, '') || '0', 10);
    if (addAmt <= 0) return;

    const updated = goals.map((g) => {
      if (g.id === depositModalGoal.id) {
        const newTotal = g.currentAmount + addAmt;
        if (newTotal >= g.targetAmount && g.currentAmount < g.targetAmount) {
          triggerConfetti();
        }
        return { ...g, currentAmount: newTotal };
      }
      return g;
    });

    onUpdateGoals(updated);
    setDepositModalGoal(null);
    setDepositAmountStr('');
  };

  const handleDeleteGoal = (id: string) => {
    if (confirm('Hapus target tabungan ini?')) {
      onUpdateGoals(goals.filter((g) => g.id !== id));
    }
  };

  const totalTarget = goals.reduce((acc, g) => acc + g.targetAmount, 0);
  const totalSaved = goals.reduce((acc, g) => acc + g.currentAmount, 0);
  const totalPct = totalTarget > 0 ? (totalSaved / totalTarget) * 100 : 0;

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="rounded-xl bg-white p-5 sm:p-6 shadow-xs border border-neutral-200/80">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-neutral-100">
          <div>
            <h3 className="text-base font-semibold text-neutral-900">
              Target Tabungan & Rencana Impian
            </h3>
            <p className="text-xs text-neutral-500 mt-0.5">
              Wujudkan impian masa depan dengan konsistensi alokasi tabungan
            </p>
          </div>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-[#701428] hover:bg-[#891B33] rounded-lg transition-colors cursor-pointer self-start sm:self-auto"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Tambah Target Baru</span>
          </button>
        </div>

        {/* Aggregate Progress */}
        <div className="mt-5 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-neutral-500 font-medium">
              Terkumpul: <span className="font-mono-numbers font-semibold text-neutral-900">{formatRupiah(totalSaved)}</span> dari total target <span className="font-mono-numbers font-semibold text-neutral-900">{formatRupiah(totalTarget)}</span>
            </span>
            <span className="font-mono-numbers font-bold text-neutral-900">
              {totalPct.toFixed(1)}%
            </span>
          </div>

          <div className="w-full bg-neutral-100 rounded-full h-2.5 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[#701428] to-[#9E213D] rounded-full transition-all duration-500"
              style={{ width: `${Math.min(totalPct, 100)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Goals Grid */}
      {goals.length === 0 ? (
        <div className="rounded-xl bg-white p-12 text-center border border-neutral-200/80 shadow-xs">
          <div className="w-12 h-12 mx-auto rounded-full bg-[#FDF2F4] text-[#701428] flex items-center justify-center mb-3">
            <Target className="w-5 h-5" />
          </div>
          <h4 className="text-sm font-semibold text-neutral-800">
            Belum Ada Target Tabungan
          </h4>
          <p className="text-xs text-neutral-500 mt-1 max-w-sm mx-auto">
            Mulai rencanakan pos impian Anda seperti Dana Darurat, Tabungan Liburan, atau Investasi Masa Depan.
          </p>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-[#701428] hover:bg-[#891B33] rounded-lg transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Buat Target Pertama</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {goals.map((g) => {
            const pct = g.targetAmount > 0 ? (g.currentAmount / g.targetAmount) * 100 : 0;
            const isAchieved = pct >= 100;
            const remaining = Math.max(0, g.targetAmount - g.currentAmount);

            return (
              <div
                key={g.id}
                className={`rounded-xl p-5 shadow-xs border transition-all flex flex-col justify-between ${
                  isAchieved
                    ? 'bg-gradient-to-b from-[#FDF2F4] to-white border-[#701428]/30'
                    : 'bg-white border-neutral-200/80 hover:border-[#701428]/30'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                          isAchieved
                            ? 'bg-[#701428] text-white'
                            : 'bg-[#FDF2F4] text-[#701428]'
                        }`}
                      >
                        {isAchieved ? (
                          <Sparkles className="w-4 h-4" />
                        ) : (
                          <Target className="w-4 h-4" />
                        )}
                      </div>
                      <h4 className="text-sm font-semibold text-neutral-900 leading-snug">
                        {g.title}
                      </h4>
                    </div>
                    <button
                      onClick={() => handleDeleteGoal(g.id)}
                      className="p-1 text-neutral-400 hover:text-rose-600 rounded cursor-pointer"
                      title="Hapus Target"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {g.notes && (
                    <p className="text-xs text-neutral-500 mt-2 line-clamp-2">
                      {g.notes}
                    </p>
                  )}

                  {/* Amount Progress */}
                  <div className="mt-4">
                    <div className="flex items-baseline justify-between text-xs">
                      <span className="font-mono-numbers text-lg font-bold text-neutral-900">
                        {formatRupiah(g.currentAmount)}
                      </span>
                      <span className="font-mono-numbers text-neutral-400">
                        / {formatRupiah(g.targetAmount)}
                      </span>
                    </div>

                    <div className="w-full bg-neutral-100 rounded-full h-2 mt-2 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          isAchieved ? 'bg-emerald-600' : 'bg-[#701428]'
                        }`}
                        style={{ width: `${Math.min(pct, 100)}%` }}
                      />
                    </div>

                    <div className="mt-2.5 flex items-center justify-between text-[11px] text-neutral-500">
                      <span>
                        {isAchieved ? (
                          <span className="text-emerald-600 font-semibold flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" /> Target Tercapai!
                          </span>
                        ) : (
                          `Kurang ${formatRupiah(remaining)}`
                        )}
                      </span>
                      <span className="font-mono-numbers font-medium">{pct.toFixed(0)}%</span>
                    </div>
                  </div>
                </div>

                {/* Action Buttons & Target Date */}
                <div className="mt-5 pt-3 border-t border-neutral-100 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1 text-[11px] text-neutral-400">
                    <Calendar className="w-3 h-3" />
                    <span>Target: {formatDateIndo(g.targetDate)}</span>
                  </div>

                  <button
                    onClick={() => {
                      setDepositModalGoal(g);
                      setDepositAmountStr('');
                    }}
                    className="px-2.5 py-1 text-xs font-semibold text-[#701428] bg-[#FDF2F4] hover:bg-[#891B33] hover:text-white rounded-lg transition-colors cursor-pointer"
                  >
                    + Setor
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Setor Modal */}
      {depositModalGoal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="w-full max-w-sm bg-white rounded-2xl shadow-2xl border border-neutral-200 p-6 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
              <h3 className="text-sm font-semibold text-neutral-900">
                Setor ke: {depositModalGoal.title}
              </h3>
              <button
                onClick={() => setDepositModalGoal(null)}
                className="p-1 text-neutral-400 hover:text-neutral-700 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleDepositSubmit} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-medium text-neutral-600 mb-1">
                  Nominal Tambahan
                </label>
                <div className="relative border border-neutral-300 rounded-lg overflow-hidden focus-within:border-[#701428]">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 text-xs font-mono-numbers">
                    Rp
                  </span>
                  <input
                    type="text"
                    required
                    autoFocus
                    placeholder="0"
                    value={depositAmountStr ? parseInt(depositAmountStr.replace(/\D/g, '') || '0').toLocaleString('id-ID') : ''}
                    onChange={(e) => setDepositAmountStr(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-base font-bold font-mono-numbers text-neutral-900 focus:outline-hidden"
                  />
                </div>
              </div>

              {/* Quick Pills */}
              <div className="flex flex-wrap gap-1.5">
                {[100000, 250000, 500000, 1000000].map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => {
                      const cur = parseInt(depositAmountStr.replace(/\D/g, '') || '0', 10);
                      setDepositAmountStr((cur + amt).toString());
                    }}
                    className="px-2 py-1 text-[11px] font-mono-numbers bg-neutral-100 hover:bg-[#FDF2F4] hover:text-[#701428] rounded cursor-pointer"
                  >
                    +{amt >= 1000000 ? `${amt / 1000000}jt` : `${amt / 1000}rb`}
                  </button>
                ))}
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setDepositModalGoal(null)}
                  className="px-3.5 py-1.5 text-xs text-neutral-600 hover:text-neutral-900 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-semibold text-white bg-[#701428] hover:bg-[#891B33] rounded-lg cursor-pointer"
                >
                  Simpan Setoran
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add New Goal Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-neutral-200 overflow-hidden animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-100">
              <h3 className="text-base font-semibold text-neutral-900">
                Tambah Target Impian Baru
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 rounded-lg text-neutral-400 hover:text-neutral-700 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateGoal} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-medium text-neutral-700 mb-1">
                  Nama Target
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Dana Darurat, Umroh, Beli Kendaraan"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-neutral-300 rounded-lg focus:outline-hidden focus:border-[#701428]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-neutral-700 mb-1">
                    Target Nominal
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Rp 0"
                    value={targetAmountStr ? parseInt(targetAmountStr.replace(/\D/g, '') || '0').toLocaleString('id-ID') : ''}
                    onChange={(e) => setTargetAmountStr(e.target.value)}
                    className="w-full px-3 py-2 text-xs font-mono-numbers border border-neutral-300 rounded-lg focus:outline-hidden focus:border-[#701428]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-neutral-700 mb-1">
                    Saldo Awal
                  </label>
                  <input
                    type="text"
                    placeholder="Rp 0"
                    value={initialAmountStr ? parseInt(initialAmountStr.replace(/\D/g, '') || '0').toLocaleString('id-ID') : ''}
                    onChange={(e) => setInitialAmountStr(e.target.value)}
                    className="w-full px-3 py-2 text-xs font-mono-numbers border border-neutral-300 rounded-lg focus:outline-hidden focus:border-[#701428]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-700 mb-1">
                  Target Waktu Penyelesaian
                </label>
                <input
                  type="date"
                  value={targetDate}
                  onChange={(e) => setTargetDate(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-neutral-300 rounded-lg focus:outline-hidden focus:border-[#701428]"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-700 mb-1">
                  Catatan / Motivasi
                </label>
                <input
                  type="text"
                  placeholder="e.g. Sisihkan Rp 500rb per bulan"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-neutral-300 rounded-lg focus:outline-hidden focus:border-[#701428]"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-neutral-100">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 text-xs text-neutral-600 hover:text-neutral-900 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-white bg-[#701428] hover:bg-[#891B33] rounded-lg cursor-pointer"
                >
                  Simpan Target
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

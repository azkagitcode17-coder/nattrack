import React, { useState } from 'react';
import { Transaction } from '../types';
import { formatRupiah } from '../utils/formatters';

interface CategoryBreakdownProps {
  transactions: Transaction[];
  onSelectCategory?: (category: string | null) => void;
  selectedCategory?: string | null;
}

const MAROON_PALETTE = [
  '#701428',
  '#8A1C36',
  '#540F1F',
  '#A32342',
  '#C24864',
  '#8E3E4B',
  '#B86B7C',
  '#5E1927',
  '#D996A5',
  '#A84D60',
];

export const CategoryBreakdown: React.FC<CategoryBreakdownProps> = ({
  transactions,
  onSelectCategory,
  selectedCategory,
}) => {
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);

  // Filter only expenses
  const expenses = transactions.filter((t) => t.type === 'expense');
  const totalExpense = expenses.reduce((acc, t) => acc + t.amount, 0);

  // Group by category
  const categoryMap = new Map<string, number>();
  expenses.forEach((t) => {
    categoryMap.set(t.category, (categoryMap.get(t.category) || 0) + t.amount);
  });

  const categories = Array.from(categoryMap.entries())
    .map(([name, amount], index) => ({
      name,
      amount,
      percentage: totalExpense > 0 ? (amount / totalExpense) * 100 : 0,
      color: MAROON_PALETTE[index % MAROON_PALETTE.length],
    }))
    .sort((a, b) => b.amount - a.amount);

  // Donut chart geometry calculations
  const size = 160;
  const strokeWidth = 24;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  let accumulatedPercentage = 0;

  return (
    <div className="rounded-xl bg-white p-5 sm:p-6 shadow-xs border border-neutral-200/80">
      <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
        <h3 className="text-base font-semibold text-neutral-900">
          Alokasi Pengeluaran
        </h3>
        {selectedCategory && (
          <button
            onClick={() => onSelectCategory?.(null)}
            className="text-xs text-[#701428] hover:underline font-medium cursor-pointer"
          >
            Reset Filter
          </button>
        )}
      </div>

      {categories.length === 0 ? (
        <div className="py-12 text-center text-xs text-neutral-400">
          Belum ada catatan pengeluaran pada periode ini.
        </div>
      ) : (
        <div className="mt-4 flex flex-col sm:flex-row items-center gap-6">
          {/* Donut Chart SVG */}
          <div className="relative shrink-0 flex items-center justify-center">
            <svg width={size} height={size} className="-rotate-90">
              <circle
                cx={size / 2}
                cy={size / 2}
                r={radius}
                fill="none"
                stroke="#F5F3F4"
                strokeWidth={strokeWidth}
              />
              {categories.map((cat) => {
                const strokeDasharray = `${(cat.percentage / 100) * circumference} ${circumference}`;
                const strokeDashoffset = -((accumulatedPercentage / 100) * circumference);
                accumulatedPercentage += cat.percentage;

                const isTargeted =
                  hoveredCategory === cat.name || selectedCategory === cat.name;

                return (
                  <circle
                    key={cat.name}
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    fill="none"
                    stroke={cat.color}
                    strokeWidth={isTargeted ? strokeWidth + 4 : strokeWidth}
                    strokeDasharray={strokeDasharray}
                    strokeDashoffset={strokeDashoffset}
                    className="transition-all duration-200 cursor-pointer"
                    onMouseEnter={() => setHoveredCategory(cat.name)}
                    onMouseLeave={() => setHoveredCategory(null)}
                    onClick={() => {
                      onSelectCategory?.(
                        selectedCategory === cat.name ? null : cat.name
                      );
                    }}
                  />
                );
              })}
            </svg>

            {/* Inner Donut Center Content */}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none px-2">
              <span className="text-[10px] uppercase text-neutral-400 font-medium">
                {hoveredCategory || (selectedCategory ? 'Kategori' : 'Total')}
              </span>
              <span className="text-xs font-bold font-mono-numbers text-neutral-900 truncate max-w-[100px]">
                {hoveredCategory
                  ? `${categories.find((c) => c.name === hoveredCategory)?.percentage.toFixed(0)}%`
                  : formatRupiah(totalExpense)}
              </span>
            </div>
          </div>

          {/* Category List & Progress bars */}
          <div className="w-full space-y-2.5 max-h-48 overflow-y-auto pr-1">
            {categories.map((cat) => {
              const isSelected = selectedCategory === cat.name;
              const isHovered = hoveredCategory === cat.name;

              return (
                <div
                  key={cat.name}
                  onClick={() =>
                    onSelectCategory?.(isSelected ? null : cat.name)
                  }
                  onMouseEnter={() => setHoveredCategory(cat.name)}
                  onMouseLeave={() => setHoveredCategory(null)}
                  className={`p-2 rounded-lg transition-colors cursor-pointer text-xs ${
                    isSelected
                      ? 'bg-[#FDF2F4] border border-[#701428]/30'
                      : isHovered
                      ? 'bg-neutral-50'
                      : 'hover:bg-neutral-50/60'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2 truncate pr-2">
                      <span
                        className="w-2.5 h-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: cat.color }}
                      />
                      <span className="font-medium text-neutral-800 truncate">
                        {cat.name}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 shrink-0 font-mono-numbers">
                      <span className="text-neutral-500 text-[11px]">
                        {cat.percentage.toFixed(1)}%
                      </span>
                      <span className="font-semibold text-neutral-900">
                        {formatRupiah(cat.amount)}
                      </span>
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="w-full bg-neutral-100 rounded-full h-1.5 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-300"
                      style={{
                        width: `${cat.percentage}%`,
                        backgroundColor: cat.color,
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

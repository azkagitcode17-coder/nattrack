import React, { useState } from 'react';
import { Transaction } from '../types';
import { formatRupiah, formatDateIndo } from '../utils/formatters';

interface CashflowChartProps {
  transactions: Transaction[];
}

export const CashflowChart: React.FC<CashflowChartProps> = ({ transactions }) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [viewMode, setViewMode] = useState<'both' | 'income' | 'expense'>('both');

  // Aggregate daily data for the past 14 days or available sorted range
  const dailyMap = new Map<string, { income: number; expense: number; dateStr: string }>();

  // Fill in the last 10 days as minimum baseline
  for (let i = 9; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = d.toISOString().split('T')[0];
    dailyMap.set(key, { income: 0, expense: 0, dateStr: key });
  }

  // Aggregate transactions
  transactions.forEach((tx) => {
    if (dailyMap.has(tx.date)) {
      const existing = dailyMap.get(tx.date)!;
      if (tx.type === 'income') existing.income += tx.amount;
      else existing.expense += tx.amount;
    } else {
      // If within reason
      dailyMap.set(tx.date, {
        income: tx.type === 'income' ? tx.amount : 0,
        expense: tx.type === 'expense' ? tx.amount : 0,
        dateStr: tx.date,
      });
    }
  });

  const sortedData = Array.from(dailyMap.values())
    .sort((a, b) => a.dateStr.localeCompare(b.dateStr))
    .slice(-10); // Display 10 points for optimal spacing

  const maxVal = Math.max(
    ...sortedData.map((d) => Math.max(d.income, d.expense)),
    1000000 // minimum scale 1 juta
  );

  const chartHeight = 180;
  const chartWidth = 560;
  const paddingX = 40;
  const paddingY = 25;
  const usableWidth = chartWidth - paddingX * 2;
  const usableHeight = chartHeight - paddingY * 2;

  const getX = (index: number) => paddingX + (index / (sortedData.length - 1 || 1)) * usableWidth;
  const getY = (val: number) => chartHeight - paddingY - (val / maxVal) * usableHeight;

  // Generate SVG path for income
  const incomePoints = sortedData.map((d, i) => `${getX(i)},${getY(d.income)}`).join(' ');
  const incomeArea = `${incomePoints} ${getX(sortedData.length - 1)},${chartHeight - paddingY} ${getX(0)},${chartHeight - paddingY}`;

  // Generate SVG path for expense
  const expensePoints = sortedData.map((d, i) => `${getX(i)},${getY(d.expense)}`).join(' ');
  const expenseArea = `${expensePoints} ${getX(sortedData.length - 1)},${chartHeight - paddingY} ${getX(0)},${chartHeight - paddingY}`;

  return (
    <div className="rounded-xl bg-white p-5 sm:p-6 shadow-xs border border-neutral-200/80">
      {/* Chart Header with Interactive Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-neutral-100">
        <div>
          <h3 className="text-base font-semibold text-neutral-900">
            Dinamika Arus Kas Harian
          </h3>
          <p className="text-xs text-neutral-500 mt-0.5">
            Perbandingan tren pemasukan vs pengeluaran 10 hari terakhir
          </p>
        </div>

        {/* Interactive Segmented Switcher */}
        <div className="inline-flex items-center gap-1 p-1 bg-neutral-100/80 rounded-lg self-start sm:self-auto">
          <button
            onClick={() => setViewMode('both')}
            className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors cursor-pointer ${
              viewMode === 'both'
                ? 'bg-white text-neutral-900 shadow-xs'
                : 'text-neutral-600 hover:text-neutral-900'
            }`}
          >
            Semua
          </button>
          <button
            onClick={() => setViewMode('income')}
            className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors cursor-pointer ${
              viewMode === 'income'
                ? 'bg-white text-emerald-700 shadow-xs'
                : 'text-neutral-600 hover:text-emerald-700'
            }`}
          >
            Pemasukan
          </button>
          <button
            onClick={() => setViewMode('expense')}
            className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors cursor-pointer ${
              viewMode === 'expense'
                ? 'bg-white text-[#701428] shadow-xs'
                : 'text-neutral-600 hover:text-[#701428]'
            }`}
          >
            Pengeluaran
          </button>
        </div>
      </div>

      {/* SVG Interactive Chart */}
      <div className="relative mt-4 w-full overflow-hidden">
        <svg
          viewBox={`0 0 ${chartWidth} ${chartHeight}`}
          className="w-full h-48 sm:h-56 select-none overflow-visible"
        >
          <defs>
            {/* Maroon Gradient for Expense */}
            <linearGradient id="maroonGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#701428" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#701428" stopOpacity="0.0" />
            </linearGradient>

            {/* Emerald Gradient for Income */}
            <linearGradient id="emeraldGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#059669" stopOpacity="0.20" />
              <stop offset="100%" stopColor="#059669" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Horizontal Grid lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((pct, idx) => {
            const y = chartHeight - paddingY - pct * usableHeight;
            return (
              <g key={idx}>
                <line
                  x1={paddingX}
                  y1={y}
                  x2={chartWidth - paddingX}
                  y2={y}
                  stroke="#E5E7EB"
                  strokeDasharray="3 3"
                  strokeWidth="1"
                />
              </g>
            );
          })}

          {/* Income Area & Line */}
          {(viewMode === 'both' || viewMode === 'income') && (
            <>
              <polygon points={incomeArea} fill="url(#emeraldGrad)" />
              <polyline
                points={incomePoints}
                fill="none"
                stroke="#059669"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </>
          )}

          {/* Expense Area & Line */}
          {(viewMode === 'both' || viewMode === 'expense') && (
            <>
              <polygon points={expenseArea} fill="url(#maroonGrad)" />
              <polyline
                points={expensePoints}
                fill="none"
                stroke="#701428"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </>
          )}

          {/* Interactive Data Points & Hover Targets */}
          {sortedData.map((d, i) => {
            const x = getX(i);
            const isHovered = hoveredIndex === i;

            return (
              <g key={d.dateStr} className="cursor-pointer">
                {/* Hover vertical guide */}
                {isHovered && (
                  <line
                    x1={x}
                    y1={paddingY - 5}
                    x2={x}
                    y2={chartHeight - paddingY}
                    stroke="#701428"
                    strokeWidth="1"
                    strokeDasharray="2 2"
                    opacity="0.6"
                  />
                )}

                {/* Point markers */}
                {(viewMode === 'both' || viewMode === 'income') && d.income > 0 && (
                  <circle
                    cx={x}
                    cy={getY(d.income)}
                    r={isHovered ? 5 : 3.5}
                    fill="#059669"
                    stroke="#FFFFFF"
                    strokeWidth="2"
                    className="transition-all"
                  />
                )}

                {(viewMode === 'both' || viewMode === 'expense') && d.expense > 0 && (
                  <circle
                    cx={x}
                    cy={getY(d.expense)}
                    r={isHovered ? 5 : 3.5}
                    fill="#701428"
                    stroke="#FFFFFF"
                    strokeWidth="2"
                    className="transition-all"
                  />
                )}

                {/* Wide invisible rectangle for effortless hovering & mobile touch */}
                <rect
                  x={x - usableWidth / (sortedData.length * 2)}
                  y={0}
                  width={usableWidth / sortedData.length}
                  height={chartHeight}
                  fill="transparent"
                  onMouseEnter={() => setHoveredIndex(i)}
                  onMouseLeave={() => setHoveredIndex(null)}
                  onTouchStart={() => setHoveredIndex(i)}
                  onClick={() => setHoveredIndex(hoveredIndex === i ? null : i)}
                />

                {/* X Axis Label */}
                <text
                  x={x}
                  y={chartHeight - 6}
                  textAnchor="middle"
                  fontSize="10"
                  fill="#6B7280"
                  className="font-mono-numbers"
                >
                  {d.dateStr.split('-')[2]}/{d.dateStr.split('-')[1]}
                </text>
              </g>
            );
          })}
        </svg>

        {/* Dynamic Tooltip */}
        {hoveredIndex !== null && sortedData[hoveredIndex] && (
          <div
            className="absolute top-2 right-4 bg-neutral-900/95 backdrop-blur-md text-white text-xs p-3 rounded-lg shadow-lg border border-neutral-700 pointer-events-none transition-all z-20"
          >
            <div className="font-semibold text-neutral-300 pb-1.5 border-b border-neutral-700/80 mb-1.5">
              {formatDateIndo(sortedData[hoveredIndex].dateStr)}
            </div>
            <div className="space-y-1 font-mono-numbers">
              <div className="flex items-center justify-between gap-4 text-emerald-400">
                <span>Pemasukan:</span>
                <span className="font-semibold">{formatRupiah(sortedData[hoveredIndex].income)}</span>
              </div>
              <div className="flex items-center justify-between gap-4 text-rose-300">
                <span>Pengeluaran:</span>
                <span className="font-semibold">{formatRupiah(sortedData[hoveredIndex].expense)}</span>
              </div>
              <div className="flex items-center justify-between gap-4 text-neutral-400 pt-1 border-t border-neutral-800 text-[11px]">
                <span>Selisih:</span>
                <span className={sortedData[hoveredIndex].income - sortedData[hoveredIndex].expense >= 0 ? 'text-white' : 'text-rose-400'}>
                  {formatRupiah(sortedData[hoveredIndex].income - sortedData[hoveredIndex].expense)}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Chart Legend */}
      <div className="mt-4 pt-3 border-t border-neutral-100 flex items-center justify-between text-xs text-neutral-500">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#701428]" />
            <span>Pengeluaran</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#059669]" />
            <span>Pemasukan</span>
          </div>
        </div>
        <div className="hidden sm:block text-[11px] text-neutral-400">
          Arahkan kursor ke grafik untuk detail
        </div>
      </div>
    </div>
  );
};

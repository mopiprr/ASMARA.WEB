import { useState } from 'react';
import {
  Wallet,
  TrendingUp,
  Clock,
  AlertCircle,
  PieChart as PieChartIcon,
} from 'lucide-react';
import type { BudgetOverview } from '../types/finance.types';

export function formatIDR(value: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatCompactIDR(value: number): string {
  const abs = Math.abs(value);
  const sign = value < 0 ? '-' : '';
  if (abs >= 1_000_000_000) {
    return `${sign}Rp ${(abs / 1_000_000_000).toFixed(2)} M`;
  }
  if (abs >= 1_000_000) {
    return `${sign}Rp ${(abs / 1_000_000).toFixed(1)} Jt`;
  }
  return formatIDR(value);
}

interface BudgetOverviewCardsProps {
  overview: BudgetOverview | null;
  isLoading: boolean;
}

type SegmentKey = 'spent' | 'committed' | 'remaining' | null;

export default function BudgetOverviewCards({
  overview,
  isLoading,
}: BudgetOverviewCardsProps) {
  const [hoveredSegment, setHoveredSegment] = useState<SegmentKey>(null);

  if (isLoading || !overview) {
    return (
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
        <div className="h-64 animate-pulse rounded-2xl border border-slate-100 bg-white p-6 shadow-xs lg:col-span-5" />
        <div className="h-64 animate-pulse rounded-2xl border border-slate-100 bg-white p-6 shadow-xs lg:col-span-7" />
      </div>
    );
  }

  const allocated = Math.max(overview.totalAllocated, 1);
  const spent = Math.max(overview.totalSpent, 0);
  const committed = Math.max(overview.totalCommitted, 0);
  const remaining = Math.max(overview.totalRemaining, 0);
  const isOverBudget = overview.totalRemaining < 0;

  // Hitung persentase distribusi terhadap total alokasi
  const totalPool = Math.max(allocated, spent + committed + remaining);
  const spentPct = (spent / totalPool) * 100;
  const committedPct = (committed / totalPool) * 100;
  const remainingPct = (remaining / totalPool) * 100;

  // Parameter SVG Donut Chart
  const size = 196;
  const strokeWidth = 22;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  const segments = [
    {
      key: 'spent' as const,
      label: 'Realized Expenditure',
      sublabel: 'Dana sudah terealisasi',
      value: overview.totalSpent,
      pct: (spent / allocated) * 100,
      ringPct: spentPct,
      color: '#10b981', // Emerald 500
      trackBg: 'bg-emerald-500',
      badgeBg: 'bg-emerald-50 text-emerald-700 border-emerald-200/80',
      icon: TrendingUp,
    },
    {
      key: 'committed' as const,
      label: 'Committed / Reserved',
      sublabel: 'Tiket procurement aktif',
      value: overview.totalCommitted,
      pct: (committed / allocated) * 100,
      ringPct: committedPct,
      color: '#6366f1', // Indigo 500
      trackBg: 'bg-indigo-500',
      badgeBg: 'bg-indigo-50 text-indigo-700 border-indigo-200/80',
      icon: Clock,
    },
    {
      key: 'remaining' as const,
      label: 'Remaining Available',
      sublabel: isOverBudget ? 'Melebihi batas anggaran!' : 'Sisa saldo tersedia',
      value: overview.totalRemaining,
      pct: (overview.totalRemaining / allocated) * 100,
      ringPct: remainingPct,
      color: isOverBudget ? '#ef4444' : '#0ea5e9', // Red / Sky 500
      trackBg: isOverBudget ? 'bg-rose-500' : 'bg-sky-500',
      badgeBg: isOverBudget
        ? 'bg-rose-50 text-rose-700 border-rose-200/80'
        : 'bg-sky-50 text-sky-700 border-sky-200/80',
      icon: AlertCircle,
    },
  ];

  // Akumulasi offset untuk masing-masing segmen Donut SVG
  let accumulatedPct = 0;
  const ringItems = segments.map((seg) => {
    const dashLength = (seg.ringPct / 100) * circumference;
    const dashOffset = -((accumulatedPct / 100) * circumference);
    accumulatedPct += seg.ringPct;
    return { ...seg, dashLength, dashOffset };
  });

  const activeItem = segments.find((s) => s.key === hoveredSegment);

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
      {/* KIRI: INTERACTIVE DONUT CHART */}
      <div className="flex flex-col justify-between rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs lg:col-span-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-700">
              <PieChartIcon size={17} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Budget Distribution
              </h3>
              <p className="text-[11px] text-slate-500">
                Fiscal Year {overview.fiscalYear}
              </p>
            </div>
          </div>

          <span
            className={`rounded-full border px-2.5 py-0.5 text-xs font-bold ${
              overview.overallUtilizationRate > 90
                ? 'border-rose-200 bg-rose-50 text-rose-700'
                : overview.overallUtilizationRate > 75
                  ? 'border-amber-200 bg-amber-50 text-amber-700'
                  : 'border-teal-200 bg-teal-50 text-teal-700'
            }`}
          >
            {overview.overallUtilizationRate}% Used
          </span>
        </div>

        {/* SVG Donut Ring */}
        <div className="relative my-4 flex items-center justify-center">
          <svg
            width={size}
            height={size}
            viewBox={`0 0 ${size} ${size}`}
            className="-rotate-90 overflow-visible"
          >
            {/* Base Track */}
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke="#f1f5f9"
              strokeWidth={strokeWidth}
            />

            {/* Segmen Data */}
            {ringItems.map((seg) => {
              if (seg.ringPct <= 0) return null;
              const isHovered = hoveredSegment === seg.key;
              const isDimmed = hoveredSegment !== null && !isHovered;

              return (
                <circle
                  key={seg.key}
                  cx={size / 2}
                  cy={size / 2}
                  r={radius}
                  fill="none"
                  stroke={seg.color}
                  strokeWidth={isHovered ? strokeWidth + 4 : strokeWidth}
                  strokeDasharray={`${Math.max(seg.dashLength - 2, 0)} ${circumference}`}
                  strokeDashoffset={seg.dashOffset}
                  strokeLinecap="round"
                  onMouseEnter={() => setHoveredSegment(seg.key)}
                  onMouseLeave={() => setHoveredSegment(null)}
                  className="cursor-pointer transition-all duration-300"
                  style={{ opacity: isDimmed ? 0.35 : 1 }}
                />
              );
            })}
          </svg>

          {/* Label Tengah Donut (Berubah dinamis saat segmen di-hover) */}
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center px-6 text-center">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              {activeItem ? activeItem.label.split(' ')[0] : 'Total Budget'}
            </span>
            <span className="mt-0.5 text-base font-extrabold tracking-tight text-slate-900">
              {activeItem
                ? formatCompactIDR(activeItem.value)
                : formatCompactIDR(overview.totalAllocated)}
            </span>
            <span className="mt-0.5 text-[11px] font-medium text-slate-500">
              {activeItem
                ? `${activeItem.pct.toFixed(1)}% of total`
                : '100% Allocated'}
            </span>
          </div>
        </div>

        {/* Mini Legend */}
        <div className="flex flex-wrap items-center justify-center gap-4 border-t border-slate-100 pt-3 text-xs">
          {segments.map((seg) => (
            <button
              key={seg.key}
              type="button"
              onMouseEnter={() => setHoveredSegment(seg.key)}
              onMouseLeave={() => setHoveredSegment(null)}
              className={`flex items-center gap-1.5 rounded-md px-1.5 py-0.5 transition-opacity ${
                hoveredSegment && hoveredSegment !== seg.key
                  ? 'opacity-45'
                  : 'opacity-100'
              }`}
            >
              <span className={`h-2.5 w-2.5 rounded-full ${seg.trackBg}`} />
              <span className="font-medium text-slate-600">
                {seg.label.split(' ')[0]}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* KANAN: HORIZONTAL BREAKDOWN BARS & TOTAL ALLOCATION HEADER */}
      <div className="flex flex-col justify-between rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs lg:col-span-7">
        {/* Header Total Allocated */}
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-100 bg-slate-50/80 px-4 py-3.5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-700 to-teal-600 text-white shadow-xs">
              <Wallet size={19} />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500">
                Total Budget Allocated ({overview.fiscalYear})
              </p>
              <p className="text-xl font-extrabold tracking-tight text-slate-900">
                {formatIDR(overview.totalAllocated)}
              </p>
            </div>
          </div>

          {/* Stacked Multi-Segment Progress Bar */}
          <div className="w-full sm:w-44">
            <div className="mb-1 flex justify-between text-[11px] font-semibold text-slate-600">
              <span>Utilization</span>
              <span>{overview.overallUtilizationRate}%</span>
            </div>
            <div className="flex h-2.5 w-full overflow-hidden rounded-full bg-slate-200/80">
              <div
                style={{ width: `${Math.min(spentPct, 100)}%` }}
                className="bg-emerald-500 transition-all duration-500"
                title={`Spent: ${formatIDR(overview.totalSpent)}`}
              />
              <div
                style={{
                  width: `${Math.min(committedPct, Math.max(0, 100 - spentPct))}%`,
                }}
                className="bg-indigo-500 transition-all duration-500"
                title={`Committed: ${formatIDR(overview.totalCommitted)}`}
              />
            </div>
          </div>
        </div>

        {/* Bar Rincian Tiap Kategori */}
        <div className="mt-5 space-y-4">
          {segments.map((seg) => {
            const Icon = seg.icon;
            const isHovered = hoveredSegment === seg.key;

            return (
              <div
                key={seg.key}
                onMouseEnter={() => setHoveredSegment(seg.key)}
                onMouseLeave={() => setHoveredSegment(null)}
                className={`cursor-pointer rounded-xl border p-3.5 transition-all duration-200 ${
                  isHovered
                    ? 'border-slate-300 bg-slate-50/90 shadow-xs'
                    : 'border-slate-100 bg-white hover:border-slate-200'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <span
                      className={`flex h-8 w-8 items-center justify-center rounded-lg border ${seg.badgeBg}`}
                    >
                      <Icon size={16} />
                    </span>
                    <div>
                      <p className="text-xs font-bold text-slate-800">
                        {seg.label}
                      </p>
                      <p className="text-[11px] text-slate-400">
                        {seg.sublabel}
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="text-sm font-bold text-slate-900">
                      {formatIDR(seg.value)}
                    </p>
                    <p className="text-[11px] font-semibold text-slate-500">
                      {seg.pct.toFixed(1)}%
                    </p>
                  </div>
                </div>

                {/* Progress Bar Kategori */}
                <div className="mt-2.5 h-2 w-full overflow-hidden rounded-full bg-slate-100">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${seg.trackBg}`}
                    style={{
                      width: `${Math.min(Math.max(seg.pct, 0), 100)}%`,
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
import {
  BarChart3,
  Building2,
  SlidersHorizontal,
} from 'lucide-react';
import type { DepartmentBudget } from '../types/finance.types';
import { formatCompactIDR, formatIDR } from './BudgetOverviewCards';

interface DepartmentBudgetTableProps {
  budgets: DepartmentBudget[];
  isLoading: boolean;
  onAdjust: (budget: DepartmentBudget) => void;
}

export default function DepartmentBudgetTable({
  budgets,
  isLoading,
  onAdjust,
}: DepartmentBudgetTableProps) {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'exceeded':
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-rose-200/80 bg-rose-50 px-2 py-0.5 text-[10px] font-semibold text-rose-700">
            <span className="h-1.5 w-1.5 rounded-full bg-rose-500" />
            Over Budget
          </span>
        );
      case 'critical':
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-rose-200/80 bg-rose-50 px-2 py-0.5 text-[10px] font-semibold text-rose-600">
            <span className="h-1.5 w-1.5 rounded-full bg-rose-500" />
            Critical (&lt;10%)
          </span>
        );
      case 'warning':
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-200/80 bg-amber-50 px-2 py-0.5 text-[10px] font-semibold text-amber-700">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
            Warning (&lt;20%)
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200/80 bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            Normal
          </span>
        );
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4 rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs">
        <div className="h-5 w-48 animate-pulse rounded bg-slate-200" />
        <div className="space-y-3 pt-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="space-y-2 animate-pulse">
              <div className="flex justify-between">
                <div className="h-4 w-36 rounded bg-slate-200" />
                <div className="h-4 w-28 rounded bg-slate-200" />
              </div>
              <div className="h-2.5 w-full rounded-full bg-slate-100" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (budgets.length === 0) {
    return (
      <div className="rounded-2xl border border-slate-200/80 bg-white py-12 text-center text-xs text-slate-400 shadow-xs">
        <Building2 size={32} className="mx-auto mb-2 text-slate-300" />
        No department budgets found for the selected filter.
      </div>
    );
  }

  const maxAllocated = Math.max(
    ...budgets.map((b) =>
      Math.max(b.allocatedBudget, b.spentBudget + b.committedBudget)
    ),
    1
  );

  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs sm:p-6">
      {/* Header Chart */}
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-slate-700">
            <BarChart3 size={16} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Department Budget Comparison
            </h3>
            <p className="text-[11px] text-slate-400">
              Perbandingan alokasi, realisasi, dan sisa anggaran tiap departemen
            </p>
          </div>
        </div>

        {/* Minimal Legend */}
        <div className="flex flex-wrap items-center gap-4 text-[11px] font-medium text-slate-500">
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            Realized
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-indigo-500" />
            Committed
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-slate-200" />
            Allocated Limit
          </span>
        </div>
      </div>

      {/* Interactive Bars + Inline Actions */}
      <div className="space-y-3">
        {budgets.map((b) => {
          const allocWidth = (b.allocatedBudget / maxAllocated) * 100;
          const spentWidth = (b.spentBudget / maxAllocated) * 100;
          const committedWidth = (b.committedBudget / maxAllocated) * 100;

          return (
            <div
              key={b.id}
              className="group rounded-xl border border-slate-100/80 bg-slate-50/40 px-4 py-3 transition-colors hover:border-slate-200 hover:bg-slate-50"
            >
              <div className="mb-2 flex flex-wrap items-center justify-between gap-2 text-xs">
                {/* Identitas Departemen & Status */}
                <div className="flex items-center gap-2.5">
                  <span className="flex h-7 w-9 shrink-0 items-center justify-center rounded-md border border-slate-200/80 bg-white font-mono text-[10px] font-bold text-slate-700">
                    {b.departmentCode}
                  </span>
                  <span className="font-bold text-slate-900">
                    {b.departmentName}
                  </span>
                  {getStatusBadge(b.status)}
                </div>

                {/* Angka Ringkasan & Tombol Adjust */}
                <div className="flex flex-wrap items-center gap-3 text-[11px]">
                  <span className="text-slate-500">
                    Used:{' '}
                    <strong className="text-slate-800">
                      {formatCompactIDR(b.spentBudget + b.committedBudget)}
                    </strong>{' '}
                    / {formatCompactIDR(b.allocatedBudget)}
                  </span>

                  <span className="hidden text-slate-300 sm:inline">•</span>

                  <span className="hidden text-slate-500 sm:inline">
                    Remaining:{' '}
                    <strong
                      className={
                        b.remainingBudget < 0
                          ? 'text-rose-600'
                          : 'text-slate-800'
                      }
                    >
                      {formatIDR(b.remainingBudget)}
                    </strong>
                  </span>

                  <span
                    className={`w-11 text-right font-bold ${
                      b.utilizationRate > 90
                        ? 'text-rose-600'
                        : b.utilizationRate > 75
                          ? 'text-amber-600'
                          : 'text-teal-700'
                    }`}
                  >
                    {b.utilizationRate}%
                  </span>

                  <button
                    type="button"
                    onClick={() => onAdjust(b)}
                    className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-semibold text-slate-600 shadow-2xs transition-colors hover:border-slate-300 hover:bg-slate-50 hover:text-blue-700"
                  >
                    <SlidersHorizontal size={11} />
                    <span>Adjust</span>
                  </button>
                </div>
              </div>

              {/* Relative Comparison Bar */}
              <div className="relative h-2.5 w-full rounded-full bg-slate-100">
                <div
                  className="absolute inset-y-0 left-0 rounded-full bg-slate-200/90 transition-all duration-500"
                  style={{ width: `${Math.min(allocWidth, 100)}%` }}
                />
                <div
                  className="absolute inset-y-0 left-0 rounded-l-full bg-emerald-500 transition-all duration-500"
                  style={{ width: `${Math.min(spentWidth, 100)}%` }}
                />
                <div
                  className="absolute inset-y-0 rounded-r-full bg-indigo-500 transition-all duration-500"
                  style={{
                    left: `${Math.min(spentWidth, 100)}%`,
                    width: `${Math.min(
                      committedWidth,
                      Math.max(0, 100 - spentWidth)
                    )}%`,
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
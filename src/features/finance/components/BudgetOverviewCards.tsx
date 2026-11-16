import { Wallet, TrendingUp, Clock, AlertCircle } from 'lucide-react';
import type { BudgetOverview } from '../types/finance.types';

export function formatIDR(value: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(value);
}

interface BudgetOverviewCardsProps {
  overview: BudgetOverview | null;
  isLoading: boolean;
}

export default function BudgetOverviewCards({
  overview,
  isLoading,
}: BudgetOverviewCardsProps) {
  if (isLoading || !overview) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="h-28 rounded-2xl border border-slate-100 bg-white p-5 shadow-xs animate-pulse"
          >
            <div className="h-4 w-24 rounded bg-slate-200" />
            <div className="mt-3 h-7 w-36 rounded bg-slate-200" />
          </div>
        ))}
      </div>
    );
  }

  const cards = [
    {
      title: 'Total Budget Allocated',
      value: formatIDR(overview.totalAllocated),
      subtitle: `Fiscal Year ${overview.fiscalYear}`,
      icon: Wallet,
      iconBg: 'bg-blue-50 text-blue-600',
    },
    {
      title: 'Realized Expenditure',
      value: formatIDR(overview.totalSpent),
      subtitle: `${((overview.totalSpent / (overview.totalAllocated || 1)) * 100).toFixed(1)}% of total allocation`,
      icon: TrendingUp,
      iconBg: 'bg-emerald-50 text-emerald-600',
    },
    {
      title: 'Committed / Reserved',
      value: formatIDR(overview.totalCommitted),
      subtitle: 'Active procurement tickets',
      icon: Clock,
      iconBg: 'bg-purple-50 text-purple-600',
    },
    {
      title: 'Remaining Available',
      value: formatIDR(overview.totalRemaining),
      subtitle: `Overall utilization: ${overview.overallUtilizationRate}%`,
      icon: AlertCircle,
      iconBg:
        overview.totalRemaining < 0
          ? 'bg-red-50 text-red-600'
          : 'bg-amber-50 text-amber-600',
    },
  ];

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((card, index) => {
          const Icon = card.icon;
          return (
            <div
              key={index}
              className="rounded-2xl border border-slate-100 bg-white p-5 shadow-xs transition hover:shadow-md"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500">
                  {card.title}
                </span>
                <div
                  className={`flex h-9 w-9 items-center justify-center rounded-xl ${card.iconBg}`}
                >
                  <Icon size={18} />
                </div>
              </div>
              <p className="mt-2 text-xl font-bold tracking-tight text-slate-900">
                {card.value}
              </p>
              <p className="mt-1 text-xs text-slate-400">{card.subtitle}</p>
            </div>
          );
        })}
      </div>

      {/* OVERALL UTILIZATION BAR */}
      <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-xs">
        <div className="flex items-center justify-between text-xs">
          <span className="font-semibold text-slate-700">
            Company Budget Utilization Progress ({overview.fiscalYear})
          </span>
          <span className="font-bold text-slate-900">
            {overview.overallUtilizationRate}% Utilized
          </span>
        </div>
        <div className="mt-2 h-2.5 w-full overflow-hidden rounded-full bg-slate-100">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              overview.overallUtilizationRate > 90
                ? 'bg-red-500'
                : overview.overallUtilizationRate > 75
                ? 'bg-amber-500'
                : 'bg-blue-600'
            }`}
            style={{ width: `${Math.min(overview.overallUtilizationRate, 100)}%` }}
          />
        </div>
      </div>
    </div>
  );
}

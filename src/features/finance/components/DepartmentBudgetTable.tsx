import { Building2, SlidersHorizontal } from 'lucide-react';
import type { DepartmentBudget } from '../types/finance.types';
import { formatIDR } from './BudgetOverviewCards';

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
          <span className="inline-flex items-center rounded-full bg-red-50 px-2.5 py-1 text-xs font-bold text-red-700 border border-red-200">
            Over Budget
          </span>
        );
      case 'critical':
        return (
          <span className="inline-flex items-center rounded-full bg-red-50 px-2.5 py-1 text-xs font-bold text-red-600 border border-red-200">
            Critical (&lt;10%)
          </span>
        );
      case 'warning':
        return (
          <span className="inline-flex items-center rounded-full bg-amber-50 px-2.5 py-1 text-xs font-bold text-amber-700 border border-amber-200">
            Warning (&lt;20%)
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700 border border-emerald-200">
            Normal
          </span>
        );
    }
  };

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-xs">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left text-xs">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50/75 text-slate-500 font-semibold">
              <th className="px-5 py-4">Department</th>
              <th className="px-5 py-4 text-right">Allocated</th>
              <th className="px-5 py-4 text-right">Realized (Spent)</th>
              <th className="px-5 py-4 text-right">Committed</th>
              <th className="px-5 py-4 text-right">Remaining Balance</th>
              <th className="px-5 py-4">Utilization</th>
              <th className="px-5 py-4 text-center">Status</th>
              <th className="px-5 py-4 text-center">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} className="animate-pulse">
                  <td className="px-5 py-4">
                    <div className="h-4 w-32 rounded bg-slate-200" />
                  </td>
                  <td className="px-5 py-4 text-right">
                    <div className="ml-auto h-4 w-20 rounded bg-slate-200" />
                  </td>
                  <td className="px-5 py-4 text-right">
                    <div className="ml-auto h-4 w-20 rounded bg-slate-200" />
                  </td>
                  <td className="px-5 py-4 text-right">
                    <div className="ml-auto h-4 w-20 rounded bg-slate-200" />
                  </td>
                  <td className="px-5 py-4 text-right">
                    <div className="ml-auto h-4 w-20 rounded bg-slate-200" />
                  </td>
                  <td className="px-5 py-4">
                    <div className="h-4 w-24 rounded bg-slate-200" />
                  </td>
                  <td className="px-5 py-4 text-center">
                    <div className="mx-auto h-5 w-16 rounded bg-slate-200" />
                  </td>
                  <td className="px-5 py-4 text-center">
                    <div className="mx-auto h-6 w-16 rounded bg-slate-200" />
                  </td>
                </tr>
              ))
            ) : budgets.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-12 text-center text-slate-400">
                  <Building2 size={32} className="mx-auto mb-2 text-slate-300" />
                  No department budgets found for the selected filter.
                </td>
              </tr>
            ) : (
              budgets.map((b) => (
                <tr
                  key={b.id}
                  className="transition hover:bg-slate-50/70"
                >
                  {/* DEPARTMENT */}
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-600 font-bold text-xs">
                        {b.departmentCode.slice(0, 3)}
                      </div>
                      <div>
                        <p className="font-bold text-slate-900">{b.departmentName}</p>
                        <p className="text-[11px] text-slate-400">{b.departmentCode}</p>
                      </div>
                    </div>
                  </td>

                  {/* ALLOCATED */}
                  <td className="px-5 py-4 text-right font-semibold text-slate-800">
                    {formatIDR(b.allocatedBudget)}
                  </td>

                  {/* SPENT */}
                  <td className="px-5 py-4 text-right font-medium text-emerald-600">
                    {formatIDR(b.spentBudget)}
                  </td>

                  {/* COMMITTED */}
                  <td className="px-5 py-4 text-right font-medium text-purple-600">
                    {formatIDR(b.committedBudget)}
                  </td>

                  {/* REMAINING */}
                  <td className="px-5 py-4 text-right">
                    <span
                      className={`font-bold ${
                        b.remainingBudget < 0
                          ? 'text-red-600'
                          : b.status === 'critical'
                          ? 'text-red-500'
                          : b.status === 'warning'
                          ? 'text-amber-600'
                          : 'text-slate-900'
                      }`}
                    >
                      {formatIDR(b.remainingBudget)}
                    </span>
                  </td>

                  {/* UTILIZATION BAR */}
                  <td className="px-5 py-4 min-w-[140px]">
                    <div className="flex items-center justify-between text-[11px] mb-1 font-semibold text-slate-600">
                      <span>{b.utilizationRate}%</span>
                    </div>
                    <div className="h-1.5 w-full rounded-full bg-slate-100 overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          b.utilizationRate > 90
                            ? 'bg-red-500'
                            : b.utilizationRate > 75
                            ? 'bg-amber-500'
                            : 'bg-blue-600'
                        }`}
                        style={{ width: `${Math.min(b.utilizationRate, 100)}%` }}
                      />
                    </div>
                  </td>

                  {/* STATUS */}
                  <td className="px-5 py-4 text-center">
                    {getStatusBadge(b.status)}
                  </td>

                  {/* ACTION */}
                  <td className="px-5 py-4 text-center">
                    <button
                      type="button"
                      onClick={() => onAdjust(b)}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-2xs transition hover:bg-slate-50 hover:text-blue-600"
                    >
                      <SlidersHorizontal size={13} />
                      <span>Adjust</span>
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

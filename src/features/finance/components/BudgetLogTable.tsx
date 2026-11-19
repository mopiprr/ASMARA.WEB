import {
  Activity,
  ArrowDownLeft,
  ArrowUpRight,
  ChevronLeft,
  ChevronRight,
  Clock,
  FileText,
  History,
} from 'lucide-react';
import type { BudgetLog } from '../types/finance.types';
import { formatCompactIDR, formatIDR } from './BudgetOverviewCards';

interface BudgetLogTableProps {
  logs: BudgetLog[];
  isLoading: boolean;
  totalCount: number;
  currentPage: number;
  pageSize: number;
  onPageChange: (page: number) => void;
}

export default function BudgetLogTable({
  logs,
  isLoading,
  totalCount,
  currentPage,
  pageSize,
  onPageChange,
}: BudgetLogTableProps) {
  const totalPages = Math.ceil(totalCount / pageSize) || 1;

  const getChangeTypeBadge = (changeType: number, name: string) => {
    switch (changeType) {
      case 1: // TicketCommitment
        return (
          <span className="inline-flex items-center gap-1 rounded-full border border-indigo-200/80 bg-indigo-50 px-2.5 py-0.5 text-[11px] font-semibold text-indigo-700">
            <Clock size={11} />
            Commitment
          </span>
        );
      case 2: // TicketRealization
        return (
          <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200/80 bg-emerald-50 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-700">
            <ArrowUpRight size={11} />
            Realized Expense
          </span>
        );
      case 3: // TicketRelease
        return (
          <span className="inline-flex items-center gap-1 rounded-full border border-amber-200/80 bg-amber-50 px-2.5 py-0.5 text-[11px] font-semibold text-amber-700">
            <ArrowDownLeft size={11} />
            Released
          </span>
        );
      case 4: // AllocationIncrease
        return (
          <span className="inline-flex items-center gap-1 rounded-full border border-sky-200/80 bg-sky-50 px-2.5 py-0.5 text-[11px] font-semibold text-sky-700">
            <ArrowDownLeft size={11} />
            Allocation +
          </span>
        );
      case 5: // AllocationDecrease
        return (
          <span className="inline-flex items-center gap-1 rounded-full border border-rose-200/80 bg-rose-50 px-2.5 py-0.5 text-[11px] font-semibold text-rose-700">
            <ArrowUpRight size={11} />
            Allocation -
          </span>
        );
      case 6: // TransferIn
        return (
          <span className="inline-flex items-center gap-1 rounded-full border border-teal-200/80 bg-teal-50 px-2.5 py-0.5 text-[11px] font-semibold text-teal-700">
            <ArrowDownLeft size={11} />
            Transfer In
          </span>
        );
      case 7: // TransferOut
        return (
          <span className="inline-flex items-center gap-1 rounded-full border border-orange-200/80 bg-orange-50 px-2.5 py-0.5 text-[11px] font-semibold text-orange-700">
            <ArrowUpRight size={11} />
            Transfer Out
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-2.5 py-0.5 text-[11px] font-semibold text-slate-700">
            {name}
          </span>
        );
    }
  };

  // Ringkasan proporsi aktivitas transaksi pada halaman aktif
  const realizedSum = logs
    .filter((l) => l.changeType === 2)
    .reduce((acc, l) => acc + Math.abs(l.amount), 0);
  const commitmentSum = logs
    .filter((l) => l.changeType === 1 || l.changeType === 3)
    .reduce((acc, l) => acc + Math.abs(l.amount), 0);
  const adjustmentSum = logs
    .filter((l) => [4, 5, 6, 7].includes(l.changeType))
    .reduce((acc, l) => acc + Math.abs(l.amount), 0);

  const totalVolume = Math.max(realizedSum + commitmentSum + adjustmentSum, 1);
  const realizedPct = (realizedSum / totalVolume) * 100;
  const commitmentPct = (commitmentSum / totalVolume) * 100;
  const adjustmentPct = (adjustmentSum / totalVolume) * 100;

  return (
    <div className="space-y-4">
      {/* ACTIVITY MIX STRIP (Ringkasan visual arus transaksi halaman ini) */}
      {!isLoading && logs.length > 0 && (
        <div className="rounded-2xl border border-slate-200/80 bg-white px-5 py-4 shadow-xs">
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2">
              <Activity size={15} className="text-teal-600" />
              <span className="font-bold text-slate-800">
                Transaction Activity Mix
              </span>
              <span className="text-[11px] text-slate-400">
                ({logs.length} entries shown)
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-4 text-[11px] text-slate-600">
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                Realization:{' '}
                <strong className="text-slate-900">
                  {formatCompactIDR(realizedSum)}
                </strong>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-indigo-500" />
                Commitment:{' '}
                <strong className="text-slate-900">
                  {formatCompactIDR(commitmentSum)}
                </strong>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-sky-500" />
                Allocations/Transfers:{' '}
                <strong className="text-slate-900">
                  {formatCompactIDR(adjustmentSum)}
                </strong>
              </span>
            </div>
          </div>

          {/* Segmented Bar Tipis */}
          <div className="mt-3 flex h-2 w-full overflow-hidden rounded-full bg-slate-100">
            {realizedPct > 0 && (
              <div
                style={{ width: `${realizedPct}%` }}
                className="bg-emerald-500 transition-all duration-500"
              />
            )}
            {commitmentPct > 0 && (
              <div
                style={{ width: `${commitmentPct}%` }}
                className="bg-indigo-500 transition-all duration-500"
              />
            )}
            {adjustmentPct > 0 && (
              <div
                style={{ width: `${adjustmentPct}%` }}
                className="bg-sky-500 transition-all duration-500"
              />
            )}
          </div>
        </div>
      )}

      {/* CLEANIST LOG TABLE */}
      <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/60 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                <th className="px-5 py-3.5">Log # / Date</th>
                <th className="px-5 py-3.5">Department</th>
                <th className="px-5 py-3.5">Event Type</th>
                <th className="px-5 py-3.5">Reference</th>
                <th className="px-5 py-3.5 text-right">Amount</th>
                <th className="px-5 py-3.5">Description</th>
                <th className="px-5 py-3.5">Executed By</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="px-5 py-4">
                      <div className="h-4 w-28 rounded bg-slate-200" />
                    </td>
                    <td className="px-5 py-4">
                      <div className="h-4 w-24 rounded bg-slate-200" />
                    </td>
                    <td className="px-5 py-4">
                      <div className="h-5 w-24 rounded bg-slate-200" />
                    </td>
                    <td className="px-5 py-4">
                      <div className="h-4 w-20 rounded bg-slate-200" />
                    </td>
                    <td className="px-5 py-4 text-right">
                      <div className="ml-auto h-4 w-20 rounded bg-slate-200" />
                    </td>
                    <td className="px-5 py-4">
                      <div className="h-4 w-40 rounded bg-slate-200" />
                    </td>
                    <td className="px-5 py-4">
                      <div className="h-4 w-24 rounded bg-slate-200" />
                    </td>
                  </tr>
                ))
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <History size={32} className="mx-auto mb-2 text-slate-300" />
                    No budget logs or transactions recorded yet.
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr
                    key={log.id}
                    className="transition-colors hover:bg-slate-50/70"
                  >
                    {/* LOG NUMBER & DATE */}
                    <td className="px-5 py-3.5">
                      <p className="font-mono font-semibold text-slate-900">
                        {log.logNumber}
                      </p>
                      <p className="text-[11px] text-slate-400">
                        {new Date(log.createdAt).toLocaleString('id-ID')}
                      </p>
                    </td>

                    {/* DEPARTMENT */}
                    <td className="px-5 py-3.5">
                      <p className="font-semibold text-slate-800">
                        {log.departmentName}
                      </p>
                      {log.relatedDepartmentName && (
                        <p className="text-[11px] font-medium text-indigo-600">
                          ↔ {log.relatedDepartmentName}
                        </p>
                      )}
                    </td>

                    {/* EVENT TYPE */}
                    <td className="whitespace-nowrap px-5 py-3.5">
                      {getChangeTypeBadge(log.changeType, log.changeTypeName)}
                    </td>

                    {/* TICKET / REFERENCE */}
                    <td className="px-5 py-3.5">
                      {log.ticketNumber ? (
                        <span className="inline-flex items-center gap-1 rounded-md border border-slate-200/80 bg-slate-50 px-2 py-0.5 font-mono text-[11px] font-medium text-slate-700">
                          <FileText size={11} className="text-blue-600" />
                          {log.ticketNumber}
                        </span>
                      ) : (
                        <span className="text-[11px] italic text-slate-400">
                          Manual Adjustment
                        </span>
                      )}
                    </td>

                    {/* AMOUNT */}
                    <td className="whitespace-nowrap px-5 py-3.5 text-right font-bold text-slate-900">
                      {formatIDR(log.amount)}
                    </td>

                    {/* DESCRIPTION */}
                    <td className="max-w-xs px-5 py-3.5">
                      <p className="line-clamp-2 text-xs text-slate-600">
                        {log.description}
                      </p>
                    </td>

                    {/* ACTOR */}
                    <td className="whitespace-nowrap px-5 py-3.5 text-slate-500">
                      {log.createdByName || 'System'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* PAGINATION BAR */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50/50 px-5 py-3 text-xs text-slate-500">
            <span>
              Showing {(currentPage - 1) * pageSize + 1} to{' '}
              {Math.min(currentPage * pageSize, totalCount)} of {totalCount} logs
            </span>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                disabled={currentPage <= 1 || isLoading}
                onClick={() => onPageChange(currentPage - 1)}
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50 disabled:opacity-40"
              >
                <ChevronLeft size={15} />
              </button>
              <span className="px-2 font-semibold text-slate-700">
                {currentPage} / {totalPages}
              </span>
              <button
                type="button"
                disabled={currentPage >= totalPages || isLoading}
                onClick={() => onPageChange(currentPage + 1)}
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50 disabled:opacity-40"
              >
                <ChevronRight size={15} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
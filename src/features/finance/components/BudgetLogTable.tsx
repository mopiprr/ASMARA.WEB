import { History, ChevronLeft, ChevronRight, FileText } from 'lucide-react';
import type { BudgetLog } from '../types/finance.types';
import { formatIDR } from './BudgetOverviewCards';

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
          <span className="inline-flex items-center rounded-full bg-purple-50 px-2 py-0.5 text-[11px] font-bold text-purple-700 border border-purple-200">
            Commitment (Ticket)
          </span>
        );
      case 2: // TicketRealization
        return (
          <span className="inline-flex items-center rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-bold text-emerald-700 border border-emerald-200">
            Realized Expense
          </span>
        );
      case 3: // TicketRelease
        return (
          <span className="inline-flex items-center rounded-full bg-amber-50 px-2 py-0.5 text-[11px] font-bold text-amber-700 border border-amber-200">
            Commitment Released
          </span>
        );
      case 4: // AllocationIncrease
        return (
          <span className="inline-flex items-center rounded-full bg-blue-50 px-2 py-0.5 text-[11px] font-bold text-blue-700 border border-blue-200">
            Allocation Increase
          </span>
        );
      case 5: // AllocationDecrease
        return (
          <span className="inline-flex items-center rounded-full bg-red-50 px-2 py-0.5 text-[11px] font-bold text-red-700 border border-red-200">
            Allocation Cut
          </span>
        );
      case 6: // TransferIn
        return (
          <span className="inline-flex items-center rounded-full bg-indigo-50 px-2 py-0.5 text-[11px] font-bold text-indigo-700 border border-indigo-200">
            Transfer In
          </span>
        );
      case 7: // TransferOut
        return (
          <span className="inline-flex items-center rounded-full bg-orange-50 px-2 py-0.5 text-[11px] font-bold text-orange-700 border border-orange-200">
            Transfer Out
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center rounded-full bg-slate-50 px-2 py-0.5 text-[11px] font-bold text-slate-700 border border-slate-200">
            {name}
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
              <th className="px-5 py-3.5">Log # / Date</th>
              <th className="px-5 py-3.5">Department</th>
              <th className="px-5 py-3.5">Event Type</th>
              <th className="px-5 py-3.5">Ticket / Source</th>
              <th className="px-5 py-3.5 text-right">Amount</th>
              <th className="px-5 py-3.5">Description & Reason</th>
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
                <tr key={log.id} className="transition hover:bg-slate-50/70">
                  {/* LOG NUMBER & DATE */}
                  <td className="px-5 py-3.5">
                    <p className="font-mono font-bold text-slate-900">{log.logNumber}</p>
                    <p className="text-[11px] text-slate-400">
                      {new Date(log.createdAt).toLocaleString('id-ID')}
                    </p>
                  </td>

                  {/* DEPARTMENT */}
                  <td className="px-5 py-3.5">
                    <p className="font-semibold text-slate-800">{log.departmentName}</p>
                    {log.relatedDepartmentName && (
                      <p className="text-[11px] text-purple-600 font-medium">
                        Target/Source: {log.relatedDepartmentName}
                      </p>
                    )}
                  </td>

                  {/* EVENT TYPE */}
                  <td className="px-5 py-3.5 whitespace-nowrap">
                    {getChangeTypeBadge(log.changeType, log.changeTypeName)}
                  </td>

                  {/* TICKET / REFERENCE */}
                  <td className="px-5 py-3.5">
                    {log.ticketNumber ? (
                      <span className="inline-flex items-center gap-1 font-mono text-[11px] font-semibold text-blue-600">
                        <FileText size={11} />
                        {log.ticketNumber}
                      </span>
                    ) : (
                      <span className="text-[11px] text-slate-400 italic">
                        Manual Adjustment
                      </span>
                    )}
                  </td>

                  {/* AMOUNT */}
                  <td className="px-5 py-3.5 text-right font-bold text-slate-900 whitespace-nowrap">
                    {formatIDR(log.amount)}
                  </td>

                  {/* DESCRIPTION */}
                  <td className="px-5 py-3.5 max-w-xs">
                    <p className="text-slate-700 text-xs line-clamp-2">
                      {log.description}
                    </p>
                  </td>

                  {/* ACTOR */}
                  <td className="px-5 py-3.5 text-slate-600 whitespace-nowrap">
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
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40 transition"
            >
              <ChevronLeft size={15} />
            </button>
            <span className="px-2 font-bold text-slate-700">
              {currentPage} / {totalPages}
            </span>
            <button
              type="button"
              disabled={currentPage >= totalPages || isLoading}
              onClick={() => onPageChange(currentPage + 1)}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40 transition"
            >
              <ChevronRight size={15} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

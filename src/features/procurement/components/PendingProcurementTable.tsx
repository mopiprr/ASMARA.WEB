import {
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Eye,
  RefreshCw,
  Search,
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  RotateCcw,
  Clock,
} from 'lucide-react';

import type { PendingProcurementTicket } from '../types/procurement.types';
import type { PendingSortField } from '../hooks/usePendingProcurementTickets';

interface PendingProcurementTableProps {
  tickets: PendingProcurementTicket[];
  isLoading: boolean;
  error: string;
  search: string;
  onSearchChange: (value: string) => void;
  sortBy: PendingSortField;
  desc: boolean;
  onSort: (field: PendingSortField) => void;
  page: number;
  totalPages: number;
  totalCount: number;
  onPageChange: (page: number) => void;
  onRefresh: () => void;
  onView: (ticket: PendingProcurementTicket) => void;
  isLoadingDetail?: boolean;
}

function PendingProcurementTable({
  tickets,
  isLoading,
  error,
  search,
  onSearchChange,
  sortBy,
  desc,
  onSort,
  page,
  totalPages,
  totalCount,
  onPageChange,
  onRefresh,
  onView,
  isLoadingDetail = false,
}: PendingProcurementTableProps) {
  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const renderSortIcon = (field: PendingSortField) => {
    if (sortBy !== field) {
      return (
        <ArrowUpDown
          size={13}
          className="text-slate-300 transition group-hover:text-slate-500"
        />
      );
    }
    return desc ? (
      <ArrowDown size={13} className="text-blue-600" />
    ) : (
      <ArrowUp size={13} className="text-blue-600" />
    );
  };

  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      {/* TABLE HEADER & FILTER BAR */}
      <div className="border-b border-slate-100 p-5">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
            <div>
              <h2 className="text-lg font-bold text-slate-800">
                Pending Approval
              </h2>
              <p className="text-xs text-slate-500">
                Procurement tickets that require your review and action.
              </p>
            </div>

            {search && (
              <button
                type="button"
                onClick={() => onSearchChange('')}
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:bg-slate-50"
              >
                <RotateCcw size={13} />
                <span>Clear Search</span>
              </button>
            )}
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            {/* SEARCH */}
            <div className="relative flex-1">
              <Search
                size={16}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                type="text"
                value={search}
                onChange={(event) => onSearchChange(event.target.value)}
                placeholder="Search ticket number, subject, requester..."
                className="w-full rounded-xl border border-slate-200 bg-slate-50/60 py-2.5 pl-10 pr-4 text-xs font-medium text-slate-800 placeholder-slate-400 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
              />
            </div>

            {/* REFRESH */}
            <button
              type="button"
              onClick={onRefresh}
              disabled={isLoading}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold text-slate-700 shadow-2xs transition hover:bg-slate-50 disabled:opacity-50"
            >
              <RefreshCw
                size={15}
                className={isLoading ? 'animate-spin text-blue-600' : 'text-slate-500'}
              />
              <span>Refresh</span>
            </button>
          </div>
        </div>
      </div>

      {/* ERROR */}
      {error && (
        <div className="m-5 flex items-center justify-between rounded-xl border border-rose-200 bg-rose-50 p-4 text-xs text-rose-800">
          <div className="flex items-center gap-2">
            <AlertCircle size={16} className="text-rose-600" />
            <span>{error}</span>
          </div>
          <button
            type="button"
            onClick={onRefresh}
            className="rounded-lg bg-rose-600 px-3 py-1 font-semibold text-white transition hover:bg-rose-700"
          >
            Try Again
          </button>
        </div>
      )}

      {/* TABLE */}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[850px] text-left text-xs">
          <thead className="border-b border-slate-100 bg-slate-50 font-semibold uppercase tracking-wider text-slate-500">
            <tr>
              {/* TICKET NUMBER */}
              <th
                onClick={() => onSort('ticketNumber')}
                className="group cursor-pointer select-none px-6 py-3.5 transition hover:bg-slate-100/70"
                title="Click to sort by Ticket Number"
              >
                <div className="flex items-center gap-1.5">
                  <span className={sortBy === 'ticketNumber' ? 'font-bold text-blue-600' : ''}>
                    Ticket #
                  </span>
                  {renderSortIcon('ticketNumber')}
                </div>
              </th>

              {/* SUBJECT */}
              <th
                onClick={() => onSort('subject')}
                className="group cursor-pointer select-none px-6 py-3.5 transition hover:bg-slate-100/70"
                title="Click to sort by Subject"
              >
                <div className="flex items-center gap-1.5">
                  <span className={sortBy === 'subject' ? 'font-bold text-blue-600' : ''}>
                    Subject
                  </span>
                  {renderSortIcon('subject')}
                </div>
              </th>

              {/* REQUESTER */}
              <th
                onClick={() => onSort('requester')}
                className="group cursor-pointer select-none px-6 py-3.5 transition hover:bg-slate-100/70"
                title="Click to sort by Requester"
              >
                <div className="flex items-center gap-1.5">
                  <span className={sortBy === 'requester' ? 'font-bold text-blue-600' : ''}>
                    Requester
                  </span>
                  {renderSortIcon('requester')}
                </div>
              </th>

              {/* CREATED DATE */}
              <th
                onClick={() => onSort('date')}
                className="group cursor-pointer select-none px-6 py-3.5 transition hover:bg-slate-100/70"
                title="Click to sort by Date"
              >
                <div className="flex items-center gap-1.5">
                  <span className={sortBy === 'date' ? 'font-bold text-blue-600' : ''}>
                    Created Date
                  </span>
                  {renderSortIcon('date')}
                </div>
              </th>

              {/* CURRENT STEP */}
              <th className="px-6 py-3.5 font-semibold">
                Current Step
              </th>

              {/* ACTION */}
              <th className="px-6 py-3.5 text-right font-semibold">
                Action
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100 text-slate-700">
            {/* LOADING SKELETON */}
            {isLoading ? (
              Array.from({ length: 5 }).map((_, idx) => (
                <tr key={idx} className="animate-pulse">
                  <td className="px-6 py-4">
                    <div className="h-4 w-28 rounded bg-slate-200" />
                  </td>
                  <td className="px-6 py-4">
                    <div className="h-4 w-44 rounded bg-slate-200" />
                  </td>
                  <td className="px-6 py-4">
                    <div className="h-4 w-28 rounded bg-slate-200" />
                  </td>
                  <td className="px-6 py-4">
                    <div className="h-4 w-24 rounded bg-slate-200" />
                  </td>
                  <td className="px-6 py-4">
                    <div className="h-5 w-24 rounded bg-slate-200" />
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="ml-auto h-7 w-16 rounded bg-slate-200" />
                  </td>
                </tr>
              ))
            ) : tickets.length === 0 ? (
              /* EMPTY STATE */
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center">
                  <div className="flex flex-col items-center justify-center">
                    <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                      <Clock size={24} />
                    </div>
                    <p className="text-sm font-semibold text-slate-700">
                      {search ? 'No matching tickets found' : 'No pending procurement tickets'}
                    </p>
                    <p className="mt-1 max-w-sm text-xs text-slate-400">
                      {search
                        ? 'Try using another search keyword or clear the search query.'
                        : 'There are currently no tickets requiring your action.'}
                    </p>
                    {search && (
                      <button
                        type="button"
                        onClick={() => onSearchChange('')}
                        className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-blue-700"
                      >
                        <RotateCcw size={13} />
                        <span>Clear Search</span>
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ) : (
              tickets.map((ticket) => (
                <tr
                  key={ticket.id}
                  onClick={() => onView(ticket)}
                  className="cursor-pointer transition hover:bg-slate-50/80"
                >
                  {/* TICKET NUMBER */}
                  <td className="whitespace-nowrap px-6 py-4">
                    <span className="inline-flex items-center rounded-md bg-slate-100 px-2.5 py-1 font-mono text-xs font-semibold text-slate-800">
                      {ticket.ticketNumber}
                    </span>
                  </td>

                  {/* SUBJECT */}
                  <td className="px-6 py-4">
                    <p className="line-clamp-1 font-semibold text-slate-900">
                      {ticket.subject}
                    </p>
                  </td>

                  {/* REQUESTER */}
                  <td className="whitespace-nowrap px-6 py-4 text-xs font-medium text-slate-700">
                    <p className="font-semibold text-slate-800">{ticket.requesterName}</p>
                    {ticket.requesterDepartment && (
                      <p className="text-[11px] text-slate-400">{ticket.requesterDepartment}</p>
                    )}
                  </td>

                  {/* DATE */}
                  <td className="whitespace-nowrap px-6 py-4 text-xs text-slate-500">
                    {formatDate(ticket.createdAt)}
                  </td>

                  {/* STEP */}
                  <td className="whitespace-nowrap px-6 py-4">
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-2.5 py-0.5 text-xs font-semibold text-amber-700">
                      <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                      {ticket.currentStepName}
                    </span>
                  </td>

                  {/* ACTION */}
                  <td className="whitespace-nowrap px-6 py-4 text-right">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onView(ticket);
                      }}
                      disabled={isLoadingDetail}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <Eye size={13} />
                      <span>View</span>
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* PAGINATION */}
      <div className="flex flex-col gap-3 border-t border-gray-200 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs text-gray-500">
          Total {totalCount} pending ticket(s)
        </p>

        <div className="flex items-center justify-end gap-3">
          <span className="text-xs text-gray-500">
            Page {page} of {Math.max(totalPages, 1)}
          </span>

          <button
            type="button"
            onClick={() => onPageChange(page - 1)}
            disabled={page <= 1 || isLoading}
            className="rounded-lg border border-gray-300 p-2 text-gray-600 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
            aria-label="Previous page"
          >
            <ChevronLeft size={17} />
          </button>

          <button
            type="button"
            onClick={() => onPageChange(page + 1)}
            disabled={page >= totalPages || isLoading}
            className="rounded-lg border border-gray-300 p-2 text-gray-600 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
            aria-label="Next page"
          >
            <ChevronRight size={17} />
          </button>
        </div>
      </div>
    </section>
  );
}

export default PendingProcurementTable;

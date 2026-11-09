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

function SortableHeader({
  label,
  field,
  sortBy,
  desc,
  onSort,
}: {
  label: string;
  field: PendingSortField;
  sortBy: PendingSortField;
  desc: boolean;
  onSort: (field: PendingSortField) => void;
}) {
  const isActive = sortBy === field;

  const Icon = !isActive ? ArrowUpDown : desc ? ArrowDown : ArrowUp;

  return (
    <th className="px-5 py-4 font-semibold">
      <button
        type="button"
        onClick={() => onSort(field)}
        className={`inline-flex items-center gap-1.5 uppercase tracking-wide transition hover:text-gray-700 ${
          isActive ? 'text-blue-600' : ''
        }`}
      >
        {label}
        <Icon size={13} className={isActive ? '' : 'opacity-50'} />
      </button>
    </th>
  );
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
    return new Date(date).toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
      {/* TABLE HEADER */}
      <div className="flex flex-col gap-4 border-b border-gray-200 p-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-800">
            Pending Approval
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            Procurement tickets that require your action.
          </p>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row">
          {/* SEARCH */}
          <div className="relative w-full lg:w-72">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              type="text"
              value={search}
              onChange={(event) => onSearchChange(event.target.value)}
              placeholder="Search tickets..."
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          {/* REFRESH */}
          <button
            type="button"
            onClick={onRefresh}
            disabled={isLoading}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
          >
            <RefreshCw
              size={16}
              className={isLoading ? 'animate-spin' : ''}
            />

            Refresh
          </button>
        </div>
      </div>

      {/* ERROR */}
      {error && (
        <div className="m-5 flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-4">
          <AlertCircle
            size={18}
            className="mt-0.5 shrink-0 text-red-500"
          />

          <div>
            <p className="text-sm font-semibold text-red-700">
              Failed to load pending tickets
            </p>

            <p className="mt-1 text-xs text-red-600">
              {error}
            </p>
          </div>
        </div>
      )}

      {/* TABLE */}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[850px] text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-400">
            <tr>
              <SortableHeader
                label="Ticket Number"
                field="ticketNumber"
                sortBy={sortBy}
                desc={desc}
                onSort={onSort}
              />

              <SortableHeader
                label="Subject"
                field="subject"
                sortBy={sortBy}
                desc={desc}
                onSort={onSort}
              />

              <SortableHeader
                label="Requester"
                field="requester"
                sortBy={sortBy}
                desc={desc}
                onSort={onSort}
              />

              <SortableHeader
                label="Created Date"
                field="date"
                sortBy={sortBy}
                desc={desc}
                onSort={onSort}
              />

              <th className="px-5 py-4 font-semibold">
                Current Step
              </th>

              <th className="px-5 py-4 text-center font-semibold">
                Action
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100">
            {isLoading ? (
              <tr>
                <td colSpan={6} className="px-5 py-12 text-center">
                  <div className="flex items-center justify-center gap-2 text-gray-500">
                    <RefreshCw size={17} className="animate-spin" />

                    <span>Loading pending tickets...</span>
                  </div>
                </td>
              </tr>
            ) : tickets.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-5 py-12 text-center">
                  <div className="text-gray-400">
                    <p className="font-medium text-gray-600">
                      No pending procurement tickets
                    </p>

                    <p className="mt-1 text-xs">
                      There are currently no tickets requiring your action.
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              tickets.map((ticket) => (
                <tr
                  key={ticket.id}
                  className="transition hover:bg-gray-50"
                >
                  <td className="whitespace-nowrap px-5 py-4 font-semibold text-blue-600">
                    {ticket.ticketNumber}
                  </td>

                  <td className="max-w-[250px] px-5 py-4">
                    <p className="truncate font-medium text-gray-800">
                      {ticket.subject}
                    </p>
                  </td>

                  <td className="whitespace-nowrap px-5 py-4 text-gray-600">
                    {ticket.requesterName}
                  </td>

                  <td className="whitespace-nowrap px-5 py-4 text-gray-600">
                    {formatDate(ticket.createdAt)}
                  </td>

                  <td className="px-5 py-4">
                    <span className="inline-flex rounded-full bg-amber-50 px-3 py-1 text-xs font-medium text-amber-700">
                      {ticket.currentStepName}
                    </span>
                  </td>

                  <td className="px-5 py-4 text-center">
                    <button
                      type="button"
                      onClick={() => onView(ticket)}
                      disabled={isLoadingDetail}
                      className="inline-flex items-center gap-2 rounded-lg border border-blue-200 px-3 py-2 text-xs font-medium text-blue-600 transition hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <Eye size={15} />

                      View
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
    </div>
  );
}

export default PendingProcurementTable;
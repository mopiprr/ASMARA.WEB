import { useState } from 'react';
import {
  Search,
  RefreshCw,
  ClipboardList,
  AlertCircle,
  Eye,
  ArrowUp,
  ArrowDown,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
} from 'lucide-react';

import type {
  ProcurementTicketListItem,
} from '../types/procurement.types';

import {
  formatDate,
} from '../utils/procurement.utils';

import ProcurementStatusBadge from './ProcurementStatusBadge';
import type { TicketSortField } from '../hooks/useProcurementTickets';

// ==========================================
// PROPS
// ==========================================

interface ProcurementTableProps {
  tickets: ProcurementTicketListItem[];
  isLoading: boolean;
  error: string;
  onRefresh: () => void;
  onView: (ticket: ProcurementTicketListItem) => void;
  sortBy: TicketSortField;
  desc: boolean;
  onSort: (field: TicketSortField) => void;
  page: number;
  totalPages: number;
  totalCount: number;
  onPageChange: (page: number) => void;
}

// ==========================================
// COMPONENT
// ==========================================

function ProcurementTable({
  tickets,
  isLoading,
  error,
  onRefresh,
  onView,
  sortBy,
  desc,
  onSort,
  page,
  totalPages,
  totalCount,
  onPageChange,
}: ProcurementTableProps) {
  const [searchQuery, setSearchQuery] = useState('');

  // ==========================================
  // FILTER TICKETS
  // ==========================================

  const keyword = searchQuery.toLowerCase().trim();

  const filteredTickets = tickets.filter((ticket) => {
    if (!keyword) return true;

    return (
      ticket.ticketNumber.toLowerCase().includes(keyword) ||
      ticket.subject.toLowerCase().includes(keyword) ||
      (ticket.requesterName ?? '').toLowerCase().includes(keyword) ||
      ticket.currentStep.toLowerCase().includes(keyword) ||
      ticket.currentStepName.toLowerCase().includes(keyword)
    );
  });

  const renderSortIcon = (field: TicketSortField) => {
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
      {/* FILTER & CONTROLS HEADER */}
      <div className="border-b border-slate-100 p-5">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
            <div>
              <h2 className="text-lg font-bold text-slate-800">
                Procurement Requests
              </h2>
              <p className="text-xs text-slate-500">
                View, monitor, and track procurement requests.
              </p>
            </div>

            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:bg-slate-50"
              >
                <RotateCcw size={13} />
                <span>Clear Search</span>
              </button>
            )}
          </div>

          {/* SEARCH & ACTION BAR */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            {/* SEARCH INPUT */}
            <div className="relative flex-1">
              <Search
                size={16}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
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

      {/* ERROR ALERT */}
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
        <table className="w-full min-w-[900px] text-left text-xs">
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

              {/* REQUEST DETAILS */}
              <th
                onClick={() => onSort('subject')}
                className="group cursor-pointer select-none px-6 py-3.5 transition hover:bg-slate-100/70"
                title="Click to sort by Subject"
              >
                <div className="flex items-center gap-1.5">
                  <span className={sortBy === 'subject' ? 'font-bold text-blue-600' : ''}>
                    Request Details
                  </span>
                  {renderSortIcon('subject')}
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
                    Date
                  </span>
                  {renderSortIcon('date')}
                </div>
              </th>

              {/* STATUS */}
              <th
                onClick={() => onSort('status')}
                className="group cursor-pointer select-none px-6 py-3.5 transition hover:bg-slate-100/70"
                title="Click to sort by Status"
              >
                <div className="flex items-center gap-1.5">
                  <span className={sortBy === 'status' ? 'font-bold text-blue-600' : ''}>
                    Status
                  </span>
                  {renderSortIcon('status')}
                </div>
              </th>

              {/* ACTION */}
              <th className="px-6 py-3.5 text-right font-semibold">Action</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100 text-slate-700">
            {/* LOADING SKELETON */}
            {isLoading && tickets.length === 0 ? (
              Array.from({ length: 5 }).map((_, idx) => (
                <tr key={idx} className="animate-pulse">
                  <td className="px-6 py-4">
                    <div className="h-4 w-28 rounded bg-slate-200" />
                  </td>
                  <td className="px-6 py-4">
                    <div className="h-4 w-48 rounded bg-slate-200" />
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
            ) : filteredTickets.length === 0 ? (
              /* EMPTY STATE */
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center">
                  <div className="flex flex-col items-center justify-center">
                    <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                      <ClipboardList size={24} />
                    </div>
                    <p className="text-sm font-semibold text-slate-700">
                      {searchQuery ? 'No matching requests found' : 'No procurement requests yet'}
                    </p>
                    <p className="mt-1 max-w-sm text-xs text-slate-400">
                      {searchQuery
                        ? 'Try using another search keyword or clear the search query.'
                        : 'Procurement requests will appear here after submission.'}
                    </p>
                    {searchQuery && (
                      <button
                        type="button"
                        onClick={() => setSearchQuery('')}
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
              /* TICKET ROWS */
              filteredTickets.map((ticket) => (
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

                  {/* REQUEST DETAILS */}
                  <td className="px-6 py-4">
                    <p className="line-clamp-1 font-semibold text-slate-900">
                      {ticket.subject}
                    </p>
                    <p className="mt-0.5 text-xs text-slate-400">
                      Procurement Request
                    </p>
                  </td>

                  {/* DATE */}
                  <td className="whitespace-nowrap px-6 py-4 text-xs text-slate-500">
                    {formatDate(ticket.createdAt)}
                  </td>

                  {/* STATUS */}
                  <td className="whitespace-nowrap px-6 py-4">
                    <ProcurementStatusBadge status={ticket.currentStep} />
                  </td>

                  {/* ACTION */}
                  <td className="whitespace-nowrap px-6 py-4 text-right">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onView(ticket);
                      }}
                      title="View ticket details"
                      className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600"
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

      {/* TABLE FOOTER / PAGINATION */}
      <div className="flex flex-col gap-3 border-t border-gray-200 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs text-gray-500">
          Showing {filteredTickets.length} of {totalCount} requests
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

export default ProcurementTable;

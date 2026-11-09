
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
// SORTABLE HEADER
// ==========================================

interface SortableHeaderProps {
  label: string;
  field: TicketSortField;
  sortBy: TicketSortField;
  desc: boolean;
  onSort: (field: TicketSortField) => void;
}

function SortableHeader({
  label,
  field,
  sortBy,
  desc,
  onSort,
}: SortableHeaderProps) {
  const isActive = sortBy === field;

  const Icon = !isActive ? ArrowUpDown : desc ? ArrowDown : ArrowUp;

  return (
    <th className="px-6 py-4 font-semibold">
      <button
        type="button"
        onClick={() => onSort(field)}
        className={`inline-flex items-center gap-1.5 uppercase tracking-wider transition hover:text-slate-600 ${
          isActive ? 'text-blue-600' : ''
        }`}
      >
        {label}
        <Icon size={13} className={isActive ? '' : 'opacity-50'} />
      </button>
    </th>
  );
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

  // ==========================================
  // RENDER
  // ==========================================

  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

      {/* TABLE HEADER */}
      <div className="border-b border-slate-100 p-6">
        <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">

          <div>
            <h2 className="text-lg font-bold text-slate-800">
              Procurement Requests
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              View and track procurement requests.
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
                value={searchQuery}
                onChange={(event) =>
                  setSearchQuery(event.target.value)
                }
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
      </div>

      {/* TABLE */}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[900px] text-left text-sm">

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
                label="Request Details"
                field="subject"
                sortBy={sortBy}
                desc={desc}
                onSort={onSort}
              />

              <SortableHeader
                label="Date"
                field="date"
                sortBy={sortBy}
                desc={desc}
                onSort={onSort}
              />

              <SortableHeader
                label="Status"
                field="status"
                sortBy={sortBy}
                desc={desc}
                onSort={onSort}
              />

              <th className="px-6 py-4 font-semibold">
                Action
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100">

            {/* LOADING */}
            {isLoading && tickets.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  className="px-6 py-16 text-center"
                >
                  <RefreshCw
                    size={28}
                    className="mx-auto animate-spin text-blue-500"
                  />

                  <p className="mt-3 text-sm text-slate-500">
                    Loading procurement requests...
                  </p>
                </td>
              </tr>

            ) : error ? (

              /* ERROR */
              <tr>
                <td
                  colSpan={7}
                  className="px-6 py-16 text-center"
                >
                  <AlertCircle
                    size={32}
                    className="mx-auto text-red-400"
                  />

                  <p className="mt-3 font-semibold text-red-600">
                    Failed to load procurement requests
                  </p>

                  <p className="mt-1 text-sm text-slate-500">
                    {error}
                  </p>

                  <button
                    type="button"
                    onClick={onRefresh}
                    className="mt-4 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
                  >
                    Try Again
                  </button>
                </td>
              </tr>

            ) : filteredTickets.length === 0 ? (

              /* EMPTY STATE */
              <tr>
                <td
                  colSpan={7}
                  className="px-6 py-16 text-center"
                >
                  <ClipboardList
                    size={44}
                    className="mx-auto text-slate-300"
                  />

                  <h3 className="mt-4 text-sm font-semibold text-slate-700">
                    {searchQuery
                      ? 'No matching requests found'
                      : 'No procurement requests yet'}
                  </h3>

                  <p className="mt-1 text-sm text-slate-400">
                    {searchQuery
                      ? 'Try using another search keyword.'
                      : 'Procurement requests will appear here after submission.'}
                  </p>
                </td>
              </tr>

            ) : (

              /* TICKET ROWS */
              filteredTickets.map((ticket) => (
                <tr
                  key={ticket.id}
                  className="transition hover:bg-slate-50/70"
                >

                  {/* TICKET NUMBER */}
                  <td className="px-6 py-4">
                    <span className="font-semibold text-blue-600">
                      {ticket.ticketNumber}
                    </span>
                  </td>

                  {/* REQUEST DETAILS */}
                  <td className="px-6 py-4">
                    <p className="font-semibold text-slate-800">
                      {ticket.subject}
                    </p>

                    <p className="mt-1 max-w-xs truncate text-xs text-slate-400">
                      Procurement Request
                    </p>
                  </td>

                  {/* DATE */}
                  <td className="whitespace-nowrap px-6 py-4 text-slate-500">
                    {formatDate(ticket.createdAt)}
                  </td>

                  {/* STATUS */}
                  <td className="px-6 py-4">
                    <ProcurementStatusBadge
                      status={ticket.currentStep}
                    />
                  </td>

                  {/* ACTION */}
                  <td className="px-6 py-4">
                    <button
                      type="button"
                      onClick={() => onView(ticket)}
                      title="View ticket details"
                      className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600"
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

      {/* TABLE FOOTER */}
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

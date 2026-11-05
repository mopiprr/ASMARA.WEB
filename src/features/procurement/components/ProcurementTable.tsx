
import { useState } from 'react';
import {
  Search,
  RefreshCw,
  ClipboardList,
  AlertCircle,
  Eye,
} from 'lucide-react';

import type { ProcurementTicket } from '../types/procurement.types';

import {
  formatDate,
  formatIDR,
  getTicketTotal,
} from '../utils/procurement.utils';

import ProcurementStatusBadge from './ProcurementStatusBadge';

// ==========================================
// PROPS
// ==========================================

interface ProcurementTableProps {
  tickets: ProcurementTicket[];
  isLoading: boolean;
  error: string;
  onRefresh: () => void;
  onView: (ticket: ProcurementTicket) => void;
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
      (ticket.employeeName ?? '').toLowerCase().includes(keyword) ||
      ticket.currentStep.toLowerCase().includes(keyword)
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
                placeholder="Search requests..."
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
              <th className="px-6 py-4 font-semibold">
                Ticket
              </th>

              <th className="px-6 py-4 font-semibold">
                Request Details
              </th>

              <th className="px-6 py-4 font-semibold">
                Requester
              </th>

              <th className="px-6 py-4 font-semibold">
                Date
              </th>

              <th className="px-6 py-4 font-semibold">
                Estimated Value
              </th>

              <th className="px-6 py-4 font-semibold">
                Status
              </th>

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
                  colSpan={7}
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
                      {ticket.procurementDetails?.length ?? 0} item(s)
                      {ticket.parentTicketId
                        ? ' · From Maintenance'
                        : ' · Standalone'}
                    </p>
                  </td>

                  {/* REQUESTER */}
                  <td className="px-6 py-4">
                    <span className="text-slate-700">
                      {ticket.employeeName || '-'}
                    </span>
                  </td>

                  {/* DATE */}
                  <td className="whitespace-nowrap px-6 py-4 text-slate-500">
                    {formatDate(ticket.createdAt)}
                  </td>

                  {/* ESTIMATED VALUE */}
                  <td className="whitespace-nowrap px-6 py-4 font-medium text-slate-700">
                    {formatIDR(getTicketTotal(ticket))}
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
      <div className="flex flex-col justify-between gap-2 border-t border-slate-100 px-6 py-4 sm:flex-row sm:items-center">
        <p className="text-xs text-slate-400">
          Showing {filteredTickets.length} of {tickets.length} requests
        </p>

        <p className="text-xs text-slate-400">
          Data based on your access permissions.
        </p>
      </div>

    </section>
  );
}

export default ProcurementTable;

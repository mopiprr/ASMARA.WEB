
import {
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  Eye,
  RefreshCw,
  Search,
} from 'lucide-react';

import type {
  MaintenanceTicketListItem,
} from '../types/maintenance.types';

import MaintenanceStatusBadge from './MaintenanceStatusBadge';

interface MaintenanceTableProps {
  tickets: MaintenanceTicketListItem[];
  isLoading: boolean;
  error: string;

  search: string;
  onSearchChange: (value: string) => void;

  page: number;
  totalPages: number;
  totalCount: number;
  onPageChange: (page: number) => void;

  onRefresh: () => void;
  onView: (ticket: MaintenanceTicketListItem) => void;
  isLoadingDetail?: boolean;
}

function formatDate(value: string) {
  if (!value) return '-';

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return '-';

  return date.toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

function MaintenanceTable({
  tickets,
  isLoading,
  error,
  search,
  onSearchChange,
  page,
  totalPages,
  totalCount,
  onPageChange,
  onRefresh,
  onView,
  isLoadingDetail = false,
}: MaintenanceTableProps) {
  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      {/* HEADER */}
      <div className="border-b border-slate-100 p-6">
        <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
          <div>
            <h2 className="text-lg font-bold text-slate-800">
              My Maintenance Requests
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              View and track maintenance requests you have submitted.
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
                onChange={(event) =>
                  onSearchChange(event.target.value)
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

      {/* ERROR */}
      {error && (
        <div className="m-5 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4">
          <AlertCircle
            size={18}
            className="mt-0.5 shrink-0 text-red-500"
          />

          <div>
            <p className="text-sm font-semibold text-red-700">
              Failed to load maintenance requests
            </p>

            <p className="mt-1 text-xs text-red-600">
              {error}
            </p>
          </div>
        </div>
      )}

      {/* TABLE */}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[800px] text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-400">
            <tr>
              <th className="px-6 py-4 font-semibold">
                Ticket Number
              </th>

              <th className="px-6 py-4 font-semibold">
                Subject
              </th>

              <th className="px-6 py-4 font-semibold">
                Created Date
              </th>

              <th className="px-6 py-4 font-semibold">
                Current Step
              </th>

              <th className="px-6 py-4 text-center font-semibold">
                Action
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100">
            {isLoading ? (
              <tr>
                <td colSpan={5} className="px-6 py-16 text-center">
                  <RefreshCw
                    size={28}
                    className="mx-auto animate-spin text-blue-500"
                  />

                  <p className="mt-3 text-sm text-slate-500">
                    Loading maintenance requests...
                  </p>
                </td>
              </tr>
            ) : tickets.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-16 text-center">
                  {error ? (
                    <AlertCircle
                      size={40}
                      className="mx-auto text-red-300"
                    />
                  ) : (
                    <ClipboardList
                      size={44}
                      className="mx-auto text-slate-300"
                    />
                  )}

                  <h3 className="mt-4 text-sm font-semibold text-slate-700">
                    {search
                      ? 'No matching requests found'
                      : 'No maintenance requests yet'}
                  </h3>

                  <p className="mt-1 text-sm text-slate-400">
                    {search
                      ? 'Try using another search keyword.'
                      : 'Your maintenance requests will appear here.'}
                  </p>
                </td>
              </tr>
            ) : (
              tickets.map((ticket) => (
                <tr
                  key={ticket.id}
                  className="transition hover:bg-slate-50/70"
                >
                  <td className="whitespace-nowrap px-6 py-4">
                    <span className="font-semibold text-blue-600">
                      {ticket.ticketNumber}
                    </span>
                  </td>

                  <td className="max-w-[300px] px-6 py-4">
                    <p className="truncate font-medium text-slate-800">
                      {ticket.subject}
                    </p>
                  </td>

                  <td className="whitespace-nowrap px-6 py-4 text-slate-600">
                    {formatDate(ticket.createdAt)}
                  </td>

                  <td className="px-6 py-4">
                    <MaintenanceStatusBadge
                      step={ticket.currentStep}
                      label={ticket.currentStepName}
                    />
                  </td>

                  <td className="px-6 py-4 text-center">
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
      <div className="flex flex-col gap-3 border-t border-slate-100 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs text-slate-500">
          Total {totalCount} maintenance request(s)
        </p>

        <div className="flex items-center justify-end gap-3">
          <span className="text-xs text-slate-500">
            Page {page} of {Math.max(totalPages, 1)}
          </span>

          <button
            type="button"
            onClick={() => onPageChange(page - 1)}
            disabled={page <= 1 || isLoading}
            aria-label="Previous page"
            className="rounded-lg border border-slate-200 p-2 text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <ChevronLeft size={17} />
          </button>

          <button
            type="button"
            onClick={() => onPageChange(page + 1)}
            disabled={page >= totalPages || isLoading}
            aria-label="Next page"
            className="rounded-lg border border-slate-200 p-2 text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <ChevronRight size={17} />
          </button>
        </div>
      </div>
    </section>
  );
}

export default MaintenanceTable;

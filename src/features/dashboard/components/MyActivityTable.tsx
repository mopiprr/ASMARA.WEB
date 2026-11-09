import { useCallback, useEffect, useState } from 'react';

import {
  Search,
  RefreshCw,
  ClipboardList,
  AlertCircle,
  Eye,
  ChevronLeft,
  ChevronRight,
  History,
} from 'lucide-react';

import api from '../../../services/api';

import type { PagedResult } from '../../procurement/types/procurement.types';

import TicketViewModal from './TicketViewModal';

// ==========================================
// TYPES
// ==========================================

// Satu baris dari GET /api/dashboard/my-activity.
interface ActivityTicket {
  id: string;
  ticketNumber: string;
  ticketType: number;          // 1 = Maintenance, 2 = Procurement
  subject: string;
  requesterName: string;
  currentStep: string;
  currentStepName: string;
  myLastAction: string;
  myLastActionAt: string;
}

const PAGE_SIZE = 10;

// ==========================================
// HELPERS
// ==========================================

function formatDateTime(value: string) {
  const date = new Date(value);
  const pad = (n: number) => n.toString().padStart(2, '0');

  return `${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${date.getFullYear()} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function getTypeBadge(type: number) {
  return type === 1
    ? { label: 'Maintenance', style: 'bg-violet-50 text-violet-700' }
    : { label: 'Procurement', style: 'bg-blue-50 text-blue-700' };
}

// ==========================================
// COMPONENT
// ==========================================

function MyActivityTable() {
  const [tickets, setTickets] = useState<ActivityTicket[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Filter
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [type, setType] = useState('');          // '' | '1' | '2'
  const [fromDate, setFromDate] = useState('');  // yyyy-MM-dd
  const [toDate, setToDate] = useState('');
  const [page, setPage] = useState(1);

  // Ticket yang sedang dilihat (view only)
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);

  // Search ditunda 400ms supaya tidak request setiap ketikan.
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchInput.trim());
      setPage(1);
    }, 400);

    return () => clearTimeout(timer);
  }, [searchInput]);

  const fetchActivity = useCallback(async () => {
    try {
      setIsLoading(true);
      setError('');

      const response = await api.get<PagedResult<ActivityTicket>>(
        '/dashboard/my-activity',
        {
          params: {
            type: type || undefined,
            search: search || undefined,
            fromDate: fromDate || undefined,
            toDate: toDate || undefined,
            page,
            pageSize: PAGE_SIZE,
          },
        }
      );

      setTickets(response.data.items ?? []);
      setTotalCount(response.data.totalCount ?? 0);
      setTotalPages(response.data.totalPages ?? 0);
    } catch (err: unknown) {
      console.error('Failed to fetch my activity:', err);

      const apiError = err as {
        response?: {
          data?: { message?: string; detail?: string; title?: string };
        };
        message?: string;
      };

      setError(
        apiError.response?.data?.detail ||
          apiError.response?.data?.message ||
          apiError.response?.data?.title ||
          apiError.message ||
          'Failed to load activity.'
      );
    } finally {
      setIsLoading(false);
    }
  }, [type, search, fromDate, toDate, page]);

  useEffect(() => {
    void fetchActivity();
  }, [fetchActivity]);

  const hasFilter = Boolean(search || type || fromDate || toDate);

  const resetFilter = () => {
    setSearchInput('');
    setSearch('');
    setType('');
    setFromDate('');
    setToDate('');
    setPage(1);
  };

  const filterClass =
    'rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-600 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100';

  return (
    <>
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

        {/* HEADER */}
        <div className="border-b border-slate-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-800">
                My Activity
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Tickets from others that you have acted on.
              </p>
            </div>

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
              <History size={22} />
            </div>
          </div>

          {/* FILTERS */}
          <div className="mt-5 flex flex-col gap-2 lg:flex-row lg:items-center">

            {/* SEARCH */}
            <div className="relative w-full lg:w-72">
              <Search
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                type="text"
                value={searchInput}
                onChange={(event) => setSearchInput(event.target.value)}
                placeholder="Search number, subject, requester..."
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            {/* TYPE */}
            <select
              value={type}
              onChange={(event) => {
                setType(event.target.value);
                setPage(1);
              }}
              className={filterClass}
            >
              <option value="">All Types</option>
              <option value="1">Maintenance</option>
              <option value="2">Procurement</option>
            </select>

            {/* DATE RANGE (tanggal aksi saya) */}
            <div className="flex items-center gap-2">
              <input
                type="date"
                value={fromDate}
                max={toDate || undefined}
                onChange={(event) => {
                  setFromDate(event.target.value);
                  setPage(1);
                }}
                className={filterClass}
                title="From date"
              />

              <span className="text-sm text-slate-400">to</span>

              <input
                type="date"
                value={toDate}
                min={fromDate || undefined}
                onChange={(event) => {
                  setToDate(event.target.value);
                  setPage(1);
                }}
                className={filterClass}
                title="To date"
              />
            </div>

            <div className="flex gap-2 lg:ml-auto">
              {hasFilter && (
                <button
                  type="button"
                  onClick={resetFilter}
                  className="rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-500 transition hover:bg-slate-50"
                >
                  Reset
                </button>
              )}

              {/* REFRESH */}
              <button
                type="button"
                onClick={() => void fetchActivity()}
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
                <th className="px-6 py-4 font-semibold">Ticket</th>
                <th className="px-6 py-4 font-semibold">Request Details</th>
                <th className="px-6 py-4 font-semibold">Requester</th>
                <th className="px-6 py-4 font-semibold">My Last Action</th>
                <th className="px-6 py-4 font-semibold">Current Step</th>
                <th className="px-6 py-4 font-semibold">Action</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {isLoading && tickets.length === 0 ? (

                /* LOADING */
                <tr>
                  <td colSpan={6} className="px-6 py-16 text-center">
                    <RefreshCw
                      size={28}
                      className="mx-auto animate-spin text-blue-500"
                    />

                    <p className="mt-3 text-sm text-slate-500">
                      Loading activity...
                    </p>
                  </td>
                </tr>

              ) : error ? (

                /* ERROR */
                <tr>
                  <td colSpan={6} className="px-6 py-16 text-center">
                    <AlertCircle size={32} className="mx-auto text-red-400" />

                    <p className="mt-3 font-semibold text-red-600">
                      Failed to load activity
                    </p>

                    <p className="mt-1 text-sm text-slate-500">{error}</p>

                    <button
                      type="button"
                      onClick={() => void fetchActivity()}
                      className="mt-4 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
                    >
                      Try Again
                    </button>
                  </td>
                </tr>

              ) : tickets.length === 0 ? (

                /* EMPTY */
                <tr>
                  <td colSpan={6} className="px-6 py-16 text-center">
                    <ClipboardList size={44} className="mx-auto text-slate-300" />

                    <h3 className="mt-4 text-sm font-semibold text-slate-700">
                      {hasFilter ? 'No matching activity found' : 'No activity yet'}
                    </h3>

                    <p className="mt-1 text-sm text-slate-400">
                      {hasFilter
                        ? 'Try changing the filters.'
                        : 'Tickets you approve or handle will appear here.'}
                    </p>
                  </td>
                </tr>

              ) : (

                /* ROWS (klik baris = lihat detail) */
                tickets.map((ticket) => {
                  const typeBadge = getTypeBadge(ticket.ticketType);

                  return (
                    <tr
                      key={ticket.id}
                      onClick={() => setSelectedTicketId(ticket.id)}
                      className="cursor-pointer transition hover:bg-slate-50/70"
                    >
                      {/* TICKET */}
                      <td className="px-6 py-4">
                        <span className="font-semibold text-blue-600">
                          {ticket.ticketNumber}
                        </span>

                        <span
                          className={`mt-1 block w-fit rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${typeBadge.style}`}
                        >
                          {typeBadge.label}
                        </span>
                      </td>

                      {/* SUBJECT */}
                      <td className="px-6 py-4">
                        <p className="max-w-xs truncate font-semibold text-slate-800">
                          {ticket.subject}
                        </p>
                      </td>

                      {/* REQUESTER */}
                      <td className="px-6 py-4 text-slate-700">
                        {ticket.requesterName || '-'}
                      </td>

                      {/* MY LAST ACTION */}
                      <td className="px-6 py-4">
                        <p className="font-medium text-slate-700">
                          {ticket.myLastAction}
                        </p>

                        <p className="mt-1 whitespace-nowrap text-xs text-slate-400">
                          {formatDateTime(ticket.myLastActionAt)}
                        </p>
                      </td>

                      {/* CURRENT STEP */}
                      <td className="px-6 py-4">
                        <span className="inline-flex rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-600">
                          {ticket.currentStepName || ticket.currentStep}
                        </span>
                      </td>

                      {/* ACTION */}
                      <td className="px-6 py-4">
                        <button
                          type="button"
                          onClick={(event) => {
                            event.stopPropagation();
                            setSelectedTicketId(ticket.id);
                          }}
                          title="View ticket details"
                          className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600"
                        >
                          <Eye size={15} />
                          View
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* FOOTER + PAGING */}
        <div className="flex flex-col justify-between gap-3 border-t border-slate-100 px-6 py-4 sm:flex-row sm:items-center">
          <p className="text-xs text-slate-400">
            Showing {tickets.length} of {totalCount} tickets
          </p>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setPage((p) => p - 1)}
              disabled={isLoading || page <= 1}
              className="rounded-lg border border-slate-200 p-2 text-slate-500 transition hover:bg-slate-50 disabled:opacity-40"
            >
              <ChevronLeft size={16} />
            </button>

            <span className="text-xs font-medium text-slate-500">
              Page {totalPages === 0 ? 0 : page} of {totalPages}
            </span>

            <button
              type="button"
              onClick={() => setPage((p) => p + 1)}
              disabled={isLoading || page >= totalPages}
              className="rounded-lg border border-slate-200 p-2 text-slate-500 transition hover:bg-slate-50 disabled:opacity-40"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </section>

      {/* DETAIL (VIEW ONLY) */}
      <TicketViewModal
        ticketId={selectedTicketId}
        onClose={() => setSelectedTicketId(null)}
      />
    </>
  );
}

export default MyActivityTable;
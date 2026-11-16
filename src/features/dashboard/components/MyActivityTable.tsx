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
  requesterName?: string;
  currentStep: string;
  currentStepName: string;
  myLastAction?: string;
  myLastActionAt?: string;
  createdAt?: string;
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

interface MyActivityTableProps {
  type?: string;      // '' | '1' | '2'
  fromDate?: string;  // yyyy-MM-dd
  toDate?: string;    // yyyy-MM-dd
  isApprover?: boolean;
}

function MyActivityTable({
  type = '',
  fromDate = '',
  toDate = '',
  isApprover = true,
}: MyActivityTableProps) {
  const [tickets, setTickets] = useState<ActivityTicket[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Filter Search
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  // Ticket yang sedang dilihat (view only)
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);

  // Reset page saat filter global berubah
  useEffect(() => {
    setPage(1);
  }, [type, fromDate, toDate]);

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

      if (isApprover) {
        // Approver / Manager / Finance / Handler: tiket orang lain yang pernah diapprove/ditangani
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
      } else {
        // Employee biasa (Requester): riwayat pengajuan tiket milik sendiri
        const response = await api.get<PagedResult<ActivityTicket>>(
          '/tickets',
          {
            params: {
              type: type ? Number(type) : undefined,
              search: search || undefined,
              page,
              pageSize: PAGE_SIZE,
              desc: true,
            },
          }
        );

        setTickets(response.data.items ?? []);
        setTotalCount(response.data.totalCount ?? 0);
        setTotalPages(response.data.totalPages ?? 0);
      }
    } catch (err: unknown) {
      console.error('Failed to fetch activity/tickets:', err);

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
          'Failed to load tickets.'
      );
    } finally {
      setIsLoading(false);
    }
  }, [isApprover, type, search, fromDate, toDate, page]);

  useEffect(() => {
    void fetchActivity();
  }, [fetchActivity]);

  // Listen to global dashboard refresh event
  useEffect(() => {
    const handleGlobalRefresh = () => {
      void fetchActivity();
    };

    window.addEventListener('refresh-dashboard-activity', handleGlobalRefresh);
    return () => {
      window.removeEventListener('refresh-dashboard-activity', handleGlobalRefresh);
    };
  }, [fetchActivity]);

  const hasFilter = Boolean(search || type || fromDate || toDate);

  return (
    <>
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

        {/* HEADER */}
        <div className="border-b border-slate-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-800">
                {isApprover ? 'My Activity' : 'My Recent Requests'}
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                {isApprover
                  ? 'Tickets from others that you have acted on.'
                  : 'All procurement and maintenance tickets submitted by you.'}
              </p>
            </div>

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
              {isApprover ? <History size={22} /> : <ClipboardList size={22} />}
            </div>
          </div>

          {/* FILTERS */}
          <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">

            {/* SEARCH */}
            <div className="relative w-full sm:w-80">
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

            <div className="flex items-center gap-2 sm:ml-auto">
              {searchInput && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchInput('');
                    setSearch('');
                    setPage(1);
                  }}
                  className="rounded-xl px-3 py-2 text-xs font-semibold text-slate-500 hover:bg-slate-100 transition"
                >
                  Clear Search
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
                {isApprover ? (
                  <>
                    <th className="px-6 py-4 font-semibold">Requester</th>
                    <th className="px-6 py-4 font-semibold">My Last Action</th>
                  </>
                ) : (
                  <th className="px-6 py-4 font-semibold">Submitted Date</th>
                )}
                <th className="px-6 py-4 font-semibold">Current Step</th>
                <th className="px-6 py-4 font-semibold">Action</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {isLoading && tickets.length === 0 ? (

                /* LOADING */
                <tr>
                  <td colSpan={isApprover ? 6 : 5} className="px-6 py-16 text-center">
                    <RefreshCw
                      size={28}
                      className="mx-auto animate-spin text-blue-500"
                    />

                    <p className="mt-3 text-sm text-slate-500">
                      {isApprover ? 'Loading activity...' : 'Loading your requests...'}
                    </p>
                  </td>
                </tr>

              ) : error ? (

                /* ERROR */
                <tr>
                  <td colSpan={isApprover ? 6 : 5} className="px-6 py-16 text-center">
                    <AlertCircle size={32} className="mx-auto text-red-400" />

                    <p className="mt-3 font-semibold text-red-600">
                      Failed to load tickets
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
                  <td colSpan={isApprover ? 6 : 5} className="px-6 py-16 text-center">
                    <ClipboardList size={44} className="mx-auto text-slate-300" />

                    <h3 className="mt-4 text-sm font-semibold text-slate-700">
                      {hasFilter
                        ? 'No matching tickets found'
                        : isApprover
                        ? 'No activity yet'
                        : 'No requests submitted yet'}
                    </h3>

                    <p className="mt-1 text-sm text-slate-400">
                      {hasFilter
                        ? 'Try changing the filters.'
                        : isApprover
                        ? 'Tickets you approve or handle will appear here.'
                        : 'Tickets you submit will appear here.'}
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

                      {/* CONDITIONAL COLUMNS */}
                      {isApprover ? (
                        <>
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
                              {ticket.myLastActionAt ? formatDateTime(ticket.myLastActionAt) : '-'}
                            </p>
                          </td>
                        </>
                      ) : (
                        /* SUBMITTED DATE FOR REQUESTER */
                        <td className="px-6 py-4 text-slate-500 whitespace-nowrap text-xs">
                          {ticket.createdAt ? formatDateTime(ticket.createdAt) : '-'}
                        </td>
                      )}

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
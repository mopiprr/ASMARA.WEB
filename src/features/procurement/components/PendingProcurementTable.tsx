import { Clock, Eye } from 'lucide-react';

import type { PendingProcurementTicket } from '../types/procurement.types';
import type { PendingSortField } from '../hooks/usePendingProcurementTickets';

import { formatShortDateEn } from '../utils/procurement.utils';

import SortableHeader from './table/SortableHeader';
import TableToolbar from './table/TableToolbar';
import TableErrorAlert from './table/TableErrorAlert';
import TableSkeletonRows from './table/TableSkeletonRows';
import TableEmptyState from './table/TableEmptyState';
import TablePagination from './table/TablePagination';

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
  const sortProps = { sortBy, desc, onSort };

  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <TableToolbar
        title="Pending Approval"
        description="Procurement tickets that require your review and action."
        search={search}
        onSearchChange={onSearchChange}
        isLoading={isLoading}
        onRefresh={onRefresh}
      />

      <TableErrorAlert error={error} onRetry={onRefresh} />

      {/* TABLE */}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[850px] text-left text-xs">
          <thead className="border-b border-slate-100 bg-slate-50 font-semibold uppercase tracking-wider text-slate-500">
            <tr>
              <SortableHeader field="ticketNumber" label="Ticket #" title="Click to sort by Ticket Number" {...sortProps} />
              <SortableHeader field="subject" label="Subject" title="Click to sort by Subject" {...sortProps} />
              <SortableHeader field="requester" label="Requester" title="Click to sort by Requester" {...sortProps} />
              <SortableHeader field="date" label="Created Date" title="Click to sort by Date" {...sortProps} />
              <th className="px-6 py-3.5 font-semibold">
                Current Step
              </th>
              <th className="px-6 py-3.5 text-right font-semibold">
                Action
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100 text-slate-700">
            {isLoading ? (
              <TableSkeletonRows
                cells={['h-4 w-28', 'h-4 w-44', 'h-4 w-28', 'h-4 w-24', 'h-5 w-24']}
              />
            ) : tickets.length === 0 ? (
              <TableEmptyState
                colSpan={6}
                icon={Clock}
                isSearching={Boolean(search)}
                searchTitle="No matching tickets found"
                emptyTitle="No pending procurement tickets"
                emptyDescription="There are currently no tickets requiring your action."
                onClearSearch={() => onSearchChange('')}
              />
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
                    {formatShortDateEn(ticket.createdAt)}
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

      <TablePagination
        summary={`Total ${totalCount} pending ticket(s)`}
        page={page}
        totalPages={totalPages}
        isLoading={isLoading}
        onPageChange={onPageChange}
      />
    </section>
  );
}

export default PendingProcurementTable;
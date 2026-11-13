import { useState } from 'react';
import { ClipboardList, Eye } from 'lucide-react';

import type { ProcurementTicketListItem } from '../types/procurement.types';
import type { TicketSortField } from '../hooks/useProcurementTickets';

import { formatDate } from '../utils/procurement.utils';

import ProcurementStatusBadge from './ProcurementStatusBadge';
import SortableHeader from './table/SortableHeader';
import TableToolbar from './table/TableToolbar';
import TableErrorAlert from './table/TableErrorAlert';
import TableSkeletonRows from './table/TableSkeletonRows';
import TableEmptyState from './table/TableEmptyState';
import TablePagination from './table/TablePagination';

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

// Pencarian di tab My Requests dilakukan di halaman yang sedang tampil.
function matchesKeyword(ticket: ProcurementTicketListItem, keyword: string) {
  if (!keyword) return true;

  return (
    ticket.ticketNumber.toLowerCase().includes(keyword) ||
    ticket.subject.toLowerCase().includes(keyword) ||
    (ticket.requesterName ?? '').toLowerCase().includes(keyword) ||
    ticket.currentStep.toLowerCase().includes(keyword) ||
    ticket.currentStepName.toLowerCase().includes(keyword)
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

  const keyword = searchQuery.toLowerCase().trim();

  const filteredTickets = tickets.filter((ticket) =>
    matchesKeyword(ticket, keyword)
  );

  const sortProps = { sortBy, desc, onSort };

  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <TableToolbar
        title="Procurement Requests"
        description="View, monitor, and track procurement requests."
        search={searchQuery}
        onSearchChange={setSearchQuery}
        isLoading={isLoading}
        onRefresh={onRefresh}
      />

      <TableErrorAlert error={error} onRetry={onRefresh} />

      {/* TABLE */}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[900px] text-left text-xs">
          <thead className="border-b border-slate-100 bg-slate-50 font-semibold uppercase tracking-wider text-slate-500">
            <tr>
              <SortableHeader field="ticketNumber" label="Ticket #" title="Click to sort by Ticket Number" {...sortProps} />
              <SortableHeader field="subject" label="Request Details" title="Click to sort by Subject" {...sortProps} />
              <SortableHeader field="date" label="Date" title="Click to sort by Date" {...sortProps} />
              <SortableHeader field="status" label="Status" title="Click to sort by Status" {...sortProps} />
              <th className="px-6 py-3.5 text-right font-semibold">Action</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100 text-slate-700">
            {isLoading && tickets.length === 0 ? (
              <TableSkeletonRows
                cells={['h-4 w-28', 'h-4 w-48', 'h-4 w-24', 'h-5 w-24']}
              />
            ) : filteredTickets.length === 0 ? (
              <TableEmptyState
                colSpan={5}
                icon={ClipboardList}
                isSearching={Boolean(searchQuery)}
                searchTitle="No matching requests found"
                emptyTitle="No procurement requests yet"
                emptyDescription="Procurement requests will appear here after submission."
                onClearSearch={() => setSearchQuery('')}
              />
            ) : (
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

      <TablePagination
        summary={`Showing ${filteredTickets.length} of ${totalCount} requests`}
        page={page}
        totalPages={totalPages}
        isLoading={isLoading}
        onPageChange={onPageChange}
      />
    </section>
  );
}

export default ProcurementTable;
import { ClipboardList, Eye } from 'lucide-react';

import type { MaintenanceTicketListItem } from '../types/maintenance.types';
import type { MaintenanceSortField } from '../hooks/useMaintenanceTickets';

import { formatShortDateEn } from '../utils/maintenance.utils';

import MaintenanceStatusBadge from './MaintenanceStatusBadge';

// Komponen tabel yang sama dengan Procurement.
import SortableHeader from '../../procurement/components/table/SortableHeader';
import TableToolbar from '../../procurement/components/table/TableToolbar';
import TableErrorAlert from '../../procurement/components/table/TableErrorAlert';
import TableSkeletonRows from '../../procurement/components/table/TableSkeletonRows';
import TableEmptyState from '../../procurement/components/table/TableEmptyState';
import TablePagination from '../../procurement/components/table/TablePagination';

interface MaintenanceTableProps {
  tickets: MaintenanceTicketListItem[];
  isLoading: boolean;
  error: string;
  search: string;
  onSearchChange: (value: string) => void;
  sortBy: MaintenanceSortField;
  desc: boolean;
  onSort: (field: MaintenanceSortField) => void;
  page: number;
  totalPages: number;
  totalCount: number;
  onPageChange: (page: number) => void;
  onRefresh: () => void;
  onView: (ticket: MaintenanceTicketListItem) => void;
  isLoadingDetail?: boolean;
}

function MaintenanceTable({
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
}: MaintenanceTableProps) {
  const sortProps = { sortBy, desc, onSort };

  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <TableToolbar
        title="Maintenance Requests"
        description="View, monitor, and track your maintenance requests."
        search={search}
        onSearchChange={onSearchChange}
        isLoading={isLoading}
        onRefresh={onRefresh}
      />

      <TableErrorAlert error={error} onRetry={onRefresh} />

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
              <TableSkeletonRows cells={['h-4 w-28', 'h-4 w-48', 'h-4 w-24', 'h-5 w-24']} />
            ) : tickets.length === 0 ? (
              <TableEmptyState
                colSpan={5}
                icon={ClipboardList}
                isSearching={Boolean(search)}
                searchTitle="No matching requests found"
                emptyTitle="No maintenance requests yet"
                emptyDescription="Maintenance requests will appear here after submission."
                onClearSearch={() => onSearchChange('')}
              />
            ) : (
              tickets.map((ticket) => (
                <tr
                  key={ticket.id}
                  onClick={() => onView(ticket)}
                  className="cursor-pointer transition hover:bg-slate-50/80"
                >
                  <td className="whitespace-nowrap px-6 py-4">
                    <span className="inline-flex items-center rounded-md bg-slate-100 px-2.5 py-1 font-mono text-xs font-semibold text-slate-800">
                      {ticket.ticketNumber}
                    </span>
                  </td>

                  <td className="px-6 py-4">
                    <p className="line-clamp-1 font-semibold text-slate-900">
                      {ticket.subject}
                    </p>
                    <p className="mt-0.5 text-xs text-slate-400">
                      Maintenance Request
                    </p>
                  </td>

                  <td className="whitespace-nowrap px-6 py-4 text-xs text-slate-500">
                    {formatShortDateEn(ticket.createdAt)}
                  </td>

                  <td className="whitespace-nowrap px-6 py-4">
                    <MaintenanceStatusBadge step={ticket.currentStep} label={ticket.currentStepName} />
                  </td>

                  <td className="whitespace-nowrap px-6 py-4 text-right">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onView(ticket);
                      }}
                      disabled={isLoadingDetail}
                      title="View ticket details"
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
        summary={`Total ${totalCount} maintenance request(s)`}
        page={page}
        totalPages={totalPages}
        isLoading={isLoading}
        onPageChange={onPageChange}
      />
    </section>
  );
}

export default MaintenanceTable;
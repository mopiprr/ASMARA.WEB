import { ClipboardList, Eye } from 'lucide-react';

import TableEmptyState from '../../../components/common/table/TableEmptyState';
import TableErrorAlert from '../../../components/common/table/TableErrorAlert';
import TablePagination from '../../../components/common/table/TablePagination';
import TableSkeletonRows from '../../../components/common/table/TableSkeletonRows';
import TableToolbar from '../../../components/common/table/TableToolbar';
import { formatShortDateEn } from '../../../utils/formatters';

import type { MaintenanceTicketListItem } from '../types/maintenance.types';

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

const SKELETON_CELLS = [
  'h-4 w-28',
  'h-4 w-56',
  'h-4 w-24',
  'h-6 w-32 rounded-full',
];

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
      <TableToolbar
        title="My Maintenance Requests"
        description="View and track maintenance requests you have submitted."
        search={search}
        onSearchChange={onSearchChange}
        searchPlaceholder="Search requests..."
        isLoading={isLoading}
        onRefresh={onRefresh}
      />

      <TableErrorAlert error={error} onRetry={onRefresh} />

      <div className="overflow-x-auto">
        <table className="w-full min-w-[800px] text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-400">
            <tr>
              <th className="px-6 py-4 font-semibold">Ticket Number</th>
              <th className="px-6 py-4 font-semibold">Subject</th>
              <th className="px-6 py-4 font-semibold">Created Date</th>
              <th className="px-6 py-4 font-semibold">Current Step</th>
              <th className="px-6 py-4 text-center font-semibold">Action</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100">
            {isLoading ? (
              <TableSkeletonRows cells={SKELETON_CELLS} />
            ) : tickets.length === 0 ? (
              <TableEmptyState
                colSpan={5}
                icon={ClipboardList}
                isSearching={Boolean(search.trim())}
                searchTitle="No matching requests found"
                emptyTitle="No maintenance requests yet"
                emptyDescription="Your maintenance requests will appear here."
                onClearSearch={() => onSearchChange('')}
              />
            ) : (
              tickets.map((ticket) => (
                <tr key={ticket.id} className="transition hover:bg-slate-50/70">
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
                    {formatShortDateEn(ticket.createdAt)}
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

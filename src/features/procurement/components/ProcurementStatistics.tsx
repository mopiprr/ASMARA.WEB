
import {
  ClipboardList,
  RefreshCw,
} from 'lucide-react';

import type { ProcurementTicket } from '../types/procurement.types';

import {
  formatIDR,
  getTicketTotal,
  isCompletedTicket,
  isPendingTicket,
} from '../utils/procurement.utils';

interface ProcurementStatisticsProps {
  tickets: ProcurementTicket[];
}

function ProcurementStatistics({
  tickets,
}: ProcurementStatisticsProps) {
  const totalRequests = tickets.length;

  const pendingRequests = tickets.filter(
    isPendingTicket
  ).length;

  const completedRequests = tickets.filter(
    isCompletedTicket
  ).length;

  const totalEstimatedValue = tickets.reduce(
    (total, ticket) => total + getTicketTotal(ticket),
    0
  );

  return (
    <section className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">

      {/* TOTAL REQUESTS */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-slate-500">
            Total Requests
          </p>

          <ClipboardList
            className="text-blue-600"
            size={21}
          />
        </div>

        <p className="mt-3 text-2xl font-bold text-slate-800">
          {totalRequests}
        </p>
      </div>

      {/* ACTIVE REQUESTS */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-slate-500">
            Active Requests
          </p>

          <RefreshCw
            className="text-amber-500"
            size={21}
          />
        </div>

        <p className="mt-3 text-2xl font-bold text-slate-800">
          {pendingRequests}
        </p>
      </div>

      {/* COMPLETED REQUESTS */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-slate-500">
            Completed Requests
          </p>

          <ClipboardList
            className="text-green-600"
            size={21}
          />
        </div>

        <p className="mt-3 text-2xl font-bold text-slate-800">
          {completedRequests}
        </p>
      </div>

      {/* TOTAL ESTIMATED VALUE */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-slate-500">
            Total Estimated Value
          </p>

          <span className="text-lg font-bold text-blue-600">
            Rp
          </span>
        </div>

        <p className="mt-3 text-xl font-bold text-slate-800">
          {formatIDR(totalEstimatedValue)}
        </p>
      </div>

    </section>
  );
}

export default ProcurementStatistics;

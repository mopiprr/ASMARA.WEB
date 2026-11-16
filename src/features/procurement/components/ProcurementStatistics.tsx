import {
  ClipboardList,
  RefreshCw,
  CheckCircle2,
  XCircle,
} from 'lucide-react';

import type { MyTicketStatistics } from '../types/procurement.types';

interface ProcurementStatisticsProps {
  statistics: MyTicketStatistics | null;
  isLoading: boolean;
}

function ProcurementStatistics({
  statistics: data,
  isLoading,
}: ProcurementStatisticsProps) {
  // Angka dari backend; '...' saat loading, '-' kalau gagal.
  const show = (value: number | undefined) =>
    isLoading && !data ? '...' : value ?? '-';

  const statistics = [
    {
      title: 'Total Requests',
      value: show(data?.totalRequests),
      icon: ClipboardList,
      iconColor: 'text-blue-600',
    },
    {
      title: 'Active Requests',
      value: show(data?.activeRequests),
      icon: RefreshCw,
      iconColor: 'text-amber-500',
    },
    {
      title: 'Closed Requests',
      value: show(data?.closedRequests),
      icon: CheckCircle2,
      iconColor: 'text-green-600',
    },
    {
      title: 'Rejected Requests',
      value: show(data?.rejectedRequests),
      icon: XCircle,
      iconColor: 'text-red-600',
    },
  ];

  return (
    <section className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
      {statistics.map((stat) => {
        const Icon = stat.icon;

        return (
          <div
            key={stat.title}
            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
          >
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-slate-500">
                {stat.title}
              </p>

              <Icon
                className={stat.iconColor}
                size={21}
              />
            </div>

            <p className="mt-3 text-2xl font-bold text-slate-800">
              {stat.value}
            </p>
          </div>
        );
      })}
    </section>
  );
}

export default ProcurementStatistics;

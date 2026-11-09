import { ClipboardList, Wrench, Layers } from 'lucide-react';

interface TicketTypeDistributionChartProps {
  procurementCount: number;
  maintenanceCount: number;
  isLoading?: boolean;
}

export function TicketTypeDistributionChart({
  procurementCount,
  maintenanceCount,
  isLoading = false,
}: TicketTypeDistributionChartProps) {
  const total = procurementCount + maintenanceCount;
  const procurementPct = total > 0 ? Math.round((procurementCount / total) * 100) : 0;
  const maintenancePct = total > 0 ? 100 - procurementPct : 0;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      {/* HEADER */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
            <Layers size={20} />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-800">
              Workload by Ticket Type
            </h2>
            <p className="text-xs text-slate-500">
              Distribution ratio between Procurement and Maintenance requests
            </p>
          </div>
        </div>

        <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
          {total} Total Workload
        </span>
      </div>

      {isLoading ? (
        <div className="mt-8 flex animate-pulse flex-col items-center gap-8 sm:flex-row">
          <div className="h-44 w-44 rounded-full bg-slate-200" />
          <div className="w-full space-y-4">
            <div className="h-10 rounded-xl bg-slate-200" />
            <div className="h-10 rounded-xl bg-slate-200" />
          </div>
        </div>
      ) : (
        <div className="mt-6 flex flex-col items-center gap-8 sm:flex-row">
          {/* DONUT CHART (Procurement: Blue, Maintenance: Emerald Green) */}
          <div
            className="relative flex h-44 w-44 shrink-0 items-center justify-center rounded-full transition-all duration-700 shadow-xs"
            style={{
              background:
                total > 0
                  ? `conic-gradient(#2563eb 0% ${procurementPct}%, #10b981 ${procurementPct}% 100%)`
                  : '#f1f5f9',
            }}
          >
            <div className="flex h-28 w-28 flex-col items-center justify-center rounded-full bg-white shadow-inner">
              <span className="text-2xl font-bold text-slate-800">
                {total.toLocaleString()}
              </span>
              <span className="text-[11px] font-medium text-slate-400">
                All Tickets
              </span>
            </div>
          </div>

          {/* BREAKDOWN LIST */}
          <div className="w-full space-y-5">
            {/* PROCUREMENT (BLUE) */}
            <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-3.5 transition hover:bg-slate-50">
              <div className="mb-2 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-100 text-blue-700">
                    <ClipboardList size={15} />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-800">
                      Procurement Requests
                    </span>
                    <p className="text-[10px] text-slate-400">
                      Item acquisition & supply requests
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-sm font-bold text-slate-800">
                    {procurementCount}
                  </span>
                  <span className="ml-1 text-xs font-semibold text-blue-600">
                    ({procurementPct}%)
                  </span>
                </div>
              </div>

              <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200">
                <div
                  className="h-full rounded-full bg-blue-600 transition-all duration-700"
                  style={{ width: `${procurementPct}%` }}
                />
              </div>
            </div>

            {/* MAINTENANCE (EMERALD GREEN) */}
            <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-3.5 transition hover:bg-slate-50">
              <div className="mb-2 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700">
                    <Wrench size={15} />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-800">
                      Maintenance Requests
                    </span>
                    <p className="text-[10px] text-slate-400">
                      Equipment repair & asset servicing
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-sm font-bold text-slate-800">
                    {maintenanceCount}
                  </span>
                  <span className="ml-1 text-xs font-semibold text-emerald-600">
                    ({maintenancePct}%)
                  </span>
                </div>
              </div>

              <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200">
                <div
                  className="h-full rounded-full bg-emerald-500 transition-all duration-700"
                  style={{ width: `${maintenancePct}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default TicketTypeDistributionChart;

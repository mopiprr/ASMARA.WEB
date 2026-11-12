import {
  ClipboardList,
  Wrench,
  Layers,
  ChevronDown,
  ChevronUp,
  ArrowRight,
  AlertCircle,
  X,
} from 'lucide-react';

import type { StatCategory, TopTicketItem } from '../types/dashboard.types';

interface TicketTypeDistributionChartProps {
  procurementCount: number;
  maintenanceCount: number;
  isLoading?: boolean;
  activeKey: StatCategory | null;
  onToggle: (category: StatCategory) => void;
  tickets: TopTicketItem[];
  isTicketsLoading: boolean;
  ticketsError: string;
  onOpenTicket: (ticket: TopTicketItem) => void;
}

export function TicketTypeDistributionChart({
  procurementCount,
  maintenanceCount,
  isLoading = false,
  activeKey,
  onToggle,
  tickets,
  isTicketsLoading,
  ticketsError,
  onOpenTicket,
}: TicketTypeDistributionChartProps) {
  const total = procurementCount + maintenanceCount;
  const procurementPct = total > 0 ? Math.round((procurementCount / total) * 100) : 0;
  const maintenancePct = total > 0 ? 100 - procurementPct : 0;

  const isAccordionOpen = activeKey === 'procurement' || activeKey === 'maintenance';

  const getAccordionTitle = () => {
    return activeKey === 'procurement'
      ? 'Top 5 Pengajuan Procurement Terbaru'
      : 'Top 5 Pengajuan Maintenance Terbaru';
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all duration-300">
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
          <div className="w-full space-y-4">
            {/* PROCUREMENT (BLUE) */}
            <div
              onClick={() => onToggle('procurement')}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  onToggle('procurement');
                }
              }}
              className={`group cursor-pointer rounded-xl border p-3.5 transition-all duration-200 hover:border-slate-300 ${
                activeKey === 'procurement'
                  ? 'border-blue-400 ring-2 ring-blue-400/20 bg-blue-50/30'
                  : 'border-slate-100 bg-slate-50/50 hover:bg-slate-50'
              }`}
            >
              <div className="mb-2 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-100 text-blue-700">
                    <ClipboardList size={15} />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-slate-800">
                        Procurement Requests
                      </span>
                      {activeKey === 'procurement' ? (
                        <ChevronUp size={14} className="text-blue-600" />
                      ) : (
                        <ChevronDown
                          size={14}
                          className="text-slate-400 group-hover:text-slate-600 transition"
                        />
                      )}
                    </div>
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

              <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-200">
                <div
                  className="h-full rounded-full bg-blue-600 transition-all duration-700"
                  style={{ width: `${procurementPct}%` }}
                />
              </div>
            </div>

            {/* MAINTENANCE (EMERALD GREEN) */}
            <div
              onClick={() => onToggle('maintenance')}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  onToggle('maintenance');
                }
              }}
              className={`group cursor-pointer rounded-xl border p-3.5 transition-all duration-200 hover:border-slate-300 ${
                activeKey === 'maintenance'
                  ? 'border-emerald-400 ring-2 ring-emerald-400/20 bg-emerald-50/30'
                  : 'border-slate-100 bg-slate-50/50 hover:bg-slate-50'
              }`}
            >
              <div className="mb-2 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700">
                    <Wrench size={15} />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-slate-800">
                        Maintenance Requests
                      </span>
                      {activeKey === 'maintenance' ? (
                        <ChevronUp size={14} className="text-emerald-600" />
                      ) : (
                        <ChevronDown
                          size={14}
                          className="text-slate-400 group-hover:text-slate-600 transition"
                        />
                      )}
                    </div>
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

              <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-200">
                <div
                  className="h-full rounded-full bg-emerald-500 transition-all duration-700"
                  style={{ width: `${maintenancePct}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* INLINE ACCORDION: TOP 5 TICKETS BY TYPE */}
      {isAccordionOpen && (
        <div className="mt-6 border-t border-slate-100 pt-4 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="mb-3 flex items-center justify-between">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
              {getAccordionTitle()}
            </h4>
            <button
              type="button"
              onClick={() => onToggle(activeKey)}
              className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition"
              title="Tutup list tiket"
            >
              <X size={15} />
            </button>
          </div>

          {/* SKELETON */}
          {isTicketsLoading ? (
            <div className="space-y-2 py-1 animate-pulse">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-14 rounded-xl bg-slate-100" />
              ))}
            </div>
          ) : ticketsError ? (
            <div className="flex items-center justify-between rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-800">
              <div className="flex items-center gap-2">
                <AlertCircle size={15} className="text-rose-600" />
                <span>{ticketsError}</span>
              </div>
              <button
                type="button"
                onClick={() => onToggle(activeKey)}
                className="font-bold underline hover:no-underline"
              >
                Coba Lagi
              </button>
            </div>
          ) : tickets.length === 0 ? (
            <p className="py-4 text-center text-xs text-slate-400">
              Tidak ada tiket dalam kategori ini.
            </p>
          ) : (
            <div className="space-y-2">
              {tickets.map((ticket) => {
                const isProcurement = ticket.ticketType === 2;

                return (
                  <div
                    key={ticket.id}
                    className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50/50 p-2.5 transition hover:border-slate-300 hover:bg-white hover:shadow-xs"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span
                          className={`font-mono text-xs font-bold ${
                            isProcurement ? 'text-blue-600' : 'text-emerald-700'
                          }`}
                        >
                          {ticket.ticketNumber}
                        </span>

                        {/* WORKFLOW STEP BADGE (Differentiated for Type Card) */}
                        {ticket.currentStepName && (
                          <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-600">
                            {ticket.currentStepName}
                          </span>
                        )}
                      </div>

                      <p
                        className="mt-1 truncate text-xs font-medium text-slate-700"
                        title={ticket.subject}
                      >
                        {ticket.subject}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => onOpenTicket(ticket)}
                      className="inline-flex shrink-0 items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-slate-600 transition hover:bg-blue-50 hover:border-blue-200 hover:text-blue-600"
                    >
                      <span>Detail</span>
                      <ArrowRight size={13} />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default TicketTypeDistributionChart;

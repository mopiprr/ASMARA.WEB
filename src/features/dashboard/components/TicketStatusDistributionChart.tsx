import {
  Activity,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Clock,
  RotateCcw,
  PieChart,
  ArrowRight,
  AlertCircle,
  X,
  ClipboardList,
  Wrench,
} from 'lucide-react';

import { toPercent } from '../utils/dashboard.utils';

import type {
  StatCategory,
  TicketStatisticsResponse,
  TopTicketItem,
} from '../types/dashboard.types';

interface TicketStatusDistributionChartProps {
  stats: TicketStatisticsResponse;
  isApprover: boolean;
  isLoading?: boolean;
  activeKey: StatCategory | null;
  onToggle: (category: StatCategory) => void;
  tickets: TopTicketItem[];
  isTicketsLoading: boolean;
  ticketsError: string;
  onOpenTicket: (ticket: TopTicketItem) => void;
}

export function TicketStatusDistributionChart({
  stats,
  isApprover,
  isLoading = false,
  activeKey,
  onToggle,
  tickets,
  isTicketsLoading,
  ticketsError,
  onOpenTicket,
}: TicketStatusDistributionChartProps) {
  const total = stats.totalTickets;
  const pending = stats.pendingTickets;
  const inProgress = stats.inProgressTickets;
  const completed = stats.completedTickets;

  const pendingPct = toPercent(pending, total);
  const inProgressPct = toPercent(inProgress, total);
  const completedPct =
    total > 0
      ? Math.max(0, 100 - pendingPct - inProgressPct)
      : 0;

  // Conic gradient angles
  // Pending (Amber): 0% -> pendingPct%
  // In Progress (Violet): pendingPct% -> (pendingPct + inProgressPct)%
  // Completed (Emerald): (pendingPct + inProgressPct)% -> 100%
  const endPending = pendingPct;
  const endInProgress = pendingPct + inProgressPct;

  const isAccordionOpen =
    activeKey === 'pending' ||
    activeKey === 'in_progress' ||
    activeKey === 'completed';

  const getAccordionTitle = () => {
    switch (activeKey) {
      case 'pending':
        return isApprover
          ? 'Top 5 Tiket — Menunggu Approval Anda'
          : 'Top 5 Tiket — Perlu Revisi / Resubmit';
      case 'in_progress':
        return 'Top 5 Tiket — Sedang Diproses (In Progress)';
      case 'completed':
        return 'Top 5 Tiket — Telah Selesai (Completed)';
      default:
        return 'Top 5 Tiket';
    }
  };

  const statusItems = [
    {
      id: 'pending' as StatCategory,
      title: isApprover ? 'Pending Approval' : 'Need Revision',
      subtitle: isApprover
        ? 'Awaiting your review'
        : 'Returned for your revision',
      value: pending,
      percent: pendingPct,
      icon: isApprover ? Clock : RotateCcw,
      activeColor: 'border-amber-500 bg-amber-50/40',
      badgeBg: 'bg-amber-100 text-amber-700',
      barColor: 'bg-amber-500',
      textColor: 'text-amber-600',
    },
    {
      id: 'in_progress' as StatCategory,
      title: 'In Progress',
      subtitle: 'Currently being handled',
      value: inProgress,
      percent: inProgressPct,
      icon: Activity,
      activeColor: 'border-violet-500 bg-violet-50/40',
      badgeBg: 'bg-violet-100 text-violet-700',
      barColor: 'bg-violet-600',
      textColor: 'text-violet-600',
    },
    {
      id: 'completed' as StatCategory,
      title: 'Completed',
      subtitle: 'Resolved & closed tickets',
      value: completed,
      percent: completedPct,
      icon: CheckCircle2,
      activeColor: 'border-emerald-500 bg-emerald-50/40',
      badgeBg: 'bg-emerald-100 text-emerald-700',
      barColor: 'bg-emerald-600',
      textColor: 'text-emerald-600',
    },
  ];

  return (
    <div className="flex h-full flex-col rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
      {/* HEADER */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
            <PieChart size={20} />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-800">
              Ticket Status & Lifecycle
            </h2>
            <p className="text-xs text-slate-500">
              Status distribution across approval, processing, and completion
            </p>
          </div>
        </div>

        <span className="inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 border border-emerald-100">
          {completedPct}% Completed
        </span>
      </div>

      <div className="flex flex-1 flex-col justify-center py-4">
        {isLoading ? (
          <div className="flex flex-col items-center gap-8 sm:flex-row">
            <div className="h-44 w-44 shrink-0 rounded-full bg-slate-100" />
            <div className="w-full flex-1 space-y-3">
              <div className="h-12 rounded-xl bg-slate-100" />
              <div className="h-12 rounded-xl bg-slate-100" />
              <div className="h-12 rounded-xl bg-slate-100" />
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-8 sm:flex-row">
            {/* DONUT CHART */}
            <div
              className="relative flex h-44 w-44 shrink-0 items-center justify-center rounded-full"
              style={{
                background:
                  total > 0
                    ? `conic-gradient(#f59e0b 0% ${endPending}%, #8b5cf6 ${endPending}% ${endInProgress}%, #10b981 ${endInProgress}% 100%)`
                    : '#f1f5f9',
              }}
            >
              <div className="flex h-28 w-28 flex-col items-center justify-center rounded-full bg-white text-center px-1">
                <span className="text-2xl font-bold text-slate-800">
                  {total.toLocaleString()}
                </span>
                <span className="text-[11px] font-medium text-slate-400">
                  Total Tickets
                </span>
              </div>
            </div>

            {/* STATUS BREAKDOWN ROWS */}
            <div className="w-full flex-1 space-y-3">
            {statusItems.map((item) => {
              const Icon = item.icon;
              const isSelected = activeKey === item.id;

              return (
                <div
                  key={item.id}
                  onClick={() => onToggle(item.id)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      onToggle(item.id);
                    }
                  }}
                  className={`group cursor-pointer rounded-xl border p-3 transition-colors duration-100 hover:border-slate-300 ${
                    isSelected
                      ? item.activeColor
                      : 'border-slate-100 bg-slate-50/50 hover:bg-slate-50'
                  }`}
                >
                  <div className="mb-2 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div
                        className={`flex h-7 w-7 items-center justify-center rounded-lg ${item.badgeBg}`}
                      >
                        <Icon size={15} />
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-bold text-slate-800">
                            {item.title}
                          </span>
                          {isSelected ? (
                            <ChevronUp size={14} className={item.textColor} />
                          ) : (
                            <ChevronDown
                              size={14}
                              className="text-slate-400 group-hover:text-slate-600"
                            />
                          )}
                        </div>
                        <p className="text-[10px] text-slate-400">
                          {item.subtitle}
                        </p>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-sm font-bold text-slate-800">
                        {item.value}
                      </span>
                      <span className={`ml-1 text-xs font-semibold ${item.textColor}`}>
                        ({item.percent}%)
                      </span>
                    </div>
                  </div>

                  {/* MINI PROGRESS BAR */}
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-200">
                    <div
                      className={`h-full rounded-full ${item.barColor}`}
                      style={{ width: `${item.percent}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
      </div>

      {/* INLINE ACCORDION: TOP 5 TICKETS BY STATUS */}
      {isAccordionOpen && (
        <div className="mt-4 border-t border-slate-100 pt-4">
          <div className="mb-3 flex items-center justify-between">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
              {getAccordionTitle()}
            </h4>
            <button
              type="button"
              onClick={() => onToggle(activeKey)}
              className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              title="Tutup list tiket"
            >
              <X size={15} />
            </button>
          </div>

          {/* SKELETON */}
          {isTicketsLoading ? (
            <div className="space-y-2 py-1">
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
              Tidak ada tiket dalam status ini.
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
                        <span className="font-mono text-xs font-bold text-slate-700">
                          {ticket.ticketNumber}
                        </span>

                        {/* TICKET TYPE BADGE (Differentiated for Status Card) */}
                        <span
                          className={`inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[10px] font-semibold ${
                            isProcurement
                              ? 'bg-blue-50 text-blue-700'
                              : 'bg-emerald-50 text-emerald-700'
                          }`}
                        >
                          {isProcurement ? (
                            <ClipboardList size={11} />
                          ) : (
                            <Wrench size={11} />
                          )}
                          <span>
                            {isProcurement ? 'Procurement' : 'Maintenance'}
                          </span>
                        </span>
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

export default TicketStatusDistributionChart;

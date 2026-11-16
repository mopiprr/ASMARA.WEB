import {
  Activity,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Clock,
  RotateCcw,
  Ticket,
} from 'lucide-react';

import type {
  StatCategory,
  TicketStatisticsResponse,
} from '../types/dashboard.types';

interface TicketStatisticsCardsProps {
  stats: TicketStatisticsResponse;
  isApprover: boolean;
  isLoading: boolean;
  activeCategory: StatCategory | null;
  onToggle: (category: StatCategory) => void;
}

function TicketStatisticsCards({
  stats,
  isApprover,
  isLoading,
  activeCategory,
  onToggle,
}: TicketStatisticsCardsProps) {
  const cards = [
    {
      id: 'total' as StatCategory,
      title: 'Total Tickets',
      value: stats.totalTickets,
      description: 'All tickets submitted by you',
      icon: Ticket,
      style: 'bg-blue-100 text-blue-600',
    },
    {
      id: 'pending' as StatCategory,
      title: isApprover ? 'Pending Approval' : 'Need Revision',
      value: stats.pendingTickets,
      description: isApprover
        ? 'Waiting for your approval'
        : 'Tickets returned for your revision',
      icon: isApprover ? Clock : RotateCcw,
      style: 'bg-amber-100 text-amber-600',
    },
    {
      id: 'in_progress' as StatCategory,
      title: 'In Progress',
      value: stats.inProgressTickets,
      description: 'Tickets currently being processed',
      icon: Activity,
      style: 'bg-violet-100 text-violet-600',
    },
    {
      id: 'completed' as StatCategory,
      title: 'Completed',
      value: stats.completedTickets,
      description: 'Resolved and completed tickets',
      icon: CheckCircle2,
      style: 'bg-emerald-100 text-emerald-600',
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map((item) => {
        const Icon = item.icon;
        const isSelected = activeCategory === item.id;

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
            className={`group cursor-pointer rounded-2xl border bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-md ${
              isSelected
                ? 'border-blue-500 ring-2 ring-blue-500/20 bg-blue-50/10'
                : 'border-slate-200 hover:border-slate-300'
            } ${isLoading ? 'opacity-70' : ''}`}
          >
            <div className="flex items-start justify-between">
              <div
                className={`flex h-12 w-12 items-center justify-center rounded-xl transition ${
                  isSelected ? 'scale-105' : ''
                } ${item.style}`}
              >
                <Icon size={23} />
              </div>

              {isSelected ? (
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-100 text-blue-600">
                  <ChevronUp size={16} />
                </span>
              ) : (
                <span className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 group-hover:bg-slate-100 group-hover:text-slate-600 transition">
                  <ChevronDown size={16} />
                </span>
              )}
            </div>

            <p className="mt-5 text-sm font-medium text-slate-500 group-hover:text-slate-700 transition">
              {item.title}
            </p>

            <h3 className="mt-2 text-3xl font-bold text-slate-800">
              {item.value.toLocaleString('en-US')}
            </h3>

            <div className="mt-2 flex items-center justify-between">
              <p className="text-xs text-slate-400">
                {item.description}
              </p>
              <span
                className={`text-[11px] font-semibold transition ${
                  isSelected
                    ? 'text-blue-600'
                    : 'text-slate-400 group-hover:text-blue-600'
                }`}
              >
                {isSelected ? 'Tutup ▲' : 'Top 5 ▼'}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default TicketStatisticsCards;
import { CheckCircle2 } from 'lucide-react';

import { toPercent } from '../utils/dashboard.utils';

import type { TicketStatisticsResponse } from '../types/dashboard.types';

interface ResolutionPerformanceCardProps {
  stats: TicketStatisticsResponse;
  isApprover: boolean;
}

function getHealthStatus(total: number, resolutionRate: number) {
  if (total === 0) {
    return {
      label: 'No Tickets',
      badge: 'bg-slate-100 text-slate-600 border-slate-200',
      description: 'No ticket volume recorded in this timeframe.',
    };
  }

  if (resolutionRate >= 70) {
    return {
      label: 'Optimal',
      badge: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      description: 'High completion efficiency across your scope.',
    };
  }

  if (resolutionRate >= 40) {
    return {
      label: 'On Track',
      badge: 'bg-blue-50 text-blue-700 border-blue-200',
      description: 'Steady progress; active tickets being handled.',
    };
  }

  return {
    label: 'Needs Attention',
    badge: 'bg-amber-50 text-amber-700 border-amber-200',
    description: 'Multiple active tickets are awaiting completion.',
  };
}

// Satu baris progress bar (Completed / In Progress / Pending).
function ProgressRow({
  label,
  value,
  percent,
  color,
}: {
  label: string;
  value: number;
  percent: number;
  color: string;
}) {
  return (
    <div>
      <div className="flex items-center justify-between text-xs font-medium">
        <span className="flex items-center gap-1.5 text-slate-700">
          <span className={`h-2 w-2 rounded-full ${color}`} />
          {label}
        </span>
        <span className="font-bold text-slate-800">
          {value.toLocaleString('en-US')}{' '}
          <span className="text-slate-400 font-normal">({percent}%)</span>
        </span>
      </div>
      <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-slate-100">
        <div
          className={`h-full rounded-full transition-all duration-500 ${color}`}
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}

function ResolutionPerformanceCard({ stats, isApprover }: ResolutionPerformanceCardProps) {
  const total = stats.totalTickets;

  const resolutionRate = toPercent(stats.completedTickets, total);
  const inProgressRate = toPercent(stats.inProgressTickets, total);
  const pendingRate = toPercent(stats.pendingTickets, total);

  const health = getHealthStatus(total, resolutionRate);

  return (
    <div className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div>
        {/* Card Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
              <CheckCircle2 size={22} />
            </div>

            <div>
              <h2 className="font-bold text-slate-800">
                Resolution Performance
              </h2>
              <p className="text-xs text-slate-500">
                Your personal ticket resolution efficiency
              </p>
            </div>
          </div>

          <span className={`rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${health.badge}`}>
            {health.label}
          </span>
        </div>

        {/* Circular Progress Ring */}
        <div className="mt-5 flex items-center gap-5 rounded-2xl bg-gradient-to-br from-slate-50 to-slate-100/60 p-4 border border-slate-100">
          <div className="relative flex h-20 w-20 shrink-0 items-center justify-center">
            <svg className="h-full w-full -rotate-90" viewBox="0 0 36 36">
              <path
                className="text-slate-200"
                strokeWidth="3.5"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                className="text-emerald-500 transition-all duration-700 ease-out"
                strokeDasharray={`${resolutionRate}, 100`}
                strokeWidth="3.5"
                strokeLinecap="round"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>
            <div className="absolute flex flex-col items-center justify-center">
              <span className="font-mono text-base font-bold text-slate-800">
                {resolutionRate}%
              </span>
              <span className="text-[9px] font-semibold text-slate-400 uppercase">
                Solved
              </span>
            </div>
          </div>

          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Resolution Rate
            </p>
            <p className="mt-1 text-sm font-bold text-slate-800">
              {stats.completedTickets.toLocaleString('en-US')}{' '}
              <span className="text-xs font-normal text-slate-500">
                of {total.toLocaleString('en-US')} tickets completed
              </span>
            </p>
            <p className="mt-1 text-xs text-slate-500 leading-snug">
              {health.description}
            </p>
          </div>
        </div>

        {/* Progress Breakdown */}
        <div className="mt-5 space-y-3.5">
          <ProgressRow
            label="Completed"
            value={stats.completedTickets}
            percent={resolutionRate}
            color="bg-emerald-500"
          />
          <ProgressRow
            label="In Progress"
            value={stats.inProgressTickets}
            percent={inProgressRate}
            color="bg-violet-500"
          />
          <ProgressRow
            label={isApprover ? 'Pending Approval' : 'Need Revision'}
            value={stats.pendingTickets}
            percent={pendingRate}
            color="bg-amber-500"
          />
        </div>
      </div>

      {/* Scope Footer */}
      <div className="mt-5 border-t border-slate-100 pt-3 text-[11px] text-slate-400">
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-slate-400" />
          Personal scope: Based on your submitted requests
        </span>
      </div>
    </div>
  );
}

export default ResolutionPerformanceCard;
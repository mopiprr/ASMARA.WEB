import { useState } from 'react';
import {
  CheckCircle2,
  ClipboardList,
  RefreshCw,
  XCircle,
} from 'lucide-react';

import type { MaintenanceStatisticsData } from '../types/maintenance.types';

interface MaintenanceStatisticsProps {
  statistics: MaintenanceStatisticsData | null;
  isLoading: boolean;
}

type StatusKey = 'active' | 'completed' | 'rejected' | null;

function MaintenanceStatistics({
  statistics: data,
  isLoading,
}: MaintenanceStatisticsProps) {
  const [hoveredKey, setHoveredKey] = useState<StatusKey>(null);

  if (isLoading && !data) {
    return (
      <section className="grid grid-cols-1 gap-4 lg:grid-cols-12">
        <div className="h-52 animate-pulse rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs lg:col-span-4" />
        <div className="h-52 animate-pulse rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs lg:col-span-8" />
      </section>
    );
  }

  const show = (value: number | undefined) =>
    isLoading && !data ? '...' : value ?? '-';

  const total = data?.totalRequests ?? 0;
  const active = data?.activeRequests ?? 0;
  const rejected = data?.rejectedRequests ?? 0;

  // Pisahkan tiket Completed murni dari Rejected (jika API masih menggabungkannya di closedRequests)
  const rawStats = data as (MaintenanceStatisticsData & {
    completedTickets?: number;
    completedRequests?: number;
  }) | null;

  const completed =
    rawStats?.completedTickets !== undefined
      ? rawStats.completedTickets
      : rawStats?.completedRequests !== undefined
        ? rawStats.completedRequests
        : data?.closedRequests !== undefined
          ? Math.max(0, data.closedRequests - rejected)
          : 0;

  const displayCompleted =
    isLoading && !data
      ? '...'
      : data
        ? completed
        : '-';

  const denominator = Math.max(total, active + completed + rejected, 1);
  const hasAnyData = total > 0 || active + completed + rejected > 0;

  const items = [
    {
      key: 'active' as const,
      title: 'Active Requests',
      value: show(data?.activeRequests),
      raw: active,
      pct: hasAnyData ? (active / denominator) * 100 : 0,
      color: '#8b5cf6', // Violet 500
      barBg: 'bg-violet-500',
      badgeBg: 'border-violet-200/80 bg-violet-50 text-violet-600',
      icon: RefreshCw,
    },
    {
      key: 'completed' as const,
      title: 'Completed Tickets',
      value: displayCompleted,
      raw: completed,
      pct: hasAnyData ? (completed / denominator) * 100 : 0,
      color: '#10b981', // Emerald 500
      barBg: 'bg-emerald-500',
      badgeBg: 'border-emerald-200/80 bg-emerald-50 text-emerald-600',
      icon: CheckCircle2,
    },
    {
      key: 'rejected' as const,
      title: 'Rejected Requests',
      value: show(data?.rejectedRequests),
      raw: rejected,
      pct: hasAnyData ? (rejected / denominator) * 100 : 0,
      color: '#ef4444', // Rose 500
      barBg: 'bg-rose-500',
      badgeBg: 'border-rose-200/80 bg-rose-50 text-rose-600',
      icon: XCircle,
    },
  ];

  // Parameter SVG Donut Chart
  const size = 148;
  const strokeWidth = 16;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  let accumulatedPct = 0;
  const ringSegments = items.map((item) => {
    const dashLength = (item.pct / 100) * circumference;
    const dashOffset = -((accumulatedPct / 100) * circumference);
    accumulatedPct += item.pct;
    return { ...item, dashLength, dashOffset };
  });

  const focusedItem = items.find((i) => i.key === hoveredKey);

  return (
    <section className="grid grid-cols-1 gap-4 lg:grid-cols-12">
      {/* KIRI: DONUT SUMMARY CARD */}
      <div className="flex flex-col justify-between rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs lg:col-span-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
              <ClipboardList size={17} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Maintenance Tickets
              </h3>
              <p className="text-[11px] text-slate-400">
                Distribusi status tiket Anda
              </p>
            </div>
          </div>
        </div>

        {/* SVG Donut Ring */}
        <div className="relative my-3 flex items-center justify-center">
          <svg
            width={size}
            height={size}
            viewBox={`0 0 ${size} ${size}`}
            className="-rotate-90 overflow-visible"
          >
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke="#f1f5f9"
              strokeWidth={strokeWidth}
            />

            {ringSegments.map((seg) => {
              if (seg.pct <= 0) return null;
              const isHovered = hoveredKey === seg.key;
              const isDimmed = hoveredKey !== null && !isHovered;

              return (
                <circle
                  key={seg.key}
                  cx={size / 2}
                  cy={size / 2}
                  r={radius}
                  fill="none"
                  stroke={seg.color}
                  strokeWidth={isHovered ? strokeWidth + 3 : strokeWidth}
                  strokeDasharray={`${Math.max(seg.dashLength - 2, 0)} ${circumference}`}
                  strokeDashoffset={seg.dashOffset}
                  strokeLinecap="round"
                  onMouseEnter={() => setHoveredKey(seg.key)}
                  onMouseLeave={() => setHoveredKey(null)}
                  className="cursor-pointer transition-all duration-300"
                  style={{ opacity: isDimmed ? 0.35 : 1 }}
                />
              );
            })}
          </svg>

          {/* Center Value */}
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
              {focusedItem ? focusedItem.title.split(' ')[0] : 'Total Requests'}
            </span>
            <span className="mt-0.5 text-2xl font-extrabold tracking-tight text-slate-900">
              {focusedItem ? focusedItem.value : show(data?.totalRequests)}
            </span>
            <span className="text-[10px] font-medium text-slate-500">
              {focusedItem
                ? `${focusedItem.pct.toFixed(0)}% of total`
                : 'All tickets'}
            </span>
          </div>
        </div>

        {/* Mini Legend */}
        <div className="flex items-center justify-center gap-4 border-t border-slate-100 pt-2.5 text-[11px]">
          {items.map((item) => (
            <button
              key={item.key}
              type="button"
              onMouseEnter={() => setHoveredKey(item.key)}
              onMouseLeave={() => setHoveredKey(null)}
              className={`flex items-center gap-1.5 transition-opacity ${
                hoveredKey && hoveredKey !== item.key
                  ? 'opacity-45'
                  : 'opacity-100'
              }`}
            >
              <span className={`h-2 w-2 rounded-full ${item.barBg}`} />
              <span className="font-medium text-slate-600">
                {item.title.split(' ')[0]}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* KANAN: STACKED DISTRIBUTION & STATUS CARDS */}
      <div className="flex flex-col justify-between rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs lg:col-span-8">
        {/* Top Stacked Proportion Bar */}
        <div>
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-slate-800">
              Ticket Status Breakdown
            </span>
            <span className="font-semibold text-slate-500">
              Total:{' '}
              <strong className="text-slate-900">
                {show(data?.totalRequests)}
              </strong>{' '}
              requests
            </span>
          </div>

          <div className="mt-2.5 flex h-2.5 w-full overflow-hidden rounded-full bg-slate-100">
            {items.map((item) =>
              item.pct > 0 ? (
                <div
                  key={item.key}
                  style={{ width: `${item.pct}%` }}
                  className={`${item.barBg} transition-all duration-500`}
                  title={`${item.title}: ${item.value} (${item.pct.toFixed(1)}%)`}
                />
              ) : null
            )}
          </div>
        </div>

        {/* 3 Status Detail Cards */}
        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
          {items.map((item) => {
            const Icon = item.icon;
            const isHovered = hoveredKey === item.key;

            return (
              <div
                key={item.key}
                onMouseEnter={() => setHoveredKey(item.key)}
                onMouseLeave={() => setHoveredKey(null)}
                className={`cursor-pointer rounded-xl border p-4 transition-all duration-200 ${
                  isHovered
                    ? 'border-slate-300 bg-slate-50/90 shadow-xs'
                    : 'border-slate-100 bg-slate-50/40 hover:border-slate-200 hover:bg-white'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span
                    className={`flex h-8 w-8 items-center justify-center rounded-lg border ${item.badgeBg}`}
                  >
                    <Icon size={16} />
                  </span>
                  <span className="rounded-md bg-white px-2 py-0.5 text-[11px] font-bold text-slate-600 ring-1 ring-slate-200/70">
                    {item.pct.toFixed(0)}%
                  </span>
                </div>

                <p className="mt-3 text-2xl font-extrabold tracking-tight text-slate-900">
                  {item.value}
                </p>
                <p className="mt-0.5 text-xs font-semibold text-slate-700">
                  {item.title}
                </p>
                {/* Individual Progress Bar */}
                <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-slate-200/70">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${item.barBg}`}
                    style={{ width: `${Math.min(item.pct, 100)}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default MaintenanceStatistics;
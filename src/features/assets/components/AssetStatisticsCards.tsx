import { useState } from 'react';
import {
  Package,
  CheckCircle2,
  UserRound,
  Wrench,
  FilterX,
} from 'lucide-react';

import type { AssetStatistics } from '../types/asset.types';

interface AssetStatisticsCardsProps {
  statistics: AssetStatistics | null;
  isLoading: boolean;
  activeStatus: string; // '' = semua status
  onSelectStatus: (status: string) => void;
}

type StatusKey = '1' | '2' | '3' | null;

function AssetStatisticsCards({
  statistics,
  isLoading,
  activeStatus,
  onSelectStatus,
}: AssetStatisticsCardsProps) {
  const [hoveredKey, setHoveredKey] = useState<StatusKey>(null);

  if (isLoading && !statistics) {
    return (
      <section className="grid grid-cols-1 gap-4 lg:grid-cols-12">
        <div className="h-56 animate-pulse rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs lg:col-span-4" />
        <div className="h-56 animate-pulse rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs lg:col-span-8" />
      </section>
    );
  }

  const total = statistics?.totalAssets ?? 0;
  const available = statistics?.available ?? 0;
  const inUse = statistics?.inUse ?? 0;
  const maintenance = statistics?.underMaintenance ?? 0;

  const denominator = Math.max(total, available + inUse + maintenance, 1);
  const hasData = total > 0 || available + inUse + maintenance > 0;

  const statusSegments = [
    {
      status: '1' as const,
      title: 'Available',
      subtitle: 'Ready in warehouse',
      value: statistics?.available,
      raw: available,
      pct: hasData ? (available / denominator) * 100 : 0,
      color: '#10b981', // Emerald 500
      barBg: 'bg-emerald-500',
      iconStyle: 'border-emerald-200/80 bg-emerald-50 text-emerald-600',
      activeStyle:
        'border-emerald-400 bg-emerald-50/40 ring-2 ring-emerald-500/15',
      icon: CheckCircle2,
    },
    {
      status: '2' as const,
      title: 'In Use',
      subtitle: 'Assigned / shared',
      value: statistics?.inUse,
      raw: inUse,
      pct: hasData ? (inUse / denominator) * 100 : 0,
      color: '#6366f1', // Indigo 500
      barBg: 'bg-indigo-500',
      iconStyle: 'border-indigo-200/80 bg-indigo-50 text-indigo-600',
      activeStyle:
        'border-indigo-400 bg-indigo-50/40 ring-2 ring-indigo-500/15',
      icon: UserRound,
    },
    {
      status: '3' as const,
      title: 'Maintenance',
      subtitle: 'Being repaired',
      value: statistics?.underMaintenance,
      raw: maintenance,
      pct: hasData ? (maintenance / denominator) * 100 : 0,
      color: '#f59e0b', // Amber 500
      barBg: 'bg-amber-500',
      iconStyle: 'border-amber-200/80 bg-amber-50 text-amber-600',
      activeStyle:
        'border-amber-400 bg-amber-50/40 ring-2 ring-amber-500/15',
      icon: Wrench,
    },
  ];

  // Parameter SVG Donut Chart
  const size = 152;
  const strokeWidth = 17;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  let accumulatedPct = 0;
  const ringSegments = statusSegments.map((seg) => {
    const dashLength = (seg.pct / 100) * circumference;
    const dashOffset = -((accumulatedPct / 100) * circumference);
    accumulatedPct += seg.pct;
    return { ...seg, dashLength, dashOffset };
  });

  const activeOrHoveredKey =
    hoveredKey ??
    (['1', '2', '3'].includes(activeStatus)
      ? (activeStatus as StatusKey)
      : null);
  const focusedSegment = statusSegments.find(
    (s) => s.status === activeOrHoveredKey
  );

  const handleToggle = (status: string) => {
    onSelectStatus(activeStatus === status && status !== '' ? '' : status);
  };

  return (
    <section className="grid grid-cols-1 gap-4 lg:grid-cols-12">
      {/* KIRI: INTERACTIVE DONUT RING */}
      <div className="flex flex-col justify-between rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs lg:col-span-4">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
              <Package size={17} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Asset Allocation
              </h3>
              <p className="text-[11px] text-slate-400">
                Klik segmen untuk filter status
              </p>
            </div>
          </div>

          {activeStatus !== '' && (
            <button
              type="button"
              onClick={() => onSelectStatus('')}
              className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-slate-50 px-2 py-1 text-[10px] font-semibold text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
              title="Reset filter status"
            >
              <FilterX size={11} />
              Reset
            </button>
          )}
        </div>

        {/* SVG Donut */}
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
              const isHighlighted = activeOrHoveredKey === seg.status;
              const isDimmed =
                activeOrHoveredKey !== null && !isHighlighted;

              return (
                <circle
                  key={seg.status}
                  cx={size / 2}
                  cy={size / 2}
                  r={radius}
                  fill="none"
                  stroke={seg.color}
                  strokeWidth={isHighlighted ? strokeWidth + 3 : strokeWidth}
                  strokeDasharray={`${Math.max(seg.dashLength - 2, 0)} ${circumference}`}
                  strokeDashoffset={seg.dashOffset}
                  strokeLinecap="round"
                  onMouseEnter={() => setHoveredKey(seg.status)}
                  onMouseLeave={() => setHoveredKey(null)}
                  onClick={() => handleToggle(seg.status)}
                  className="cursor-pointer transition-all duration-300"
                  style={{ opacity: isDimmed ? 0.35 : 1 }}
                />
              );
            })}
          </svg>

          {/* Center Value */}
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
              {focusedSegment ? focusedSegment.title : 'Total Assets'}
            </span>
            <span className="mt-0.5 text-2xl font-extrabold tracking-tight text-slate-900">
              {focusedSegment
                ? focusedSegment.value !== undefined
                  ? focusedSegment.value.toLocaleString('en-US')
                  : '—'
                : statistics?.totalAssets !== undefined
                  ? statistics.totalAssets.toLocaleString('en-US')
                  : '—'}
            </span>
            <span className="text-[10px] font-medium text-slate-500">
              {focusedSegment
                ? `${focusedSegment.pct.toFixed(0)}% of fleet`
                : 'Registered units'}
            </span>
          </div>
        </div>

        {/* Mini Legend */}
        <div className="flex items-center justify-center gap-4 border-t border-slate-100 pt-2.5 text-[11px]">
          {statusSegments.map((seg) => (
            <button
              key={seg.status}
              type="button"
              onMouseEnter={() => setHoveredKey(seg.status)}
              onMouseLeave={() => setHoveredKey(null)}
              onClick={() => handleToggle(seg.status)}
              className={`flex items-center gap-1.5 transition-opacity ${
                activeOrHoveredKey && activeOrHoveredKey !== seg.status
                  ? 'opacity-45'
                  : 'opacity-100'
              }`}
            >
              <span className={`h-2 w-2 rounded-full ${seg.barBg}`} />
              <span className="font-medium text-slate-600">{seg.title}</span>
            </button>
          ))}
        </div>
      </div>

      {/* KANAN: TOTAL HEADER + 3 CLICKABLE FILTER CARDS */}
      <div className="flex flex-col justify-between rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs lg:col-span-8">
        {/* Top Bar: Total Assets Filter Button & Stacked Proportion Bar */}
        <div className="flex flex-col gap-3 rounded-xl border border-slate-100 bg-slate-50/70 p-3.5 sm:flex-row sm:items-center sm:justify-between">
          <button
            type="button"
            onClick={() => onSelectStatus('')}
            className={`flex items-center gap-3 rounded-lg px-2 py-1 text-left transition ${
              activeStatus === ''
                ? 'bg-white shadow-2xs ring-1 ring-blue-200'
                : 'hover:bg-white/70'
            }`}
          >
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-blue-700 to-teal-600 text-white">
              <Package size={18} />
            </div>
            <div>
              <p className="text-[11px] font-medium text-slate-500">
                Total Registered Assets
              </p>
              <p className="text-lg font-extrabold leading-tight text-slate-900">
                {statistics?.totalAssets !== undefined
                  ? statistics.totalAssets.toLocaleString('en-US')
                  : '—'}{' '}
                <span className="text-xs font-normal text-slate-400">units</span>
              </p>
            </div>
          </button>

          {/* Stacked Bar */}
          <div className="w-full sm:w-56">
            <div className="mb-1 flex justify-between text-[11px] font-medium text-slate-500">
              <span>Fleet Composition</span>
              <span className="font-semibold text-slate-700">100%</span>
            </div>
            <div className="flex h-2.5 w-full overflow-hidden rounded-full bg-slate-200/80">
              {statusSegments.map((seg) =>
                seg.pct > 0 ? (
                  <div
                    key={seg.status}
                    style={{ width: `${seg.pct}%` }}
                    className={`${seg.barBg} transition-all duration-500`}
                    title={`${seg.title}: ${seg.raw} (${seg.pct.toFixed(1)}%)`}
                  />
                ) : null
              )}
            </div>
          </div>
        </div>

        {/* 3 Clickable Status Filter Cards */}
        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
          {statusSegments.map((seg) => {
            const Icon = seg.icon;
            const isSelected = activeStatus === seg.status;

            return (
              <button
                key={seg.status}
                type="button"
                onMouseEnter={() => setHoveredKey(seg.status)}
                onMouseLeave={() => setHoveredKey(null)}
                onClick={() => handleToggle(seg.status)}
                className={`flex flex-col rounded-xl border p-4 text-left transition-all duration-200 ${
                  isSelected
                    ? seg.activeStyle
                    : 'border-slate-100 bg-slate-50/40 hover:border-slate-200 hover:bg-white hover:shadow-2xs'
                }`}
              >
                <div className="flex w-full items-center justify-between">
                  <span
                    className={`flex h-8 w-8 items-center justify-center rounded-lg border ${seg.iconStyle}`}
                  >
                    <Icon size={16} />
                  </span>
                  <span className="rounded-md bg-white px-2 py-0.5 text-[11px] font-bold text-slate-600 ring-1 ring-slate-200/70">
                    {seg.pct.toFixed(0)}%
                  </span>
                </div>

                <p className="mt-3 text-2xl font-extrabold tracking-tight text-slate-900">
                  {seg.value !== undefined
                    ? seg.value.toLocaleString('en-US')
                    : '—'}
                </p>
                <p className="mt-0.5 text-xs font-semibold text-slate-700">
                  {seg.title}
                </p>
                <p className="text-[11px] text-slate-400">{seg.subtitle}</p>

                {/* Individual Progress Bar */}
                <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-slate-200/70">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${seg.barBg}`}
                    style={{ width: `${Math.min(seg.pct, 100)}%` }}
                  />
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default AssetStatisticsCards;
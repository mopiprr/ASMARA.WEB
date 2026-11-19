import { useState } from 'react';
import {
  Package,
  Boxes,
  AlertTriangle,
  AlertOctagon,
  Lock,
  FilterX,
} from 'lucide-react';
import type {
  InventorySummary,
  StockStatusFilter,
} from '../types/inventory.types';

interface InventoryStatisticsProps {
  summary: InventorySummary;
  activeStockFilter: StockStatusFilter;
  onSelectFilter: (filter: StockStatusFilter) => void;
  isRestricted?: boolean;
}

type SegmentFilter = Exclude<StockStatusFilter, 'all'> | null;

export function InventoryStatistics({
  summary,
  activeStockFilter,
  onSelectFilter,
  isRestricted = false,
}: InventoryStatisticsProps) {
  const [hoveredFilter, setHoveredFilter] = useState<SegmentFilter>(null);

  const totalSkus = isRestricted ? 0 : summary.totalSkus;
  const lowStock = isRestricted ? 0 : summary.lowStockCount;
  const outOfStock = isRestricted ? 0 : summary.outOfStockCount;
  // SKU sehat (In Stock >= 5 unit)
  const healthySkus = isRestricted
    ? 0
    : Math.max(0, totalSkus - lowStock - outOfStock);

  const denominator = Math.max(totalSkus, healthySkus + lowStock + outOfStock, 1);
  const hasData = !isRestricted && totalSkus > 0;

  const segments = [
    {
      filter: 'in_stock' as const,
      title: 'In Stock (Healthy)',
      shortLabel: 'In Stock',
      subtitle: isRestricted
        ? 'Restricted to Inventory dept'
        : `${summary.totalUnits.toLocaleString()} total units on hand`,
      value: isRestricted ? null : summary.totalUnits,
      unitLabel: 'units',
      skuCount: healthySkus,
      pct: hasData ? (healthySkus / denominator) * 100 : 0,
      color: '#10b981', // Emerald 500
      barBg: 'bg-emerald-500',
      iconStyle: 'border-emerald-200/80 bg-emerald-50 text-emerald-600',
      activeStyle:
        'border-emerald-400 bg-emerald-50/40 ring-2 ring-emerald-500/15',
      icon: Boxes,
    },
    {
      filter: 'low_stock' as const,
      title: 'Low Stock Alert',
      shortLabel: 'Low Stock',
      subtitle: isRestricted
        ? 'Restricted to Inventory dept'
        : 'Running low (< 5 units)',
      value: isRestricted ? null : summary.lowStockCount,
      unitLabel: 'SKUs',
      skuCount: lowStock,
      pct: hasData ? (lowStock / denominator) * 100 : 0,
      color: '#f59e0b', // Amber 500
      barBg: 'bg-amber-500',
      iconStyle: 'border-amber-200/80 bg-amber-50 text-amber-600',
      activeStyle:
        'border-amber-400 bg-amber-50/40 ring-2 ring-amber-500/15',
      icon: AlertTriangle,
    },
    {
      filter: 'out_of_stock' as const,
      title: 'Out of Stock',
      shortLabel: 'Out of Stock',
      subtitle: isRestricted
        ? 'Restricted to Inventory dept'
        : 'Depleted / zero stock',
      value: isRestricted ? null : summary.outOfStockCount,
      unitLabel: 'SKUs',
      skuCount: outOfStock,
      pct: hasData ? (outOfStock / denominator) * 100 : 0,
      color: '#ef4444', // Rose 500
      barBg: 'bg-rose-500',
      iconStyle: 'border-rose-200/80 bg-rose-50 text-rose-600',
      activeStyle:
        'border-rose-400 bg-rose-50/40 ring-2 ring-rose-500/15',
      icon: AlertOctagon,
    },
  ];

  // Parameter SVG Donut Chart
  const size = 152;
  const strokeWidth = 17;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  let accumulatedPct = 0;
  const ringSegments = segments.map((seg) => {
    const dashLength = (seg.pct / 100) * circumference;
    const dashOffset = -((accumulatedPct / 100) * circumference);
    accumulatedPct += seg.pct;
    return { ...seg, dashLength, dashOffset };
  });

  const activeOrHovered: SegmentFilter = isRestricted
    ? null
    : hoveredFilter ??
      (activeStockFilter !== 'all' ? activeStockFilter : null);

  const focusedSegment = segments.find((s) => s.filter === activeOrHovered);

  const handleToggleFilter = (filter: StockStatusFilter) => {
    if (isRestricted) return;
    if (activeStockFilter === filter && filter !== 'all') {
      onSelectFilter('all');
    } else {
      onSelectFilter(filter);
    }
  };

  return (
    <section className="grid grid-cols-1 gap-4 lg:grid-cols-12">
      {/* KIRI: STOCK HEALTH DONUT RING */}
      <div className="flex flex-col justify-between rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs lg:col-span-4">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <div
              className={`flex h-8 w-8 items-center justify-center rounded-lg ${
                isRestricted
                  ? 'bg-amber-50 text-amber-600'
                  : 'bg-blue-50 text-blue-600'
              }`}
            >
              {isRestricted ? <Lock size={16} /> : <Package size={17} />}
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Catalog Health
              </h3>
              <p className="text-[11px] text-slate-400">
                {isRestricted
                  ? 'Akses khusus Departemen Inventory'
                  : 'Klik segmen untuk filter kondisi'}
              </p>
            </div>
          </div>

          {!isRestricted && activeStockFilter !== 'all' && (
            <button
              type="button"
              onClick={() => onSelectFilter('all')}
              className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-slate-50 px-2 py-1 text-[10px] font-semibold text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
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

            {!isRestricted &&
              ringSegments.map((seg) => {
                if (seg.pct <= 0) return null;
                const isHighlighted = activeOrHovered === seg.filter;
                const isDimmed =
                  activeOrHovered !== null && !isHighlighted;

                return (
                  <circle
                    key={seg.filter}
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    fill="none"
                    stroke={seg.color}
                    strokeWidth={isHighlighted ? strokeWidth + 3 : strokeWidth}
                    strokeDasharray={`${Math.max(seg.dashLength - 2, 0)} ${circumference}`}
                    strokeDashoffset={seg.dashOffset}
                    strokeLinecap="round"
                    onMouseEnter={() => setHoveredFilter(seg.filter)}
                    onMouseLeave={() => setHoveredFilter(null)}
                    onClick={() => handleToggleFilter(seg.filter)}
                    className="cursor-pointer transition-all duration-300"
                    style={{ opacity: isDimmed ? 0.35 : 1 }}
                  />
                );
              })}
          </svg>

          {/* Center Value */}
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
              {isRestricted
                ? 'Restricted'
                : focusedSegment
                  ? focusedSegment.shortLabel
                  : 'Total SKUs'}
            </span>
            <span className="mt-0.5 text-2xl font-extrabold tracking-tight text-slate-900">
              {isRestricted
                ? '—'
                : focusedSegment
                  ? focusedSegment.skuCount.toLocaleString()
                  : summary.totalSkus.toLocaleString()}
            </span>
            <span className="text-[10px] font-medium text-slate-500">
              {isRestricted
                ? 'ROL-06 only'
                : focusedSegment
                  ? `${focusedSegment.pct.toFixed(0)}% of catalog`
                  : 'Registered items'}
            </span>
          </div>
        </div>

        {/* Mini Legend */}
        <div className="flex items-center justify-center gap-4 border-t border-slate-100 pt-2.5 text-[11px]">
          {segments.map((seg) => (
            <button
              key={seg.filter}
              type="button"
              disabled={isRestricted}
              onMouseEnter={() => !isRestricted && setHoveredFilter(seg.filter)}
              onMouseLeave={() => setHoveredFilter(null)}
              onClick={() => handleToggleFilter(seg.filter)}
              className={`flex items-center gap-1.5 transition-opacity ${
                isRestricted
                  ? 'cursor-default opacity-60'
                  : activeOrHovered && activeOrHovered !== seg.filter
                    ? 'opacity-45'
                    : 'opacity-100'
              }`}
            >
              <span className={`h-2 w-2 rounded-full ${seg.barBg}`} />
              <span className="font-medium text-slate-600">
                {seg.shortLabel}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* KANAN: TOTAL HEADER + 3 CLICKABLE FILTER CARDS */}
      <div className="flex flex-col justify-between rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs lg:col-span-8">
        {/* Top Bar: Total SKU & Units + Stacked Health Bar */}
        <div className="flex flex-col gap-3 rounded-xl border border-slate-100 bg-slate-50/70 p-3.5 sm:flex-row sm:items-center sm:justify-between">
          <button
            type="button"
            disabled={isRestricted}
            onClick={() => handleToggleFilter('all')}
            className={`flex items-center gap-3 rounded-lg px-2.5 py-1.5 text-left transition ${
              isRestricted
                ? 'cursor-default opacity-80'
                : activeStockFilter === 'all'
                  ? 'bg-white shadow-2xs ring-1 ring-blue-200'
                  : 'hover:bg-white/70'
            }`}
          >
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-blue-700 to-teal-600 text-white">
              {isRestricted ? <Lock size={16} /> : <Package size={18} />}
            </div>
            <div>
              <p className="text-[11px] font-medium text-slate-500">
                Total Registered SKU Items
              </p>
              <p className="text-lg font-extrabold leading-tight text-slate-900">
                {isRestricted ? '—' : summary.totalSkus.toLocaleString()}{' '}
                <span className="text-xs font-normal text-slate-400">
                  {isRestricted
                    ? '(Restricted)'
                    : `SKUs • ${summary.totalUnits.toLocaleString()} total units`}
                </span>
              </p>
            </div>
          </button>

          {/* Stacked Bar */}
          <div className="w-full sm:w-56">
            <div className="mb-1 flex justify-between text-[11px] font-medium text-slate-500">
              <span>Stock Condition Mix</span>
              <span className="font-semibold text-slate-700">
                {isRestricted ? 'Locked' : '100%'}
              </span>
            </div>
            <div className="flex h-2.5 w-full overflow-hidden rounded-full bg-slate-200/80">
              {!isRestricted &&
                segments.map((seg) =>
                  seg.pct > 0 ? (
                    <div
                      key={seg.filter}
                      style={{ width: `${seg.pct}%` }}
                      className={`${seg.barBg} transition-all duration-500`}
                      title={`${seg.title}: ${seg.skuCount} SKUs (${seg.pct.toFixed(1)}%)`}
                    />
                  ) : null
                )}
            </div>
          </div>
        </div>

        {/* 3 Clickable Stock Condition Cards */}
        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
          {segments.map((seg) => {
            const Icon = seg.icon;
            const isSelected = !isRestricted && activeStockFilter === seg.filter;

            return (
              <button
                key={seg.filter}
                type="button"
                disabled={isRestricted}
                onMouseEnter={() =>
                  !isRestricted && setHoveredFilter(seg.filter)
                }
                onMouseLeave={() => setHoveredFilter(null)}
                onClick={() => handleToggleFilter(seg.filter)}
                className={`flex flex-col rounded-xl border p-4 text-left transition-all duration-200 ${
                  isRestricted
                    ? 'cursor-default border-slate-100 bg-slate-50/50 opacity-75'
                    : isSelected
                      ? seg.activeStyle
                      : 'border-slate-100 bg-slate-50/40 hover:border-slate-200 hover:bg-white hover:shadow-2xs'
                }`}
              >
                <div className="flex w-full items-center justify-between">
                  <span
                    className={`flex h-8 w-8 items-center justify-center rounded-lg border ${
                      isRestricted
                        ? 'border-amber-200 bg-amber-50 text-amber-600'
                        : seg.iconStyle
                    }`}
                  >
                    {isRestricted ? <Lock size={15} /> : <Icon size={16} />}
                  </span>
                  <span className="rounded-md bg-white px-2 py-0.5 text-[11px] font-bold text-slate-600 ring-1 ring-slate-200/70">
                    {isRestricted ? 'Restricted' : `${seg.pct.toFixed(0)}%`}
                  </span>
                </div>

                <div className="mt-3 flex items-baseline gap-1.5">
                  <p className="text-2xl font-extrabold tracking-tight text-slate-900">
                    {seg.value !== null ? seg.value.toLocaleString() : '—'}
                  </p>
                  {!isRestricted && (
                    <span className="text-[11px] font-medium text-slate-400">
                      {seg.unitLabel}
                    </span>
                  )}
                </div>

                <p className="mt-0.5 text-xs font-semibold text-slate-700">
                  {seg.title}
                </p>
                <p className="text-[11px] text-slate-400">{seg.subtitle}</p>

                {/* Individual Progress Bar */}
                <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-slate-200/70">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${seg.barBg}`}
                    style={{
                      width: `${isRestricted ? 0 : Math.min(seg.pct, 100)}%`,
                    }}
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

export default InventoryStatistics;
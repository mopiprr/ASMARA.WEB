import { useState, useCallback, useMemo } from 'react';
import {
  TrendingUp,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  BarChart2,
  Calendar,
  AlertCircle,
} from 'lucide-react';
import api from '../../../services/api';

export type TrendTimeframe = 'daily' | 'weekly' | 'monthly' | 'yearly';

interface RawTicketItem {
  id: string;
  ticketNumber: string;
  ticketType: number; // 1 = Maintenance, 2 = Procurement
  createdAt: string;
}

interface TrendBarItem {
  key: string;
  label: string;
  sublabel?: string;
  procurement: number;
  maintenance: number;
  total: number;
}

export function TicketActivityTrendChart() {
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [hasLoaded, setHasLoaded] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [rawTickets, setRawTickets] = useState<RawTicketItem[]>([]);
  const [timeframe, setTimeframe] = useState<TrendTimeframe>('daily');

  const fetchTrendData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Fetch user's tickets up to 100 recent tickets for trend calculation
      const response = await api.get('/tickets', {
        params: { pageSize: 100 },
      });

      const tickets: RawTicketItem[] = response.data?.items ?? [];
      setRawTickets(tickets);
      setHasLoaded(true);
    } catch (err: unknown) {
      console.error('Failed to load ticket trend data:', err);
      setError('Gagal memuat data tren aktivitas tiket. Silakan coba lagi.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleToggle = () => {
    const nextState = !isExpanded;
    setIsExpanded(nextState);

    // Call API lazily on first open
    if (nextState && !hasLoaded) {
      void fetchTrendData();
    }
  };

  // Compute aggregated trend items based on selected timeframe
  const trendData: TrendBarItem[] = useMemo(() => {
    if (rawTickets.length === 0 && !hasLoaded) return [];

    const now = new Date();

    if (timeframe === 'daily') {
      // Last 7 days (Default)
      const days: TrendBarItem[] = [];
      for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(now.getDate() - i);
        const key = d.toISOString().slice(0, 10); // YYYY-MM-DD
        const label = d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });
        const sublabel = d.toLocaleDateString('en-GB', { weekday: 'short' });
        days.push({ key, label, sublabel, procurement: 0, maintenance: 0, total: 0 });
      }

      for (const t of rawTickets) {
        if (!t.createdAt) continue;
        const key = new Date(t.createdAt).toISOString().slice(0, 10);
        const target = days.find((d) => d.key === key);
        if (target) {
          if (t.ticketType === 2) target.procurement++;
          else target.maintenance++;
          target.total++;
        }
      }
      return days;
    }

    if (timeframe === 'weekly') {
      // Last 6 weeks
      const weeks: (TrendBarItem & { start: Date; end: Date })[] = [];
      for (let i = 5; i >= 0; i--) {
        const d = new Date();
        d.setDate(now.getDate() - i * 7);
        const day = d.getDay();
        const diff = d.getDate() - day + (day === 0 ? -6 : 1);
        const monday = new Date(d.setDate(diff));
        monday.setHours(0, 0, 0, 0);

        const sunday = new Date(monday);
        sunday.setDate(monday.getDate() + 6);
        sunday.setHours(23, 59, 59, 999);

        const label = monday.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });
        const sublabel = `W${6 - i}`;
        const key = `week-${monday.toISOString().slice(0, 10)}`;

        weeks.push({ key, label, sublabel, start: monday, end: sunday, procurement: 0, maintenance: 0, total: 0 });
      }

      for (const t of rawTickets) {
        if (!t.createdAt) continue;
        const tDate = new Date(t.createdAt);
        const target = weeks.find((w) => tDate >= w.start && tDate <= w.end);
        if (target) {
          if (t.ticketType === 2) target.procurement++;
          else target.maintenance++;
          target.total++;
        }
      }
      return weeks;
    }

    if (timeframe === 'monthly') {
      // Last 6 months
      const months: TrendBarItem[] = [];
      for (let i = 5; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
        const label = d.toLocaleDateString('en-GB', { month: 'short' });
        const sublabel = String(d.getFullYear());
        months.push({ key, label, sublabel, procurement: 0, maintenance: 0, total: 0 });
      }

      for (const t of rawTickets) {
        if (!t.createdAt) continue;
        const ticketDate = new Date(t.createdAt);
        const key = `${ticketDate.getFullYear()}-${String(ticketDate.getMonth() + 1).padStart(2, '0')}`;
        const target = months.find((m) => m.key === key);
        if (target) {
          if (t.ticketType === 2) target.procurement++;
          else target.maintenance++;
          target.total++;
        }
      }
      return months;
    }

    // Yearly: Last 4 years
    const currentYear = now.getFullYear();
    const years: TrendBarItem[] = [];
    for (let y = currentYear - 3; y <= currentYear; y++) {
      const key = String(y);
      const label = String(y);
      years.push({ key, label, procurement: 0, maintenance: 0, total: 0 });
    }

    for (const t of rawTickets) {
      if (!t.createdAt) continue;
      const key = String(new Date(t.createdAt).getFullYear());
      const target = years.find((y) => y.key === key);
      if (target) {
        if (t.ticketType === 2) target.procurement++;
        else target.maintenance++;
        target.total++;
      }
    }
    return years;
  }, [rawTickets, timeframe, hasLoaded]);

  // Find max volume for relative bar scaling
  const maxVolume = Math.max(
    ...trendData.map((m) => Math.max(m.procurement, m.maintenance)),
    4
  );

  const totalPeriodTickets = trendData.reduce((acc, curr) => acc + curr.total, 0);

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all">
      {/* ACCORDION HEADER (CLICKABLE) */}
      <div
        onClick={handleToggle}
        className="flex cursor-pointer items-center justify-between p-5 transition hover:bg-slate-50/80"
      >
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
            <TrendingUp size={20} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-slate-800">
                Ticket Activity & Timeline Trend
              </h2>
              <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600">
                {timeframe === 'daily'
                  ? '7-Day View'
                  : timeframe === 'weekly'
                  ? '6-Week View'
                  : timeframe === 'monthly'
                  ? '6-Month View'
                  : '4-Year View'}
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Interactive ticket submission volume by day, week, month, or year
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 shadow-2xs transition hover:bg-slate-50"
          >
            <BarChart2 size={14} className="text-slate-500" />
            <span>{isExpanded ? 'Hide Trend' : 'View Trend Analysis'}</span>
            {isExpanded ? (
              <ChevronUp size={15} className="text-slate-400" />
            ) : (
              <ChevronDown size={15} className="text-slate-400" />
            )}
          </button>
        </div>
      </div>

      {/* EXPANDED CONTENT (LAZY-LOADED) */}
      {isExpanded && (
        <div className="border-t border-slate-100 p-6 pt-4 bg-slate-50/30">
          {/* TOP CONTROLS: TIMEFRAME SELECTOR & LEGEND */}
          <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            {/* TIMEFRAME FILTER PILLS */}
            <div className="inline-flex rounded-xl border border-slate-200 bg-slate-100/80 p-1">
              {(
                [
                  { id: 'daily', label: 'Daily' },
                  { id: 'weekly', label: 'Weekly' },
                  { id: 'monthly', label: 'Monthly' },
                  { id: 'yearly', label: 'Yearly' },
                ] as const
              ).map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setTimeframe(t.id)}
                  className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                    timeframe === t.id
                      ? 'bg-white text-slate-800 shadow-2xs'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {/* LEGEND & TOTAL */}
            <div className="flex flex-wrap items-center gap-4 text-xs font-semibold">
              <div className="flex items-center gap-1.5">
                <span className="h-3 w-3 rounded bg-blue-600" />
                <span className="text-slate-700">Procurement</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="h-3 w-3 rounded bg-emerald-500" />
                <span className="text-slate-700">Maintenance</span>
              </div>

              <div className="h-4 w-px bg-slate-200 hidden sm:block" />

              <div className="flex items-center gap-1.5 text-xs text-slate-500">
                <Calendar size={13} className="text-slate-400" />
                <span>
                  Total in View:{' '}
                  <strong className="font-bold text-slate-800">
                    {totalPeriodTickets}
                  </strong>
                </span>
              </div>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  void fetchTrendData();
                }}
                disabled={isLoading}
                className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
                title="Refresh Trend Data"
              >
                <RefreshCw
                  size={12}
                  className={isLoading ? 'animate-spin text-blue-600' : 'text-slate-400'}
                />
                <span>Refresh</span>
              </button>
            </div>
          </div>

          {/* ERROR STATE */}
          {error && (
            <div className="my-4 flex items-center justify-between rounded-xl border border-rose-200 bg-rose-50 p-4 text-xs text-rose-800">
              <div className="flex items-center gap-2">
                <AlertCircle size={15} className="text-rose-600" />
                <span>{error}</span>
              </div>
              <button
                type="button"
                onClick={() => void fetchTrendData()}
                className="rounded-lg bg-rose-600 px-3 py-1 font-semibold text-white transition hover:bg-rose-700"
              >
                Coba Lagi
              </button>
            </div>
          )}

          {/* LOADING SKELETON */}
          {isLoading ? (
            <div className="flex h-52 items-end justify-between gap-4 pt-6 animate-pulse">
              {Array.from({ length: 7 }).map((_, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-2">
                  <div className="w-full flex items-end justify-center gap-1.5 h-36">
                    <div className="w-1/2 h-16 bg-slate-200 rounded-t" />
                    <div className="w-1/2 h-24 bg-slate-200 rounded-t" />
                  </div>
                  <div className="h-3 w-10 bg-slate-200 rounded" />
                </div>
              ))}
            </div>
          ) : (
            /* BAR CHART */
            <div className="relative pt-6">
              {/* GRID LINES */}
              <div className="absolute inset-x-0 top-6 bottom-12 flex flex-col justify-between pointer-events-none opacity-40">
                <div className="border-b border-dashed border-slate-200 w-full" />
                <div className="border-b border-dashed border-slate-200 w-full" />
                <div className="border-b border-dashed border-slate-200 w-full" />
              </div>

              {/* BARS CONTAINER */}
              <div className="relative z-10 flex h-48 items-end justify-between gap-2 sm:gap-5">
                {trendData.map((item) => {
                  const procHeight =
                    item.procurement > 0
                      ? Math.max(Math.round((item.procurement / maxVolume) * 100), 8)
                      : 0;

                  const maintHeight =
                    item.maintenance > 0
                      ? Math.max(Math.round((item.maintenance / maxVolume) * 100), 8)
                      : 0;

                  return (
                    <div
                      key={item.key}
                      className="group flex flex-1 flex-col items-center gap-2 h-full justify-end"
                    >
                      {/* BARS */}
                      <div className="flex items-end justify-center gap-1 w-full h-36">
                        {/* PROCUREMENT BAR (BLUE) */}
                        <div
                          className="relative w-full max-w-[22px] rounded-t-md bg-blue-600 transition-all duration-500 group-hover:bg-blue-700"
                          style={{ height: `${procHeight}%` }}
                        >
                          {item.procurement > 0 && (
                            <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] font-bold text-blue-700 opacity-0 group-hover:opacity-100 transition whitespace-nowrap bg-white px-1 rounded shadow-2xs border border-blue-100">
                              {item.procurement}
                            </span>
                          )}
                        </div>

                        {/* MAINTENANCE BAR (EMERALD GREEN) */}
                        <div
                          className="relative w-full max-w-[22px] rounded-t-md bg-emerald-500 transition-all duration-500 group-hover:bg-emerald-600"
                          style={{ height: `${maintHeight}%` }}
                        >
                          {item.maintenance > 0 && (
                            <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] font-bold text-emerald-700 opacity-0 group-hover:opacity-100 transition whitespace-nowrap bg-white px-1 rounded shadow-2xs border border-emerald-100">
                              {item.maintenance}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* LABELS */}
                      <div className="text-center">
                        <span className="block text-[11px] font-bold text-slate-800 leading-tight">
                          {item.label}
                        </span>
                        {item.sublabel && (
                          <span className="block text-[9px] text-slate-400 leading-tight">
                            {item.sublabel}
                          </span>
                        )}
                        <p className="mt-0.5 text-[9px] font-medium text-slate-500">
                          {item.total} total
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default TicketActivityTrendChart;

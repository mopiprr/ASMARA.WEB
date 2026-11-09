import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Package,
  CheckCircle2,
  UserRound,
  Wrench,
  ArrowRight,
  TrendingUp,
  ShieldCheck,
  AlertTriangle,
} from 'lucide-react';
import { useAssetStatistics } from '../../assets/hooks/useAssetStatistics';

export function AssetDistributionChart() {
  const navigate = useNavigate();
  const { statistics, isLoading, fetchStatistics } = useAssetStatistics();

  // Listen to dashboard refresh events
  useEffect(() => {
    const handleRefresh = () => {
      void fetchStatistics();
    };

    window.addEventListener('refresh-dashboard-activity', handleRefresh);
    return () => {
      window.removeEventListener('refresh-dashboard-activity', handleRefresh);
    };
  }, [fetchStatistics]);

  const total = statistics?.totalAssets ?? 0;
  const inUse = statistics?.inUse ?? 0;
  const available = statistics?.available ?? 0;
  const underMaintenance = statistics?.underMaintenance ?? 0;

  // Percentages for chart & breakdown
  const inUsePct = total > 0 ? Math.round((inUse / total) * 100) : 0;
  const availablePct = total > 0 ? Math.round((available / total) * 100) : 0;
  const maintPct =
    total > 0
      ? Math.max(0, 100 - inUsePct - availablePct)
      : 0;

  // Operational Readiness: (In Use + Available) / Total
  const readinessPct =
    total > 0 ? Math.min(100, Math.round(((inUse + available) / total) * 100)) : 0;

  // Conic gradient angles
  // In Use (Blue): 0% -> inUsePct%
  // Available (Emerald): inUsePct% -> (inUsePct + availablePct)%
  // Under Maintenance (Amber): (inUsePct + availablePct)% -> 100%
  const endInUse = inUsePct;
  const endAvailable = inUsePct + availablePct;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      {/* HEADER */}
      <div className="flex flex-col justify-between gap-4 border-b border-slate-100 pb-5 sm:flex-row sm:items-center">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
            <Package size={20} />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-800">
              Asset Utilization & Health Distribution
            </h2>
            <p className="text-xs text-slate-500">
              Real-time operational status, deployment ratio, and health of company assets
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
            {total.toLocaleString()} Total Assets
          </span>

          <button
            type="button"
            onClick={() => navigate('/assets')}
            className="inline-flex items-center gap-1.5 rounded-xl border border-blue-200 bg-blue-50/70 px-3 py-1.5 text-xs font-semibold text-blue-600 transition hover:bg-blue-600 hover:text-white"
          >
            <span>Manage Assets</span>
            <ArrowRight size={14} />
          </button>
        </div>
      </div>

      {isLoading && !statistics ? (
        <div className="mt-8 flex animate-pulse flex-col items-center gap-8 sm:flex-row">
          <div className="h-44 w-44 rounded-full bg-slate-200" />
          <div className="w-full space-y-4">
            <div className="h-14 rounded-xl bg-slate-200" />
            <div className="h-14 rounded-xl bg-slate-200" />
            <div className="h-14 rounded-xl bg-slate-200" />
          </div>
        </div>
      ) : (
        <div className="mt-6 space-y-6">
          {/* MAIN VISUAL: DONUT + BREAKDOWN */}
          <div className="flex flex-col items-center gap-8 lg:flex-row">
            {/* DONUT CHART */}
            <div
              className="relative flex h-48 w-48 shrink-0 items-center justify-center rounded-full shadow-xs transition-all duration-700"
              style={{
                background:
                  total > 0
                    ? `conic-gradient(#2563eb 0% ${endInUse}%, #10b981 ${endInUse}% ${endAvailable}%, #f59e0b ${endAvailable}% 100%)`
                    : '#f1f5f9',
              }}
            >
              <div className="flex h-32 w-32 flex-col items-center justify-center rounded-full bg-white shadow-inner">
                <span className="text-2xl font-bold text-slate-800">
                  {total.toLocaleString()}
                </span>
                <span className="text-[11px] font-medium text-slate-400">
                  Total Assets
                </span>
                {total > 0 && (
                  <span className="mt-1 rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-semibold text-blue-600">
                    {inUsePct}% In Use
                  </span>
                )}
              </div>
            </div>

            {/* BREAKDOWN CARDS */}
            <div className="w-full space-y-3.5">
              {/* ASSETS IN USE (BLUE) */}
              <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-3.5 transition hover:bg-slate-50">
                <div className="mb-2 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100 text-blue-700">
                      <UserRound size={16} />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-slate-800">
                        Assets In Use (Deployed)
                      </span>
                      <p className="text-[10px] text-slate-400">
                        Actively assigned to employees across departments
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-sm font-bold text-slate-800">
                      {inUse.toLocaleString()}
                    </span>
                    <span className="ml-1 text-xs font-semibold text-blue-600">
                      ({inUsePct}%)
                    </span>
                  </div>
                </div>

                <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200">
                  <div
                    className="h-full rounded-full bg-blue-600 transition-all duration-700"
                    style={{ width: `${inUsePct}%` }}
                  />
                </div>
              </div>

              {/* AVAILABLE ASSETS (EMERALD GREEN) */}
              <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-3.5 transition hover:bg-slate-50">
                <div className="mb-2 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700">
                      <CheckCircle2 size={16} />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-slate-800">
                        Available in Storage
                      </span>
                      <p className="text-[10px] text-slate-400">
                        Ready and standby in inventory for immediate assignment
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-sm font-bold text-slate-800">
                      {available.toLocaleString()}
                    </span>
                    <span className="ml-1 text-xs font-semibold text-emerald-600">
                      ({availablePct}%)
                    </span>
                  </div>
                </div>

                <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200">
                  <div
                    className="h-full rounded-full bg-emerald-500 transition-all duration-700"
                    style={{ width: `${availablePct}%` }}
                  />
                </div>
              </div>

              {/* UNDER MAINTENANCE (AMBER) */}
              <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-3.5 transition hover:bg-slate-50">
                <div className="mb-2 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-100 text-amber-700">
                      <Wrench size={16} />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-slate-800">
                        Under Maintenance
                      </span>
                      <p className="text-[10px] text-slate-400">
                        Damaged or currently undergoing service and repair
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-sm font-bold text-slate-800">
                      {underMaintenance.toLocaleString()}
                    </span>
                    <span className="ml-1 text-xs font-semibold text-amber-600">
                      ({maintPct}%)
                    </span>
                  </div>
                </div>

                <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200">
                  <div
                    className="h-full rounded-full bg-amber-500 transition-all duration-700"
                    style={{ width: `${maintPct}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* KEY PERFORMANCE INDICATORS (KPIs) */}
          <div className="grid grid-cols-1 gap-4 pt-2 sm:grid-cols-3">
            <div className="rounded-xl border border-slate-200/80 bg-slate-50/40 p-4 transition hover:bg-slate-50">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-500">
                  Utilization Rate
                </span>
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-100 text-blue-600">
                  <TrendingUp size={14} />
                </span>
              </div>
              <p className="mt-2 text-2xl font-bold text-slate-800">
                {inUsePct}%
              </p>
              <p className="mt-1 text-[11px] text-slate-400">
                Portion of total inventory currently deployed
              </p>
            </div>

            <div className="rounded-xl border border-slate-200/80 bg-slate-50/40 p-4 transition hover:bg-slate-50">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-500">
                  Operational Readiness
                </span>
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-100 text-emerald-600">
                  <ShieldCheck size={14} />
                </span>
              </div>
              <p className="mt-2 text-2xl font-bold text-slate-800">
                {readinessPct}%
              </p>
              <p className="mt-1 text-[11px] text-slate-400">
                Assets in functional state (In Use + Available)
              </p>
            </div>

            <div className="rounded-xl border border-slate-200/80 bg-slate-50/40 p-4 transition hover:bg-slate-50">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-500">
                  Service Downtime
                </span>
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-100 text-amber-600">
                  <AlertTriangle size={14} />
                </span>
              </div>
              <p className="mt-2 text-2xl font-bold text-slate-800">
                {maintPct}%
              </p>
              <p className="mt-1 text-[11px] text-slate-400">
                Assets temporarily unavailable due to maintenance
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AssetDistributionChart;

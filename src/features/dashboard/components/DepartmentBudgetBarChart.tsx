import { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CircleDollarSign,
  TrendingUp,
  Wallet,
  Building2,
  RefreshCw,
  ArrowRight,
  AlertCircle,
  PieChart,
} from 'lucide-react';
import { financeApi } from '../../finance/services/financeApi';
import { isFinanceUser } from '../../finance/utils/finance.utils';
import type { DepartmentBudget } from '../../finance/types/finance.types';

export function formatIDR(value: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatCompactIDR(value: number): string {
  if (value >= 1_000_000_000) {
    return `Rp ${(value / 1_000_000_000).toFixed(1)} M`;
  }
  if (value >= 1_000_000) {
    return `Rp ${(value / 1_000_000).toFixed(1)} Jt`;
  }
  if (value >= 1_000) {
    return `Rp ${(value / 1_000).toFixed(0)} Rb`;
  }
  return `Rp ${value.toLocaleString('id-ID')}`;
}

export function DepartmentBudgetBarChart() {
  const navigate = useNavigate();
  const canAccessFinance = isFinanceUser();

  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState<number>(currentYear);
  const [budgets, setBudgets] = useState<DepartmentBudget[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [hoveredDeptId, setHoveredDeptId] = useState<string | null>(null);

  const fetchBudgetStats = useCallback(async () => {
    if (!canAccessFinance) {
      setIsLoading(false);
      return;
    }
    try {
      setIsLoading(true);
      setError(null);
      const data = await financeApi.getBudgets(selectedYear);
      setBudgets(data);
    } catch (err: unknown) {
      console.error('Failed to load department budget data for dashboard:', err);
      const message =
        err instanceof Error
          ? err.message
          : 'Gagal memuat data alokasi dan pengeluaran anggaran per departemen.';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, [canAccessFinance, selectedYear]);

  useEffect(() => {
    if (!canAccessFinance) return;
    void fetchBudgetStats();
  }, [fetchBudgetStats, canAccessFinance]);

  // Listen to dashboard-wide refresh events
  useEffect(() => {
    const handleDashboardRefresh = () => {
      void fetchBudgetStats();
    };

    window.addEventListener('refresh-dashboard-activity', handleDashboardRefresh);
    return () => {
      window.removeEventListener('refresh-dashboard-activity', handleDashboardRefresh);
    };
  }, [fetchBudgetStats]);

  // Summary metrics across all departments
  const summary = useMemo(() => {
    const totalAllocated = budgets.reduce((acc, curr) => acc + curr.allocatedBudget, 0);
    const totalSpent = budgets.reduce((acc, curr) => acc + curr.spentBudget, 0);
    const totalCommitted = budgets.reduce((acc, curr) => acc + curr.committedBudget, 0);
    const totalRemaining = budgets.reduce((acc, curr) => acc + curr.remainingBudget, 0);
    const overallUtilization =
      totalAllocated > 0 ? (totalSpent / totalAllocated) * 100 : 0;

    return {
      totalAllocated,
      totalSpent,
      totalCommitted,
      totalRemaining,
      overallUtilization,
    };
  }, [budgets]);

  // Max value for chart vertical scaling
  const maxScaleValue = useMemo(() => {
    if (budgets.length === 0) return 100_000_000;
    const peak = Math.max(
      ...budgets.map((b) => Math.max(b.allocatedBudget, b.spentBudget)),
      0
    );
    // Add 15% headroom for top badges
    return peak > 0 ? peak * 1.15 : 100_000_000;
  }, [budgets]);

  const yearOptions = [currentYear - 1, currentYear, currentYear + 1];

  const activeHoverItem = useMemo(() => {
    if (!hoveredDeptId) return null;
    return budgets.find((b) => b.id === hoveredDeptId) || null;
  }, [hoveredDeptId, budgets]);

  if (!canAccessFinance) {
    return null;
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      {/* HEADER SECTION */}
      <div className="flex flex-col justify-between gap-4 border-b border-slate-100 pb-5 lg:flex-row lg:items-center">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
            <CircleDollarSign size={20} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-slate-800">
                Department Budget Allocation & Expenditure
              </h2>
              <span className="inline-flex items-center rounded-md bg-blue-50 px-2 py-0.5 text-xs font-semibold text-blue-700">
                FY {selectedYear}
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Perbandingan alokasi pagu anggaran dan jumlah uang yang telah dikeluarkan (realized) per departemen
            </p>
          </div>
        </div>

        {/* CONTROLS (Year Selector & Navigation) */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Year Buttons */}
          <div className="flex items-center rounded-xl border border-slate-200 bg-slate-50/80 p-0.5 text-xs font-medium text-slate-600">
            {yearOptions.map((year) => (
              <button
                key={year}
                type="button"
                onClick={() => setSelectedYear(year)}
                className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition ${
                  selectedYear === year
                    ? 'bg-white text-blue-600 shadow-xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                {year}
              </button>
            ))}
          </div>

          {/* Refresh Button */}
          <button
            type="button"
            onClick={() => void fetchBudgetStats()}
            disabled={isLoading}
            className="inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
            title="Refresh Budget Data"
          >
            <RefreshCw
              size={13}
              className={isLoading ? 'animate-spin text-blue-600' : 'text-slate-400'}
            />
            <span className="hidden sm:inline">Refresh</span>
          </button>

          {/* Manage Finance shortcut if user has Finance/Admin role */}
          {canAccessFinance && (
            <button
              type="button"
              onClick={() => navigate('/finance')}
              className="inline-flex items-center gap-1.5 rounded-xl border border-blue-200 bg-blue-50/70 px-3 py-1.5 text-xs font-semibold text-blue-600 transition hover:bg-blue-600 hover:text-white"
            >
              <span>Finance Module</span>
              <ArrowRight size={14} />
            </button>
          )}
        </div>
      </div>

      {/* QUICK SUMMARY KPI ROW */}
      <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-3.5">
          <div className="flex items-center gap-2 text-slate-500">
            <Wallet size={15} className="text-blue-600" />
            <span className="text-xs font-medium">Total Allocated</span>
          </div>
          <p className="mt-1 text-base font-bold text-slate-800 sm:text-lg">
            {formatIDR(summary.totalAllocated)}
          </p>
          <span className="text-[11px] text-slate-400">Total pagu perusahaan</span>
        </div>

        <div className="rounded-xl border border-slate-100 bg-emerald-50/40 p-3.5">
          <div className="flex items-center gap-2 text-emerald-700">
            <TrendingUp size={15} className="text-emerald-600" />
            <span className="text-xs font-medium">Total Expenditure</span>
          </div>
          <p className="mt-1 text-base font-bold text-emerald-800 sm:text-lg">
            {formatIDR(summary.totalSpent)}
          </p>
          <span className="text-[11px] text-emerald-600/80">Realisasi dikeluarkan</span>
        </div>

        <div className="rounded-xl border border-slate-100 bg-amber-50/40 p-3.5">
          <div className="flex items-center gap-2 text-amber-700">
            <PieChart size={15} className="text-amber-600" />
            <span className="text-xs font-medium">Avg Utilization</span>
          </div>
          <p className="mt-1 text-base font-bold text-amber-800 sm:text-lg">
            {summary.overallUtilization.toFixed(1)}%
          </p>
          <span className="text-[11px] text-amber-600/80">Persentase penyerapan</span>
        </div>

        <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-3.5">
          <div className="flex items-center gap-2 text-slate-500">
            <Building2 size={15} className="text-slate-600" />
            <span className="text-xs font-medium">Active Departments</span>
          </div>
          <p className="mt-1 text-base font-bold text-slate-800 sm:text-lg">
            {budgets.length} Depts
          </p>
          <span className="text-[11px] text-slate-400">Terdaftar di sistem</span>
        </div>
      </div>

      {/* ERROR STATE */}
      {error && (
        <div className="mt-4 flex items-center justify-between rounded-xl border border-rose-200 bg-rose-50 p-4 text-xs text-rose-800">
          <div className="flex items-center gap-2">
            <AlertCircle size={16} className="text-rose-600" />
            <span>{error}</span>
          </div>
          <button
            type="button"
            onClick={() => void fetchBudgetStats()}
            className="rounded-lg bg-rose-600 px-3 py-1 font-semibold text-white transition hover:bg-rose-700"
          >
            Coba Lagi
          </button>
        </div>
      )}

      {/* CHART LEGEND & HOVER DETAILS */}
      <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-t border-slate-100 pt-4">
        {/* Legends */}
        <div className="flex flex-wrap items-center gap-5 text-xs font-medium text-slate-600">
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-sm bg-blue-600 shadow-xs" />
            <span className="font-semibold text-slate-800">Alokasi Anggaran (Allocated)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-sm bg-emerald-500 shadow-xs" />
            <span className="font-semibold text-slate-800">Uang Dikeluarkan (Spent)</span>
          </div>
        </div>

        {/* Dynamic Tooltip / Active Inspect Preview */}
        {activeHoverItem ? (
          <div className="flex items-center gap-3 rounded-xl border border-blue-100 bg-blue-50/60 px-3.5 py-1.5 text-xs text-blue-900 animate-in fade-in">
            <span className="font-bold text-blue-700">
              {activeHoverItem.departmentName}:
            </span>
            <span>
              Allocated:{' '}
              <strong className="font-semibold">
                {formatIDR(activeHoverItem.allocatedBudget)}
              </strong>
            </span>
            <span className="text-slate-300">•</span>
            <span>
              Spent:{' '}
              <strong className="font-semibold text-emerald-700">
                {formatIDR(activeHoverItem.spentBudget)}
              </strong>{' '}
              ({activeHoverItem.utilizationRate.toFixed(1)}%)
            </span>
          </div>
        ) : (
          <span className="text-xs text-slate-400 hidden sm:inline">
            Arahkan kursor ke diagram batang untuk melihat detail per departemen
          </span>
        )}
      </div>

      {/* LOADING SKELETON */}
      {isLoading ? (
        <div className="mt-8 flex h-64 items-end justify-between gap-6 px-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-3">
              <div className="w-full flex items-end justify-center gap-2 h-48">
                <div className="w-6 sm:w-10 h-36 bg-slate-100 rounded-t-lg" />
                <div className="w-6 sm:w-10 h-16 bg-slate-100 rounded-t-lg" />
              </div>
              <div className="h-4 w-16 bg-slate-100 rounded" />
            </div>
          ))}
        </div>
      ) : budgets.length === 0 ? (
        /* EMPTY STATE */
        <div className="mt-8 flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 py-12 text-center">
          <Building2 size={36} className="text-slate-300" />
          <p className="mt-2 text-sm font-semibold text-slate-700">
            Belum ada data anggaran untuk Tahun {selectedYear}
          </p>
          <p className="mt-1 text-xs text-slate-400">
            Data alokasi departemen belum diatur di modul Finance.
          </p>
        </div>
      ) : (
        /* BAR CHART VISUAL */
        <div className="relative mt-8">
          {/* Y-AXIS GRID LINES & LABELS */}
          <div className="absolute inset-x-0 top-0 bottom-16 flex flex-col justify-between pointer-events-none opacity-50">
            {[1, 0.75, 0.5, 0.25, 0].map((step, idx) => {
              const val = maxScaleValue * step;
              return (
                <div key={idx} className="relative flex items-center">
                  <span className="absolute -left-1 text-[10px] font-semibold text-slate-400 -translate-y-2.5">
                    {formatCompactIDR(val)}
                  </span>
                  <div className="w-full border-b border-dashed border-slate-200 ml-16" />
                </div>
              );
            })}
          </div>

          {/* BARS CONTAINER */}
          <div className="relative z-10 ml-16 flex h-64 items-end justify-between gap-3 sm:gap-6 pt-6 pb-2">
            {budgets.map((dept) => {
              const allocHeightPct = Math.min(
                100,
                Math.round((dept.allocatedBudget / maxScaleValue) * 100)
              );
              const spentHeightPct = Math.min(
                100,
                Math.round((dept.spentBudget / maxScaleValue) * 100)
              );

              const isHovered = hoveredDeptId === dept.id;

              return (
                <div
                  key={dept.id}
                  className="group relative flex-1 flex flex-col items-center h-full justify-end cursor-pointer"
                  onMouseEnter={() => setHoveredDeptId(dept.id)}
                  onMouseLeave={() => setHoveredDeptId(null)}
                >
                  {/* POPUP CARD ON HOVER (FLAT & INSTANT) */}
                  {isHovered && (
                    <div className="absolute -top-16 z-30 flex flex-col items-center pointer-events-none">
                      <div className="rounded-lg bg-slate-900 px-2.5 py-1.5 text-white shadow-md">
                        <p className="text-[11px] font-bold text-slate-200">
                          {dept.departmentName} ({dept.departmentCode})
                        </p>
                        <div className="mt-0.5 flex items-center gap-2.5 text-[10px]">
                          <span className="text-blue-300">
                            Alloc: {formatIDR(dept.allocatedBudget)}
                          </span>
                          <span className="text-emerald-400">
                            Spent: {formatIDR(dept.spentBudget)}
                          </span>
                        </div>
                      </div>
                      <div className="h-1.5 w-1.5 rotate-45 bg-slate-900 -mt-1" />
                    </div>
                  )}

                  {/* PAIRED BARS (CLEAN & FLAT) */}
                  <div className="w-full flex items-end justify-center gap-1.5 sm:gap-2.5 h-full pb-1">
                    {/* BAR 1: ALLOCATED BUDGET */}
                    <div className="relative flex flex-col items-center w-full max-w-[28px] sm:max-w-[42px] h-full justify-end">
                      <span className="mb-1 text-[9px] font-bold text-blue-700 opacity-0 group-hover:opacity-100 truncate max-w-full">
                        {formatCompactIDR(dept.allocatedBudget)}
                      </span>
                      <div
                        style={{ height: `${Math.max(allocHeightPct, 4)}%` }}
                        className={`w-full rounded-t ${
                          isHovered ? 'bg-blue-700' : 'bg-blue-600'
                        }`}
                      />
                    </div>

                    {/* BAR 2: SPENT BUDGET */}
                    <div className="relative flex flex-col items-center w-full max-w-[28px] sm:max-w-[42px] h-full justify-end">
                      <span className="mb-1 text-[9px] font-bold text-emerald-700 opacity-0 group-hover:opacity-100 truncate max-w-full">
                        {formatCompactIDR(dept.spentBudget)}
                      </span>
                      <div
                        style={{ height: `${Math.max(spentHeightPct, dept.spentBudget > 0 ? 4 : 2)}%` }}
                        className={`w-full rounded-t ${
                          dept.spentBudget > 0
                            ? isHovered
                              ? 'bg-emerald-700'
                              : 'bg-emerald-600'
                            : 'bg-slate-200'
                        }`}
                      />
                    </div>
                  </div>

                  {/* BOTTOM LABELS (DEPT CODE & NAME) */}
                  <div className="mt-3 text-center w-full truncate border-t border-slate-100 pt-2">
                    <p
                      className={`text-xs font-bold transition truncate ${
                        isHovered ? 'text-blue-600' : 'text-slate-700'
                      }`}
                      title={dept.departmentName}
                    >
                      {dept.departmentCode || dept.departmentName}
                    </p>
                    <p className="text-[10px] text-slate-400 truncate hidden sm:block">
                      {dept.departmentName}
                    </p>
                    <span
                      className={`mt-1 inline-block rounded-md px-1.5 py-0.5 text-[10px] font-semibold ${
                        dept.utilizationRate > 85
                          ? 'bg-red-50 text-red-600'
                          : dept.utilizationRate > 50
                          ? 'bg-amber-50 text-amber-700'
                          : 'bg-emerald-50 text-emerald-700'
                      }`}
                    >
                      {dept.utilizationRate.toFixed(1)}%
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* DEPARTMENT BREAKDOWN MINI TILES */}
      {budgets.length > 0 && !isLoading && (
        <div className="mt-8 border-t border-slate-100 pt-5">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Department Budget Utilization Breakdown
            </h3>
            <span className="text-[11px] text-slate-400">
              {budgets.length} departments recorded
            </span>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {budgets.map((dept) => {
              const util = dept.utilizationRate;
              const isHigh = util > 85;

              return (
                <div
                  key={dept.id}
                  className="rounded-xl border border-slate-100 bg-slate-50/50 p-3 hover:border-slate-300"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-bold text-slate-800 truncate" title={dept.departmentName}>
                      {dept.departmentName}
                    </span>
                    <span
                      className={`rounded px-1.5 py-0.5 text-[10px] font-bold ${
                        isHigh ? 'bg-red-100 text-red-700' : 'bg-slate-200/70 text-slate-700'
                      }`}
                    >
                      {util.toFixed(1)}%
                    </span>
                  </div>

                  {/* Mini Progress Bar */}
                  <div className="mt-2.5 h-1.5 w-full overflow-hidden rounded-full bg-slate-200">
                    <div
                      className={`h-full rounded-full ${
                        isHigh ? 'bg-red-500' : 'bg-emerald-500'
                      }`}
                      style={{ width: `${Math.min(util, 100)}%` }}
                    />
                  </div>

                  <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500">
                    <span>
                      Spent: <strong className="font-semibold text-slate-700">{formatCompactIDR(dept.spentBudget)}</strong>
                    </span>
                    <span>
                      Alloc: <strong className="font-semibold text-slate-700">{formatCompactIDR(dept.allocatedBudget)}</strong>
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
export default DepartmentBudgetBarChart;

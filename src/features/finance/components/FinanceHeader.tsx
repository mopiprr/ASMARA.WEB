import { RefreshCw, Search, SlidersHorizontal, Calendar } from 'lucide-react';

interface FinanceHeaderProps {
  selectedYear: number;
  onYearChange: (year: number) => void;
  search: string;
  onSearchChange: (search: string) => void;
  departmentFilter: string;
  onDepartmentFilterChange: (deptId: string) => void;
  departments: { departmentId: string; departmentName: string }[];
  isLoading: boolean;
  onRefresh: () => void;
  onOpenAdjustModal: () => void;
}

export default function FinanceHeader({
  selectedYear,
  onYearChange,
  search,
  onSearchChange,
  departmentFilter,
  onDepartmentFilterChange,
  departments,
  isLoading,
  onRefresh,
  onOpenAdjustModal,
}: FinanceHeaderProps) {
  const years = [2024, 2025, 2026, 2027];

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="text-xl font-bold tracking-tight text-slate-900">
          Finance & Budget Allocation
        </h1>
        <p className="mt-0.5 text-xs text-slate-500">
          Monitor departmental budget utilization, review expense ledgers, and manage fiscal allocations.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2.5">
        {/* FISCAL YEAR SELECTOR */}
        <div className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs shadow-2xs">
          <Calendar size={14} className="text-slate-400" />
          <span className="font-semibold text-slate-500">Year:</span>
          <select
            value={selectedYear}
            onChange={(e) => onYearChange(Number(e.target.value))}
            className="font-bold text-slate-800 bg-transparent outline-none cursor-pointer"
          >
            {years.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </div>

        {/* DEPARTMENT FILTER */}
        <select
          value={departmentFilter}
          onChange={(e) => onDepartmentFilterChange(e.target.value)}
          className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 shadow-2xs outline-none cursor-pointer hover:bg-slate-50 transition"
        >
          <option value="all">All Departments</option>
          {departments.map((d) => (
            <option key={d.departmentId} value={d.departmentId}>
              {d.departmentName}
            </option>
          ))}
        </select>

        {/* SEARCH */}
        <div className="relative">
          <Search
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
            type="text"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search department..."
            className="w-44 sm:w-52 rounded-xl border border-slate-200 bg-white py-2 pl-8.5 pr-3 text-xs font-medium text-slate-800 placeholder-slate-400 outline-none shadow-2xs transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          />
        </div>

        {/* REFRESH */}
        <button
          type="button"
          onClick={onRefresh}
          disabled={isLoading}
          className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 shadow-2xs transition hover:bg-slate-50 hover:text-blue-600 disabled:opacity-50"
          title="Refresh Data"
        >
          <RefreshCw size={14} className={isLoading ? 'animate-spin text-blue-600' : ''} />
        </button>

        {/* ADJUST BUDGET BUTTON */}
        <button
          type="button"
          onClick={onOpenAdjustModal}
          className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white shadow-md shadow-blue-600/20 hover:bg-blue-700 transition"
        >
          <SlidersHorizontal size={14} />
          <span>Adjust Budget</span>
        </button>
      </div>
    </div>
  );
}

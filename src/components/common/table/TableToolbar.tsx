import { RefreshCw, Search } from 'lucide-react';

interface TableToolbarProps {
  title: string;
  description: string;

  search: string;
  onSearchChange: (value: string) => void;

  isLoading: boolean;
  onRefresh: () => void;
}

function TableToolbar({
  title,
  description,
  search,
  onSearchChange,
  isLoading,
  onRefresh,
}: TableToolbarProps) {
  return (
    <div className="border-b border-slate-100 p-6">
      <div>
        <h2 className="text-lg font-bold text-slate-800">{title}</h2>
        <p className="mt-1 text-sm text-slate-500">{description}</p>
      </div>

      {/* FILTERS */}
      <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        {/* SEARCH */}
        <div className="relative w-full sm:w-80">
          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />

          <input
            type="text"
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="Search number, subject, requester..."
            className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          />
        </div>

        <div className="flex items-center gap-2 sm:ml-auto">
          {search && (
            <button
              type="button"
              onClick={() => onSearchChange('')}
              className="rounded-xl px-3 py-2 text-xs font-semibold text-slate-500 transition hover:bg-slate-100"
            >
              Clear Search
            </button>
          )}

          {/* REFRESH */}
          <button
            type="button"
            onClick={onRefresh}
            disabled={isLoading}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
          >
            <RefreshCw
              size={16}
              className={isLoading ? 'animate-spin' : ''}
            />
            Refresh
          </button>
        </div>
      </div>
    </div>
  );
}

export default TableToolbar;
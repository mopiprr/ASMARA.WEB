import { RefreshCw, RotateCcw, Search } from 'lucide-react';

interface TableToolbarProps {
  title: string;
  description: string;

  search: string;
  onSearchChange: (value: string) => void;

  isLoading: boolean;
  onRefresh: () => void;
}

// Judul tabel + kotak pencarian + tombol refresh.
function TableToolbar({
  title,
  description,
  search,
  onSearchChange,
  isLoading,
  onRefresh,
}: TableToolbarProps) {
  return (
    <div className="border-b border-slate-100 p-5">
      <div className="flex flex-col gap-4">
        <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
          <div>
            <h2 className="text-lg font-bold text-slate-800">
              {title}
            </h2>
            <p className="text-xs text-slate-500">
              {description}
            </p>
          </div>

          {search && (
            <button
              type="button"
              onClick={() => onSearchChange('')}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:bg-slate-50"
            >
              <RotateCcw size={13} />
              <span>Clear Search</span>
            </button>
          )}
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          {/* SEARCH */}
          <div className="relative flex-1">
            <Search
              size={16}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              type="text"
              value={search}
              onChange={(event) => onSearchChange(event.target.value)}
              placeholder="Search ticket number, subject, requester..."
              className="w-full rounded-xl border border-slate-200 bg-slate-50/60 py-2.5 pl-10 pr-4 text-xs font-medium text-slate-800 placeholder-slate-400 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
            />
          </div>

          {/* REFRESH */}
          <button
            type="button"
            onClick={onRefresh}
            disabled={isLoading}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold text-slate-700 shadow-2xs transition hover:bg-slate-50 disabled:opacity-50"
          >
            <RefreshCw
              size={15}
              className={isLoading ? 'animate-spin text-blue-600' : 'text-slate-500'}
            />
            <span>Refresh</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default TableToolbar;
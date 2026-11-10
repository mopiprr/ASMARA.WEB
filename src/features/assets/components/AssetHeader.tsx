import { Boxes, RefreshCw, ShieldCheck } from 'lucide-react';

interface AssetHeaderProps {
  isLoading: boolean;
  onRefresh: () => void;
}

function AssetHeader({ isLoading, onRefresh }: AssetHeaderProps) {
  return (
    <section className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
      <div>
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-blue-600">
          <Boxes size={14} />
          <span>Workspace / Assets</span>
        </div>

        <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-800 sm:text-3xl">
          Asset Management
        </h1>

        <p className="mt-1 text-sm text-slate-500">
          Track company assets, see who is holding them, and assign assets to employees.
        </p>
      </div>

      <div className="flex items-center gap-2.5">
        <span className="hidden items-center gap-1.5 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700 sm:inline-flex">
          <ShieldCheck size={14} />
          <span>Inventory Authorized</span>
        </span>

        <button
          type="button"
          onClick={onRefresh}
          disabled={isLoading}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:opacity-50"
          title="Refresh Data"
        >
          <RefreshCw
            size={16}
            className={isLoading ? 'animate-spin text-blue-600' : 'text-slate-500'}
          />
          <span>Refresh</span>
        </button>
      </div>
    </section>
  );
}

export default AssetHeader;
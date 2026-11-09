import { Package, RefreshCw } from 'lucide-react';

interface InventoryHeaderProps {
  isLoading: boolean;
  onRefresh: () => void;
}

export function InventoryHeader({ isLoading, onRefresh }: InventoryHeaderProps) {
  return (
    <section className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
      <div>
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-blue-600">
          <Package size={14} />
          <span>Workspace / Catalog</span>
        </div>

        <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-800 sm:text-3xl">
          Inventory Management
        </h1>

        <p className="mt-1 text-sm text-slate-500">
          Manage catalog SKUs, track physical stock levels, and organize item categories.
        </p>
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onRefresh}
          disabled={isLoading}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:opacity-50"
          title="Refresh Data"
        >
          <RefreshCw size={16} className={isLoading ? 'animate-spin text-blue-600' : 'text-slate-500'} />
          <span>Refresh</span>
        </button>
      </div>
    </section>
  );
}

export default InventoryHeader;

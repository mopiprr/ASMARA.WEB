import { Package, RefreshCw, ShieldCheck, Lock, Plus } from 'lucide-react';

interface InventoryHeaderProps {
  isLoading: boolean;
  isInventoryUser?: boolean;
  onRefresh: () => void;
  onAddItem?: () => void;
}

export function InventoryHeader({
  isLoading,
  isInventoryUser = true,
  onRefresh,
  onAddItem,
}: InventoryHeaderProps) {
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

      <div className="flex items-center gap-2.5">
        {isInventoryUser ? (
          <span className="hidden items-center gap-1.5 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700 sm:inline-flex">
            <ShieldCheck size={14} />
            <span>Inventory Authorized</span>
          </span>
        ) : (
          <span className="hidden items-center gap-1.5 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-700 sm:inline-flex">
            <Lock size={14} />
            <span>Limited Guest Access</span>
          </span>
        )}

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

        {onAddItem && (
          <button
            type="button"
            onClick={onAddItem}
            disabled={isLoading}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:opacity-50"
          >
            <Plus size={16} />
            <span>Add Item</span>
          </button>
        )}
      </div>
    </section>
  );
}

export default InventoryHeader;

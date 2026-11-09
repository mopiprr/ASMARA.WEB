import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldAlert, ArrowRight } from 'lucide-react';
import { useInventory } from '../hooks/useInventory';
import type { InventoryItem } from '../types/inventory.types';
import InventoryHeader from '../components/InventoryHeader';
import InventoryStatistics from '../components/InventoryStatistics';
import InventoryTable from '../components/InventoryTable';
import InventoryDetailModal from '../components/InventoryDetailModal';

export function InventoryPage() {
  const navigate = useNavigate();
  const {
    categories,
    filteredItems,
    summary,
    isLoading,
    isCheckingRole,
    isInventoryUser,
    error,
    search,
    setSearch,
    selectedCategory,
    setSelectedCategory,
    stockStatus,
    setStockStatus,
    resetFilters,
    hasActiveFilters,
    refetch,
  } = useInventory();

  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <InventoryHeader
        isLoading={isLoading}
        isInventoryUser={isInventoryUser}
        onRefresh={() => void refetch()}
      />

      {/* ACCESS RESTRICTED BANNER FOR NON-INVENTORY USERS */}
      {!isInventoryUser && !isCheckingRole && (
        <div className="flex flex-col gap-4 rounded-2xl border border-amber-200 bg-amber-50/70 p-5 shadow-xs sm:flex-row sm:items-start animate-in fade-in duration-200">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-700">
            <ShieldAlert size={22} />
          </div>
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-sm font-bold text-amber-900">
                Akses Terbatas — Halaman Khusus Departemen Inventory (ROL-06)
              </h3>
              <span className="rounded-full bg-amber-200/60 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-amber-800">
                Non-Inventory View
              </span>
            </div>
            <p className="mt-1 text-xs leading-relaxed text-amber-800">
              Anda dapat membuka halaman ini untuk peninjauan antarmuka, namun pencatatan data inventaris fisik, pergerakan barang, dan ketersediaan stok di gudang <strong>hanya dapat diakses dan dikelola oleh staf berwenang dari Departemen Inventory</strong>.
            </p>
            <div className="mt-3.5 flex flex-wrap items-center gap-2.5">
              <button
                type="button"
                onClick={() => navigate('/procurement')}
                className="inline-flex items-center gap-1.5 rounded-xl bg-amber-600 px-3.5 py-1.5 text-xs font-semibold text-white shadow-xs transition hover:bg-amber-700"
              >
                <span>Buat Pengajuan Procurement</span>
                <ArrowRight size={13} />
              </button>
              <button
                type="button"
                onClick={() => navigate('/maintenance')}
                className="inline-flex items-center gap-1.5 rounded-xl border border-amber-300 bg-white px-3.5 py-1.5 text-xs font-semibold text-amber-800 transition hover:bg-amber-100"
              >
                <span>Pengajuan Maintenance</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SUMMARY STATS METRICS */}
      <InventoryStatistics
        summary={summary}
        activeStockFilter={stockStatus}
        onSelectFilter={setStockStatus}
        isRestricted={!isInventoryUser}
      />

      {/* INVENTORY TABLE & FILTERS */}
      <InventoryTable
        items={filteredItems}
        categories={categories}
        isLoading={isLoading}
        isRestricted={!isInventoryUser}
        error={error}
        search={search}
        onSearchChange={setSearch}
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
        stockStatus={stockStatus}
        onStockStatusChange={setStockStatus}
        onResetFilters={resetFilters}
        hasActiveFilters={hasActiveFilters}
        onViewItem={setSelectedItem}
        onRetry={() => void refetch()}
      />

      {/* DETAIL MODAL (Only when item is selected by authorized user) */}
      {isInventoryUser && selectedItem && (
        <InventoryDetailModal
          item={selectedItem}
          categories={categories}
          onClose={() => setSelectedItem(null)}
        />
      )}
    </div>
  );
}

export default InventoryPage;

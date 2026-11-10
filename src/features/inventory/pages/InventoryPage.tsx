import { useState } from 'react';
import { useInventory } from '../hooks/useInventory';
import AccessDenied from '../../../components/common/AccessDenied';
import { hasAnyRole } from '../../../utils/auth';
import { INVENTORY_ACCESS_ROLES } from '../utils/inventory.utils';
import type { InventoryItem } from '../types/inventory.types';
import InventoryHeader from '../components/InventoryHeader';
import InventoryStatistics from '../components/InventoryStatistics';
import InventoryTable from '../components/InventoryTable';
import InventoryDetailModal from '../components/InventoryDetailModal';

export function InventoryPage() {
  // Cek role dulu: kalau tidak berhak, API tidak dipanggil sama sekali.
  const canAccess = hasAnyRole(INVENTORY_ACCESS_ROLES);

  const {
    categories,
    filteredItems,
    summary,
    isLoading,
    isForbidden,
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
  } = useInventory(canAccess);

  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);

  // Role tidak cocok, atau backend menolak (403) -> Access denied.
  if (!canAccess || isForbidden) {
    return <AccessDenied message="Only the Inventory department can access this page." />;
  }

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <InventoryHeader
        isLoading={isLoading}
        onRefresh={() => void refetch()}
      />

      {/* SUMMARY STATS METRICS */}
      <InventoryStatistics
        summary={summary}
        activeStockFilter={stockStatus}
        onSelectFilter={setStockStatus}
      />

      {/* INVENTORY TABLE & FILTERS */}
      <InventoryTable
        items={filteredItems}
        categories={categories}
        isLoading={isLoading}
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

      {/* DETAIL MODAL */}
      {selectedItem && (
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
import { useState } from 'react';
import { useInventory } from '../hooks/useInventory';
import type { InventoryItem } from '../types/inventory.types';
import InventoryHeader from '../components/InventoryHeader';
import InventoryStatistics from '../components/InventoryStatistics';
import InventoryTable from '../components/InventoryTable';
import InventoryDetailModal from '../components/InventoryDetailModal';

export function InventoryPage() {
  const {
    categories,
    filteredItems,
    summary,
    isLoading,
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
      <InventoryHeader isLoading={isLoading} onRefresh={() => void refetch()} />

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
      <InventoryDetailModal
        item={selectedItem}
        categories={categories}
        onClose={() => setSelectedItem(null)}
      />
    </div>
  );
}

export default InventoryPage;

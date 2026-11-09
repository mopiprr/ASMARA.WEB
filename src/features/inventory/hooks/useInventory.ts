import { useState, useEffect, useCallback, useMemo } from 'react';
import api from '../../../services/api';
import type {
  InventoryItem,
  InventoryCategory,
  StockStatusFilter,
  InventorySummary,
} from '../types/inventory.types';
import { LOW_STOCK_THRESHOLD } from '../utils/inventory.utils';

export function useInventory() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [categories, setCategories] = useState<InventoryCategory[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [search, setSearch] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<number | 'all'>('all');
  const [stockStatus, setStockStatus] = useState<StockStatusFilter>('all');

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const [itemsResponse, categoriesResponse] = await Promise.all([
        api.get<InventoryItem[]>('/inventory/items'),
        api.get<InventoryCategory[]>('/inventory/categories'),
      ]);

      setItems(itemsResponse.data ?? []);
      setCategories(categoriesResponse.data ?? []);
    } catch (err: unknown) {
      console.error('Failed to load inventory data:', err);
      setError('Failed to load inventory data. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchData();
  }, [fetchData]);

  // Overall Catalog Summary (based on all items)
  const summary: InventorySummary = useMemo(() => {
    let totalUnits = 0;
    let lowStockCount = 0;
    let outOfStockCount = 0;

    for (const item of items) {
      const qty = item.qty;
      if (qty === null || qty === undefined || qty <= 0) {
        outOfStockCount++;
      } else {
        totalUnits += qty;
        if (qty < LOW_STOCK_THRESHOLD) {
          lowStockCount++;
        }
      }
    }

    return {
      totalSkus: items.length,
      totalUnits,
      lowStockCount,
      outOfStockCount,
    };
  }, [items]);

  // Filtered Items
  const filteredItems = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    return items.filter((item) => {
      // 1. Search term match
      if (keyword) {
        const matchesCode = item.itemCode.toLowerCase().includes(keyword);
        const matchesName = item.itemName.toLowerCase().includes(keyword);
        const matchesCat = (item.categoryName ?? '').toLowerCase().includes(keyword);
        if (!matchesCode && !matchesName && !matchesCat) {
          return false;
        }
      }

      // 2. Category match
      if (selectedCategory !== 'all') {
        if (item.itemCategoryId !== selectedCategory) {
          return false;
        }
      }

      // 3. Stock status match
      const qty = item.qty;
      if (stockStatus === 'in_stock') {
        if (qty === null || qty === undefined || qty < LOW_STOCK_THRESHOLD) {
          return false;
        }
      } else if (stockStatus === 'low_stock') {
        if (qty === null || qty === undefined || qty <= 0 || qty >= LOW_STOCK_THRESHOLD) {
          return false;
        }
      } else if (stockStatus === 'out_of_stock') {
        if (qty !== null && qty !== undefined && qty > 0) {
          return false;
        }
      }

      return true;
    });
  }, [items, search, selectedCategory, stockStatus]);

  const resetFilters = useCallback(() => {
    setSearch('');
    setSelectedCategory('all');
    setStockStatus('all');
  }, []);

  const hasActiveFilters = Boolean(
    search.trim() || selectedCategory !== 'all' || stockStatus !== 'all'
  );

  return {
    items,
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
    refetch: fetchData,
  };
}

import { useState, useEffect, useCallback, useMemo } from 'react';
import api from '../../../services/api';
import type {
  InventoryItem,
  InventoryCategory,
  StockStatusFilter,
  InventorySummary,
  CreateInventoryItemPayload,
  UpdateInventoryItemPayload,
} from '../types/inventory.types';
import { LOW_STOCK_THRESHOLD, getStockQty } from '../utils/inventory.utils';
import { isForbiddenError } from '../../../utils/apiError';

export function useInventory(enabled = true) {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [categories, setCategories] = useState<InventoryCategory[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(enabled);
  const [error, setError] = useState<string | null>(null);
  const [isForbidden, setIsForbidden] = useState(false);

  // Filters
  const [search, setSearch] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<number | 'all'>('all');
  const [stockStatus, setStockStatus] = useState<StockStatusFilter>('all');

  const fetchData = useCallback(async () => {
    if (!enabled) return;

    try {
      setIsLoading(true);
      setError(null);

      // 1. User is authorized: Fetch items and categories
      const [itemsResponse, categoriesResponse] = await Promise.all([
        api.get<InventoryItem[]>('/inventory/items'),
        api.get<InventoryCategory[]>('/inventory/categories'),
      ]);

      setItems(itemsResponse.data ?? []);
      setCategories(categoriesResponse.data ?? []);
    } catch (err: unknown) {
      console.error('Failed to load inventory data:', err);
      if (isForbiddenError(err)) {
        setIsForbidden(true);
        return;
      }
      
      setError('Failed to load inventory data. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [enabled]);

  useEffect(() => {
    void fetchData();
  }, [fetchData]);

  // Overall Catalog Summary (based on all items)
  const summary: InventorySummary = useMemo(() => {
    let totalUnits = 0;
    let lowStockCount = 0;
    let outOfStockCount = 0;

    for (const item of items) {
      const qty = getStockQty(item);
      if (qty <= 0) {
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
      const qty = getStockQty(item);
      if (stockStatus === 'in_stock') {
        if (qty < LOW_STOCK_THRESHOLD) {
          return false;
        }
      } else if (stockStatus === 'low_stock') {
        if (qty <= 0 || qty >= LOW_STOCK_THRESHOLD) {
          return false;
        }
      } else if (stockStatus === 'out_of_stock') {
        if (qty > 0) {
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

  const createItem = useCallback(
    async (payload: CreateInventoryItemPayload) => {
      try {
        const response = await api.post<InventoryItem>('/inventory/items', payload);
        await fetchData();
        return response.data;
      } catch (err: any) {
        const msg =
          err.response?.data?.message ||
          err.response?.data?.detail ||
          err.message ||
          'Failed to create inventory item.';
        throw new Error(msg);
      }
    },
    [fetchData]
  );

  const updateItem = useCallback(
    async (id: number, payload: UpdateInventoryItemPayload) => {
      try {
        const response = await api.put<InventoryItem>(`/inventory/items/${id}`, payload);
        await fetchData();
        return response.data;
      } catch (err: any) {
        const msg =
          err.response?.data?.message ||
          err.response?.data?.detail ||
          err.message ||
          'Failed to update inventory item.';
        throw new Error(msg);
      }
    },
    [fetchData]
  );

  const deleteItem = useCallback(
    async (id: number) => {
      try {
        await api.delete(`/inventory/items/${id}`);
        await fetchData();
        return true;
      } catch (err: any) {
        const msg =
          err.response?.data?.message ||
          err.response?.data?.detail ||
          err.message ||
          'Failed to deactivate inventory item.';
        throw new Error(msg);
      }
    },
    [fetchData]
  );

  return {
    items,
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
    refetch: fetchData,
    createItem,
    updateItem,
    deleteItem,
  };
}

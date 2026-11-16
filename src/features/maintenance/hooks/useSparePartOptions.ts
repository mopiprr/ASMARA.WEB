import { useCallback, useEffect, useState } from 'react';

import api from '../../../services/api';

import type {
  InventoryCategory,
  SparePartItem,
} from '../../inventory/types/inventory.types';

export function useSparePartOptions(enabled = true, includeCategories = true) {
  const [spareParts, setSpareParts] = useState<SparePartItem[]>([]);
  const [categories, setCategories] = useState<InventoryCategory[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchOptions = useCallback(async () => {
    if (!enabled) return;

    try {
      setIsLoading(true);
      setError(null);

      // 1. GET /api/inventory/spare-parts (with onlyInStock=false so stock === 0 is INCLUDED)
      // 2. GET /api/inventory/categories?onlyActive=true&trackingType=1 (Consumable categories for custom input, only when needed)
      const sparePartsPromise = api.get<SparePartItem[]>(
        '/inventory/spare-parts',
        {
          params: { onlyInStock: false },
        },
      );

      if (includeCategories) {
        const [sparePartsRes, categoriesRes] = await Promise.all([
          sparePartsPromise,
          api.get<InventoryCategory[]>('/inventory/categories', {
            params: { onlyActive: true, trackingType: 1 },
          }),
        ]);

        setSpareParts(
          Array.isArray(sparePartsRes.data) ? sparePartsRes.data : [],
        );
        setCategories(
          Array.isArray(categoriesRes.data) ? categoriesRes.data : [],
        );
      } else {
        const sparePartsRes = await sparePartsPromise;
        setSpareParts(
          Array.isArray(sparePartsRes.data) ? sparePartsRes.data : [],
        );
        setCategories([]);
      }
    } catch (err: unknown) {
      console.error('Failed to load spare part options:', err);
      setError('Failed to load spare parts or inventory categories.');
    } finally {
      setIsLoading(false);
    }
  }, [enabled, includeCategories]);

  useEffect(() => {
    void fetchOptions();
  }, [fetchOptions]);

  return {
    spareParts,
    categories,
    isLoading,
    error,
    refetch: fetchOptions,
  };
}

import { useCallback, useEffect, useState } from 'react';

import api from '../../../services/api';

import type { AssetStatistics } from '../types/asset.types';

export function useAssetStatistics() {
  const [statistics, setStatistics] = useState<AssetStatistics | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetchStatistics = useCallback(async () => {
    try {
      setIsLoading(true);

      const response = await api.get<AssetStatistics>('/assets/statistics');

      setStatistics(response.data);
    } catch (err: unknown) {
      console.error('Failed to fetch asset statistics:', err);
      setStatistics(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchStatistics();
  }, [fetchStatistics]);

  return {
    statistics,
    isLoading,
    fetchStatistics,
  };
}
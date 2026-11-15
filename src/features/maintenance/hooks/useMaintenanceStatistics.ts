import { useCallback, useEffect, useState } from 'react';

import { maintenanceApi } from '../services/maintenanceApi';

import type { MaintenanceStatisticsData } from '../types/maintenance.types';

export function useMaintenanceStatistics() {
  const [statistics, setStatistics] = useState<MaintenanceStatisticsData | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetchStatistics = useCallback(async () => {
    try {
      setIsLoading(true);

      setStatistics(await maintenanceApi.getMyStatistics());
    } catch (err: unknown) {
      // Card cukup menampilkan "-" kalau gagal, tabel tetap jalan.
      console.error('Failed to fetch maintenance statistics:', err);
      setStatistics(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchStatistics();
  }, [fetchStatistics]);

  return { statistics, isLoading, fetchStatistics };
}
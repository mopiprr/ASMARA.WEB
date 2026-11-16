import { useCallback, useEffect, useState } from 'react';

import { procurementApi } from '../services/procurementApi';

import type { MyTicketStatistics } from '../types/procurement.types';

export function useProcurementStatistics() {
  const [statistics, setStatistics] = useState<MyTicketStatistics | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetchStatistics = useCallback(async () => {
    try {
      setIsLoading(true);

      setStatistics(await procurementApi.getMyStatistics());
    } catch (err: unknown) {
      // Card cukup menampilkan "-" kalau gagal, tabel tetap jalan.
      console.error('Failed to fetch procurement statistics:', err);
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
import { useCallback, useEffect, useState } from 'react';

import api from '../../../services/api';

import type { TicketStatisticsResponse } from '../types/dashboard.types';

// Jumlah tiket Maintenance vs Procurement (untuk chart distribusi).
export function useTicketTypeDistribution(startDate: string, endDate: string) {
  const [distribution, setDistribution] = useState({
    maintenance: 0,
    procurement: 0,
  });
  const [isLoading, setIsLoading] = useState(false);

  const fetchDistribution = useCallback(async () => {
    const dateParams: Record<string, string> = {};

    if (startDate) dateParams.startDate = startDate;
    if (endDate) dateParams.endDate = endDate;

    try {
      setIsLoading(true);

      const [maintenance, procurement] = await Promise.all([
        api.get<TicketStatisticsResponse>('/Dashboard/ticket-statistics', {
          params: { ...dateParams, type: 1 },
        }),
        api.get<TicketStatisticsResponse>('/Dashboard/ticket-statistics', {
          params: { ...dateParams, type: 2 },
        }),
      ]);

      setDistribution({
        maintenance: maintenance.data.totalTickets ?? 0,
        procurement: procurement.data.totalTickets ?? 0,
      });
    } catch (err) {
      console.error('Failed to load ticket type distribution:', err);
    } finally {
      setIsLoading(false);
    }
  }, [startDate, endDate]);

  useEffect(() => {
    void fetchDistribution();
  }, [fetchDistribution]);

  return {
    distribution,
    isLoading,
    refetch: fetchDistribution,
  };
}
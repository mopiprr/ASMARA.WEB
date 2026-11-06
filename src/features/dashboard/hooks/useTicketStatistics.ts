import { useCallback, useEffect, useState } from 'react';
import api from '../../../services/api';
import type {
  TicketStatisticsResponse,
  TicketTypeFilter,
} from '../types/dashboard.types';

export function useTicketStatistics() {
  const [stats, setStats] = useState<TicketStatisticsResponse>({
    totalTickets: 0,
    pendingTickets: 0,
    inProgressTickets: 0,
    completedTickets: 0,
  });
  const [ticketFilter, setTicketFilter] = useState<TicketTypeFilter>('all');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

  const fetchTicketStatistics = useCallback(async () => {
    try {
      setIsLoading(true);
      setError('');

      const params: Record<string, string | number> = {};

      if (ticketFilter === 'maintenance') {
        params.type = 1;
      } else if (ticketFilter === 'procurement') {
        params.type = 2;
      }

      if (startDate) {
        params.startDate = startDate;
      }

      if (endDate) {
        params.endDate = endDate;
      }

      const response = await api.get<TicketStatisticsResponse>(
        '/Dashboard/ticket-statistics',
        { params }
      );

      const raw = response.data as unknown as Record<string, number>;

      setStats({
        totalTickets: raw.totalTickets ?? raw.TotalTickets ?? 0,
        pendingTickets: raw.pendingTickets ?? raw.PendingTickets ?? 0,
        inProgressTickets: raw.inProgressTickets ?? raw.InProgressTickets ?? 0,
        completedTickets: raw.completedTickets ?? raw.CompletedTickets ?? 0,
      });
    } catch (err: unknown) {
      console.error('Failed to fetch ticket statistics:', err);
      const apiErr = err as {
        response?: {
          data?: {
            message?: string;
            detail?: string;
            title?: string;
          };
        };
        message?: string;
      };

      setError(
        apiErr.response?.data?.detail ||
          apiErr.response?.data?.message ||
          apiErr.response?.data?.title ||
          apiErr.message ||
          'Failed to load ticket statistics.'
      );
    } finally {
      setIsLoading(false);
    }
  }, [ticketFilter, startDate, endDate]);

  useEffect(() => {
    void fetchTicketStatistics();
  }, [fetchTicketStatistics]);

  return {
    stats,
    ticketFilter,
    setTicketFilter,
    startDate,
    setStartDate,
    endDate,
    setEndDate,
    isLoading,
    error,
    refetch: fetchTicketStatistics,
  };
}

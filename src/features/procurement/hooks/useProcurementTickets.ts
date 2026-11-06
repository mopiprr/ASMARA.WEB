import { useCallback, useEffect, useState } from 'react';

import api from '../../../services/api';

import type {
  ProcurementTicketListItem,
  PagedResult,
} from '../types/procurement.types';

export function useProcurementTickets() {
  const [tickets, setTickets] = useState<ProcurementTicketListItem[]>([]);
  const [isLoadingTickets, setIsLoadingTickets] = useState(false);
  const [ticketError, setTicketError] = useState('');

  const fetchTickets = useCallback(async () => {
    try {
      setIsLoadingTickets(true);
      setTicketError('');

      const response = await api.get<
        PagedResult<ProcurementTicketListItem>
      >('/tickets', {
        params: {
          type: 2,
          page: 1,
          pageSize: 10,
          desc: true,
        },
      });

      setTickets(response.data.items ?? []);
    } catch (error: unknown) {
      console.error('Failed to fetch procurement tickets:', error);

      const apiError = error as {
        response?: {
          data?: {
            message?: string;
            detail?: string;
            title?: string;
          };
        };
        message?: string;
      };

      setTicketError(
        apiError.response?.data?.detail ||
          apiError.response?.data?.message ||
          apiError.response?.data?.title ||
          apiError.message ||
          'Failed to load procurement requests.'
      );
    } finally {
      setIsLoadingTickets(false);
    }
  }, []);

  useEffect(() => {
    void fetchTickets();
  }, [fetchTickets]);

  return {
    tickets,
    setTickets,
    isLoadingTickets,
    ticketError,
    fetchTickets,
  };
}
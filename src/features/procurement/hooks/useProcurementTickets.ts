
import { useCallback, useEffect, useState } from 'react';

import api from '../../../services/api';
import type { ProcurementTicket } from '../types/procurement.types';

export function useProcurementTickets() {
  const [tickets, setTickets] = useState<ProcurementTicket[]>([]);
  const [isLoadingTickets, setIsLoadingTickets] = useState(false);
  const [ticketError, setTicketError] = useState('');

  const fetchTickets = useCallback(async () => {
    try {
      setIsLoadingTickets(true);
      setTicketError('');

      const response = await api.get<ProcurementTicket[]>('/procurements');

      setTickets(
        Array.isArray(response.data) ? response.data : []
      );
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

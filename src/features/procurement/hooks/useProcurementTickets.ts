import { useCallback, useEffect, useState } from 'react';

import api from '../../../services/api';

import type {
  ProcurementTicketListItem,
  PagedResult,
} from '../types/procurement.types';

// Field sorting yang didukung backend (GET /api/tickets -> sortBy).
export type TicketSortField = 'ticketNumber' | 'subject' | 'date' | 'status';

export function useProcurementTickets() {
  const PAGE_SIZE = 10;
  const [sortBy, setSortBy] = useState<TicketSortField>('date');
  const [desc, setDesc] = useState(true);

  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

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
          page,
          pageSize: PAGE_SIZE,
          sortBy,
          desc,
        },
      });

      setTickets(response.data.items ?? []);
      setTotalCount(response.data.totalCount ?? 0);
      setTotalPages(response.data.totalPages ?? 0);
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
  }, [sortBy, desc, page]);

  const toggleSort = useCallback((field: TicketSortField) => {
    if (field === sortBy) {
      setDesc((previous) => !previous);
    } else {
      setSortBy(field);
      setDesc(false);
    }

    setPage(1);
  }, [sortBy]);

  useEffect(() => {
    void fetchTickets();
  }, [fetchTickets]);

  return {
    tickets,
    setTickets,
    isLoadingTickets,
    ticketError,
    fetchTickets,
    sortBy,
    desc,
    toggleSort,
    page,
    setPage,
    totalCount,
    totalPages,
  };
}
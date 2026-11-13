import { useCallback, useEffect, useState } from 'react';

import { procurementApi } from '../services/procurementApi';
import { getApiErrorMessage } from '../utils/procurement.utils';

import type { ProcurementTicketListItem } from '../types/procurement.types';

// Field sorting yang didukung backend (GET /api/tickets -> sortBy).
export type TicketSortField = 'ticketNumber' | 'subject' | 'date' | 'status';

const PAGE_SIZE = 10;

export function useProcurementTickets() {
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

      const result = await procurementApi.getMyTickets({
        page,
        pageSize: PAGE_SIZE,
        sortBy,
        desc,
      });

      setTickets(result.items ?? []);
      setTotalCount(result.totalCount ?? 0);
      setTotalPages(result.totalPages ?? 0);
    } catch (error: unknown) {
      console.error('Failed to fetch procurement tickets:', error);

      setTicketError(
        getApiErrorMessage(error, 'Failed to load procurement requests.')
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
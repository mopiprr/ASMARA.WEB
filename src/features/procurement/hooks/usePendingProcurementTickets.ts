import { useCallback, useEffect, useState } from 'react';

import { procurementApi } from '../services/procurementApi';
import { getApiErrorMessage } from '../utils/procurement.utils';

import type {
  PendingProcurementTicket,
  ProcurementTicket,
} from '../types/procurement.types';

export type PendingSortField = 'ticketNumber' | 'subject' | 'requester' | 'date';

const PAGE_SIZE = 10;

const PENDING_ERROR = 'Failed to load pending procurement tickets.';

export function usePendingProcurementTickets() {
  const [tickets, setTickets] = useState<PendingProcurementTicket[]>([]);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<PendingSortField>('date');
  const [desc, setDesc] = useState(true);

  const [page, setPage] = useState(1);

  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const fetchPendingTickets = useCallback(async () => {
    try {
      setIsLoading(true);
      setError('');

      const result = await procurementApi.getPendingTickets({
        search: search.trim() || undefined,
        page,
        pageSize: PAGE_SIZE,
        sortBy,
        desc,
      });

      setTickets(result.items ?? []);
      setTotalCount(result.totalCount ?? 0);
      setTotalPages(result.totalPages ?? 0);
    } catch (error: unknown) {
      console.error('Failed to fetch pending procurement tickets:', error);

      setTickets([]);
      setTotalCount(0);
      setTotalPages(0);
      setError(getApiErrorMessage(error, PENDING_ERROR));
    } finally {
      setIsLoading(false);
    }
  }, [search, page, sortBy, desc]);

  const fetchPendingTicketById = useCallback(async (
    id: string
  ): Promise<ProcurementTicket> => {
    try {
      return await procurementApi.getPendingTicketById(id);
    } catch (error: unknown) {
      console.error('Failed to fetch pending procurement detail:', error);

      throw new Error(getApiErrorMessage(error, PENDING_ERROR));
    }
  }, []);

  useEffect(() => {
    void fetchPendingTickets();
  }, [fetchPendingTickets]);

  const handleSearchChange = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  const toggleSort = (field: PendingSortField) => {
    if (field === sortBy) {
      setDesc((previous) => !previous);
    } else {
      setSortBy(field);
      setDesc(false);
    }

    setPage(1);
  };

  const goToPage = (nextPage: number) => {
    if (nextPage < 1 || nextPage > totalPages) return;

    setPage(nextPage);
  };

  return {
    tickets,
    isLoading,
    error,

    search,
    setSearch: handleSearchChange,

    page,
    pageSize: PAGE_SIZE,
    totalCount,
    totalPages,

    fetchPendingTickets,
    fetchPendingTicketById,
    goToPage,

    sortBy,
    desc,
    toggleSort,
  };
}

import { useCallback, useEffect, useState } from 'react';

import api from '../../../services/api';

import type {
  MaintenanceTicket,
  PendingMaintenanceTicket,
  PagedResult,
} from '../types/maintenance.types';

import { getMaintenanceApiError } from './useMaintenanceTickets';

const PAGE_SIZE = 10;

export function usePendingMaintenanceTickets() {
  const [tickets, setTickets] = useState<
    PendingMaintenanceTicket[]
  >([]);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const fetchPendingTickets = useCallback(async () => {
    try {
      setIsLoading(true);
      setError('');

      const response = await api.get<
        PagedResult<PendingMaintenanceTicket>
      >('/tickets/pending', {
        params: {
          Type: 'Maintenance',
          Search: search.trim() || undefined,
          Page: page,
          PageSize: PAGE_SIZE,
          SortBy: 'date',
          Desc: true,
        },
      });

      const result = response.data;

      setTickets(result.items ?? []);
      setTotalCount(result.totalCount ?? 0);
      setTotalPages(result.totalPages ?? 0);
    } catch (error: unknown) {
      console.error(
        'Failed to fetch pending maintenance tickets:',
        error
      );

      setTickets([]);
      setTotalCount(0);
      setTotalPages(0);

      setError(
        getMaintenanceApiError(
          error,
          'Failed to load pending maintenance tickets.'
        )
      );
    } finally {
      setIsLoading(false);
    }
  }, [search, page]);

  const fetchPendingTicketById = useCallback(
    async (id: string): Promise<MaintenanceTicket> => {
      try {
        const response = await api.get<MaintenanceTicket>(
          `/tickets/pending/${id}`
        );

        return response.data;
      } catch (error: unknown) {
        console.error(
          'Failed to fetch pending maintenance detail:',
          error
        );

        throw new Error(
          getMaintenanceApiError(
            error,
            'Failed to load pending maintenance detail.'
          )
        );
      }
    },
    []
  );

  useEffect(() => {
    void fetchPendingTickets();
  }, [fetchPendingTickets]);

  const handleSearchChange = (value: string) => {
    setSearch(value);
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
  };
}

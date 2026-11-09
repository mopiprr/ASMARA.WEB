
import { useCallback, useEffect, useState } from 'react';

import api from '../../../services/api';

import type {
  MaintenanceTicket,
  MaintenanceTicketListItem,
  PagedResult,
} from '../types/maintenance.types';

const PAGE_SIZE = 10;

interface ApiErrorResponse {
  response?: {
    data?: {
      message?: string;
      detail?: string;
      title?: string;
    };
  };
  message?: string;
}

function getErrorMessage(
  error: unknown,
  fallback: string
): string {
  const apiError = error as ApiErrorResponse;

  return (
    apiError.response?.data?.detail ||
    apiError.response?.data?.message ||
    apiError.response?.data?.title ||
    apiError.message ||
    fallback
  );
}

// Shared error handler
export function getMaintenanceApiError(
  error: unknown,
  fallback: string
): string {
  return getErrorMessage(error, fallback);
}

export function useMaintenanceTickets() {
  const [tickets, setTickets] = useState<
    MaintenanceTicketListItem[]
  >([]);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const fetchTickets = useCallback(async () => {
    try {
      setIsLoading(true);
      setError('');

      const response = await api.get<
        PagedResult<MaintenanceTicketListItem>
      >('/tickets', {
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
        'Failed to fetch maintenance tickets:',
        error
      );

      setTickets([]);
      setTotalCount(0);
      setTotalPages(0);

      setError(
        getMaintenanceApiError(
          error,
          'Failed to load maintenance requests.'
        )
      );
    } finally {
      setIsLoading(false);
    }
  }, [search, page]);

  const fetchTicketById = useCallback(
    async (id: string): Promise<MaintenanceTicket> => {
      try {
        const response = await api.get<MaintenanceTicket>(
          `/tickets/${id}`
        );

        return response.data;
      } catch (error: unknown) {
        console.error(
          'Failed to fetch maintenance detail:',
          error
        );

        throw new Error(
          getMaintenanceApiError(
            error,
            'Failed to load maintenance detail.'
          )
        );
      }
    },
    []
  );

  useEffect(() => {
    void fetchTickets();
  }, [fetchTickets]);

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

    fetchTickets,
    fetchTicketById,
    goToPage,
  };
}

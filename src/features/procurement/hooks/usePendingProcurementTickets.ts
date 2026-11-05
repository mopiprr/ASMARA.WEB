import { useCallback, useEffect, useState } from 'react';

import api from '../../../services/api';

import type {
  PagedResult,
  PendingProcurementTicket,
  ProcurementTicket,
} from '../types/procurement.types';

const PAGE_SIZE = 10;

export function usePendingProcurementTickets() {
  const [tickets, setTickets] = useState<PendingProcurementTicket[]>([]);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const getErrorMessage = (error: unknown): string => {
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

    return (
      apiError.response?.data?.detail ||
      apiError.response?.data?.message ||
      apiError.response?.data?.title ||
      apiError.message ||
      'Failed to load pending procurement tickets.'
    );
  };

  const fetchPendingTickets = useCallback(async () => {
    try {
      setIsLoading(true);
      setError('');

      const response = await api.get<PagedResult<PendingProcurementTicket>>(
        '/tickets/pending',
        {
          params: {
            Type: 'Procurement',
            Search: search.trim() || undefined,
            Page: page,
            PageSize: PAGE_SIZE,
            SortBy: 'date',
            Desc: true,
          },
        }
      );

      const result = response.data;

      setTickets(result.items ?? []);
      setTotalCount(result.totalCount ?? 0);
      setTotalPages(result.totalPages ?? 0);
    } catch (error: unknown) {
      console.error('Failed to fetch pending procurement tickets:', error);

      setTickets([]);
      setTotalCount(0);
      setTotalPages(0);
      setError(getErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  }, [search, page]);

  const fetchPendingTicketById = async (
    id: string
  ): Promise<ProcurementTicket> => {
    try {
      const response = await api.get<ProcurementTicket>(
        `/tickets/pending/${id}`
      );

      return response.data;
    } catch (error: unknown) {
      console.error('Failed to fetch pending procurement detail:', error);

      throw new Error(getErrorMessage(error));
    }
  };

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
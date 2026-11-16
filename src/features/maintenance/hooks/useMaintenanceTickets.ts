import { useCallback, useEffect, useState } from 'react';

import { maintenanceApi } from '../services/maintenanceApi';
import { getApiErrorMessage } from '../utils/maintenance.utils';

import type { MaintenanceTicketListItem } from '../types/maintenance.types';

// Field sorting yang didukung backend (GET /api/tickets -> SortBy).
export type MaintenanceSortField = 'ticketNumber' | 'subject' | 'date' | 'status';

const PAGE_SIZE = 10;

// Tab My Requests.
export function useMaintenanceTickets() {
  const [tickets, setTickets] = useState<MaintenanceTicketListItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<MaintenanceSortField>('date');
  const [desc, setDesc] = useState(true);
  const [page, setPage] = useState(1);

  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const fetchTickets = useCallback(async () => {
    try {
      setIsLoading(true);
      setError('');

      const result = await maintenanceApi.getMyTickets({
        search: search.trim() || undefined,
        page,
        pageSize: PAGE_SIZE,
        sortBy,
        desc,
      });

      setTickets(result.items ?? []);
      setTotalCount(result.totalCount ?? 0);
      setTotalPages(result.totalPages ?? 0);
    } catch (err: unknown) {
      console.error('Failed to fetch maintenance tickets:', err);

      setTickets([]);
      setTotalCount(0);
      setTotalPages(0);
      setError(getApiErrorMessage(err, 'Failed to load maintenance requests.'));
    } finally {
      setIsLoading(false);
    }
  }, [search, page, sortBy, desc]);

  useEffect(() => {
    void fetchTickets();
  }, [fetchTickets]);

  const handleSearchChange = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  const toggleSort = (field: MaintenanceSortField) => {
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
    sortBy,
    desc,
    toggleSort,
    page,
    totalCount,
    totalPages,
    goToPage,
    fetchTickets,
  };
}
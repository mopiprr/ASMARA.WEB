import { useCallback, useEffect, useState } from 'react';

import { useDebouncedValue } from '../../../hooks/useDebouncedValue';
import { extractApiErrorMessage } from '../../../utils/apiError';
import { maintenanceApi } from '../services/maintenanceApi';

import type {
  MaintenanceTicket,
  MaintenanceTicketListItem,
} from '../types/maintenance.types';

export type MaintenanceSortField =
  | 'ticketNumber'
  | 'subject'
  | 'date'
  | 'status';

const PAGE_SIZE = 10;

// Shared error helper preserved for existing callers
export function getMaintenanceApiError(
  error: unknown,
  fallback: string,
): string {
  return extractApiErrorMessage(error, fallback);
}

export function useMaintenanceTickets() {
  const [tickets, setTickets] = useState<MaintenanceTicketListItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const [search, setSearch] = useState('');
  const debouncedSearch = useDebouncedValue(search, 350);

  const [sortBy, setSortBy] = useState<MaintenanceSortField>('date');
  const [desc, setDesc] = useState(true);

  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const fetchTickets = useCallback(async () => {
    try {
      setIsLoading(true);
      setError('');

      const result = await maintenanceApi.getTickets({
        search: debouncedSearch.trim() || undefined,
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
      setError(
        extractApiErrorMessage(err, 'Failed to load maintenance requests.'),
      );
    } finally {
      setIsLoading(false);
    }
  }, [debouncedSearch, page, sortBy, desc]);

  const fetchTicketById = useCallback(
    async (id: string): Promise<MaintenanceTicket> => {
      try {
        return await maintenanceApi.getTicketById(id);
      } catch (err: unknown) {
        console.error('Failed to fetch maintenance detail:', err);
        throw new Error(
          extractApiErrorMessage(err, 'Failed to load maintenance detail.'),
        );
      }
    },
    [],
  );

  useEffect(() => {
    void fetchTickets();
  }, [fetchTickets]);

  const handleSearchChange = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  const toggleSort = useCallback(
    (field: MaintenanceSortField) => {
      if (field === sortBy) {
        setDesc((previous) => !previous);
      } else {
        setSortBy(field);
        setDesc(false);
      }
      setPage(1);
    },
    [sortBy],
  );

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
    pageSize: PAGE_SIZE,
    totalCount,
    totalPages,
    fetchTickets,
    fetchTicketById,
    goToPage,
  };
}

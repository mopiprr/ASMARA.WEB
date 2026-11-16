import { useCallback, useEffect, useState } from 'react';

import { useDebouncedValue } from '../../../hooks/useDebouncedValue';
import { maintenanceApi } from '../services/maintenanceApi';
import { getApiErrorMessage } from '../utils/maintenance.utils';

import type {
  MaintenanceTicket,
  PendingMaintenanceTicket,
} from '../types/maintenance.types';

export type PendingMaintenanceSortField = 'ticketNumber' | 'subject' | 'requester' | 'date';

const PAGE_SIZE = 10;

const PENDING_ERROR = 'Failed to load pending maintenance tasks.';

// Tab Pending Tasks.
export function usePendingMaintenanceTickets() {
  const [tickets, setTickets] = useState<PendingMaintenanceTicket[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const [search, setSearch] = useState('');
  const debouncedSearch = useDebouncedValue(search, 350);
  const [sortBy, setSortBy] = useState<PendingMaintenanceSortField>('date');
  const [desc, setDesc] = useState(true);
  const [page, setPage] = useState(1);

  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const fetchPendingTickets = useCallback(async () => {
    try {
      setIsLoading(true);
      setError('');

      const result = await maintenanceApi.getPendingTickets({
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
      console.error('Failed to fetch pending maintenance tickets:', err);

      setTickets([]);
      setTotalCount(0);
      setTotalPages(0);
      setError(getApiErrorMessage(err, PENDING_ERROR));
    } finally {
      setIsLoading(false);
    }
  }, [debouncedSearch, page, sortBy, desc]);

  // Detail tiket yang menunggu aksi user ini (dengan permission tombol).
  const fetchPendingTicketById = useCallback(async (id: string): Promise<MaintenanceTicket> => {
    try {
      return await maintenanceApi.getPendingTicketById(id);
    } catch (err: unknown) {
      console.error('Failed to fetch pending maintenance detail:', err);

      throw new Error(getApiErrorMessage(err, PENDING_ERROR));
    }
  }, []);

  useEffect(() => {
    void fetchPendingTickets();
  }, [fetchPendingTickets]);

  const handleSearchChange = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  const toggleSort = (field: PendingMaintenanceSortField) => {
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
    fetchPendingTickets,
    fetchPendingTicketById,
  };
}
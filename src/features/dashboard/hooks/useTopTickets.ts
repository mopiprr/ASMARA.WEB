import { useCallback, useMemo, useState } from 'react';

import api from '../../../services/api';

import { toTopTicketItem } from '../utils/dashboard.utils';

import type { StatCategory, TopTicketItem } from '../types/dashboard.types';

// Panel "Top 5" yang terbuka saat kategori pada diagram diklik.
export function useTopTickets(includeSubordinates: boolean = false) {
  const [activeCategory, setActiveCategory] = useState<StatCategory | null>(null);
  const [tickets, setTickets] = useState<TopTicketItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchTopTickets = useCallback(
    async (category: StatCategory) => {
      let url = '/tickets';
      let params: Record<string, unknown> = { page: 1, pageSize: 5, desc: true };

      switch (category) {
        case 'procurement':
          params = { ...params, type: 2, includeSubordinates };
          break;
        case 'maintenance':
          params = { ...params, type: 1, includeSubordinates };
          break;
        case 'pending':
          url = '/tickets/pending';
          break;
        case 'in_progress':
          params = { ...params, isClosed: false, includeSubordinates };
          break;
        case 'completed':
          params = { ...params, isClosed: true, includeSubordinates };
          break;
      }

      try {
        setIsLoading(true);
        setError('');

        const response = await api.get<{ items?: Record<string, unknown>[] }>(
          url,
          { params }
        );

        setTickets((response.data.items ?? []).map(toTopTicketItem));
      } catch (err: unknown) {
        console.error('Failed to load top tickets:', err);
        setError('Gagal memuat daftar tiket top 5.');
      } finally {
        setIsLoading(false);
      }
    },
    [includeSubordinates]
  );

  // Klik item yang sama -> tutup; item lain -> buka + ambil data.
  const toggleCategory = useCallback(
    (category: StatCategory) => {
      if (activeCategory === category) {
        setActiveCategory(null);
        return;
      }

      setActiveCategory(category);
      void fetchTopTickets(category);
    },
    [activeCategory, fetchTopTickets]
  );

  const close = useCallback(() => setActiveCategory(null), []);

  const procurementTickets = useMemo(
    () => tickets.filter((ticket) => ticket.ticketType === 2),
    [tickets]
  );

  const maintenanceTickets = useMemo(
    () => tickets.filter((ticket) => ticket.ticketType === 1),
    [tickets]
  );

  return {
    activeCategory,
    toggleCategory,
    close,
    tickets,
    procurementTickets,
    maintenanceTickets,
    isLoading,
    error,
  };
}
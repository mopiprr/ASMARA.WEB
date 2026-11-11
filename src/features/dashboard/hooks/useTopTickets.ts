import { useCallback, useMemo, useState } from 'react';

import api from '../../../services/api';

import { toTopTicketItem } from '../utils/dashboard.utils';

import type { StatCategory, TopTicketItem } from '../types/dashboard.types';

// Endpoint + filter untuk tiap kartu statistik.
const TOP_TICKET_SOURCES: Record<
  StatCategory,
  { url: string; params?: Record<string, boolean> }
> = {
  total: { url: '/tickets' },
  pending: { url: '/tickets/pending' },
  in_progress: { url: '/tickets', params: { isClosed: false } },
  completed: { url: '/tickets', params: { isClosed: true } },
};

// Panel "Top 5" yang terbuka saat kartu statistik diklik.
export function useTopTickets() {
  const [activeCategory, setActiveCategory] = useState<StatCategory | null>(null);
  const [tickets, setTickets] = useState<TopTicketItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchTopTickets = useCallback(async (category: StatCategory) => {
    const source = TOP_TICKET_SOURCES[category];

    try {
      setIsLoading(true);
      setError('');

      const response = await api.get<{ items?: Record<string, unknown>[] }>(
        source.url,
        { params: { ...source.params, page: 1, pageSize: 5, desc: true } }
      );

      setTickets((response.data.items ?? []).map(toTopTicketItem));
    } catch (err: unknown) {
      console.error('Failed to load top tickets:', err);
      setError('Gagal memuat daftar tiket top 5.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Klik kartu yang sama -> tutup; kartu lain -> buka + ambil data.
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
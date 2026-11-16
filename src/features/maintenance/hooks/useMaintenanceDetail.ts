import { useCallback, useState } from 'react';

import { maintenanceApi } from '../services/maintenanceApi';
import { getApiErrorMessage } from '../utils/maintenance.utils';

import type {
  MaintenanceTicket,
  MaintenanceTicketListItem,
  PendingMaintenanceTicket,
} from '../types/maintenance.types';

const DETAIL_ERROR = 'Failed to load maintenance ticket detail.';

interface UseMaintenanceDetailOptions {
  fetchPendingTicketById: (id: string) => Promise<MaintenanceTicket>;
  // Dipanggil sebelum membuka detail dari tabel (membersihkan error aksi sebelumnya).
  onBeforeOpen: () => void;
}

// Tiket yang sedang dibuka di modal detail.
export function useMaintenanceDetail({
  fetchPendingTicketById,
  onBeforeOpen,
}: UseMaintenanceDetailOptions) {
  const [selectedTicket, setSelectedTicket] = useState<MaintenanceTicket | null>(null);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);
  const [detailError, setDetailError] = useState('');

  // Tab My Requests -> GET /tickets/{id}.
  const openTicket = async (ticket: MaintenanceTicketListItem) => {
    try {
      setIsLoadingDetail(true);
      setDetailError('');
      onBeforeOpen();
      setSelectedTicket(null);

      setSelectedTicket(await maintenanceApi.getTicketById(ticket.id));
    } catch (error: unknown) {
      console.error('Failed to open maintenance ticket:', error);

      setDetailError(getApiErrorMessage(error, DETAIL_ERROR));
    } finally {
      setIsLoadingDetail(false);
    }
  };

  // Tab Pending Tasks -> GET /tickets/pending/{id}.
  const openPendingTicket = async (ticket: PendingMaintenanceTicket) => {
    try {
      setIsLoadingDetail(true);
      setDetailError('');
      onBeforeOpen();
      setSelectedTicket(null);

      setSelectedTicket(await fetchPendingTicketById(ticket.id));
    } catch (error: unknown) {
      console.error('Failed to open pending maintenance ticket:', error);

      setDetailError(error instanceof Error ? error.message : DETAIL_ERROR);
    } finally {
      setIsLoadingDetail(false);
    }
  };

  // Dibuka dari link (?tab=...&ticketId=...), misalnya dari Dashboard.
  const openTicketFromUrl = useCallback(
    async (ticketId: string, isPendingTab: boolean) => {
      try {
        setIsLoadingDetail(true);
        setDetailError('');

        if (isPendingTab) {
          try {
            setSelectedTicket(await fetchPendingTicketById(ticketId));
          } catch {
            // Bukan task pending user ini -> buka sebagai detail biasa.
            setSelectedTicket(await maintenanceApi.getTicketById(ticketId));
          }
        } else {
          setSelectedTicket(await maintenanceApi.getTicketById(ticketId));
        }
      } catch (err: unknown) {
        console.error('Failed to open maintenance ticket from URL param:', err);

        setDetailError(getApiErrorMessage(err, DETAIL_ERROR));
      } finally {
        setIsLoadingDetail(false);
      }
    },
    [fetchPendingTicketById],
  );

  const clearDetail = () => {
    setSelectedTicket(null);
    setDetailError('');
  };

  return {
    selectedTicket,
    isLoadingDetail,
    detailError,
    openTicket,
    openPendingTicket,
    openTicketFromUrl,
    clearDetail,
  };
}
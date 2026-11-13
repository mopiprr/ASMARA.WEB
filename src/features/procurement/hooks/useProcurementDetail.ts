import { useCallback, useState } from 'react';

import { procurementApi } from '../services/procurementApi';
import { getApiErrorMessage } from '../utils/procurement.utils';

import type {
  PendingProcurementTicket,
  ProcurementTicket,
  ProcurementTicketListItem,
} from '../types/procurement.types';

const DETAIL_ERROR = 'Failed to load procurement ticket detail.';

interface UseProcurementDetailOptions {
  // Dari usePendingProcurementTickets (sudah mengubah error menjadi Error(message)).
  fetchPendingTicketById: (id: string) => Promise<ProcurementTicket>;

  // Dipanggil sebelum membuka detail dari tabel (membersihkan error aksi sebelumnya).
  onBeforeOpen: () => void;
}

// Mengatur tiket yang sedang dibuka di modal detail.
export function useProcurementDetail({
  fetchPendingTicketById,
  onBeforeOpen,
}: UseProcurementDetailOptions) {
  const [selectedTicket, setSelectedTicket] =
    useState<ProcurementTicket | null>(null);

  const [isLoadingDetail, setIsLoadingDetail] = useState(false);

  const [detailError, setDetailError] = useState('');

  // Tab My Requests -> GET /tickets/{id} (hanya lihat).
  const openTicket = async (ticket: ProcurementTicketListItem) => {
    try {
      setIsLoadingDetail(true);
      setDetailError('');
      onBeforeOpen();
      setSelectedTicket(null);

      setSelectedTicket(await procurementApi.getTicketById(ticket.id));
    } catch (error: unknown) {
      console.error('Failed to open procurement ticket:', error);

      setDetailError(getApiErrorMessage(error, DETAIL_ERROR));
    } finally {
      setIsLoadingDetail(false);
    }
  };

  // Tab Pending Approval -> GET /tickets/pending/{id} (dengan permission tombol).
  const openPendingTicket = async (ticket: PendingProcurementTicket) => {
    try {
      setIsLoadingDetail(true);
      setDetailError('');
      onBeforeOpen();
      setSelectedTicket(null);

      setSelectedTicket(await fetchPendingTicketById(ticket.id));
    } catch (error: unknown) {
      console.error('Failed to open pending ticket:', error);

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
            // Jika tiket ini bukan task pending untuk user ini (mis. tiket requester sendiri),
            // fallback ambil detail tiket reguler agar modal tetap terbuka.
            setSelectedTicket(await procurementApi.getTicketById(ticketId));
          }
        } else {
          setSelectedTicket(await procurementApi.getTicketById(ticketId));
        }
      } catch (err: unknown) {
        console.error('Failed to open ticket from URL param:', err);

        setDetailError(
          getApiErrorMessage(err, 'Failed to load ticket detail from URL.', [
            'detail',
            'message',
          ])
        );
      } finally {
        setIsLoadingDetail(false);
      }
    },
    [fetchPendingTicketById]
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
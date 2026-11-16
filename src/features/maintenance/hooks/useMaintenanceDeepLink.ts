import { useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';

import type { MaintenanceTab } from '../types/maintenance.types';

interface UseMaintenanceDeepLinkOptions {
  setActiveTab: (tab: MaintenanceTab) => void;
  openTicketFromUrl: (ticketId: string, isPendingTab: boolean) => Promise<void>;
}

// Membaca ?tab=...&ticketId=... (link dari Dashboard) lalu memilih tab dan membuka detail.
export function useMaintenanceDeepLink({
  setActiveTab,
  openTicketFromUrl,
}: UseMaintenanceDeepLinkOptions) {
  const [searchParams] = useSearchParams();

  // Supaya ticketId yang sama tidak dibuka berulang kali.
  const handledTicketIdRef = useRef<string | null>(null);

  useEffect(() => {
    const tabParam = searchParams.get('tab');

    if (tabParam === 'pending') {
      setActiveTab('pending');
    } else if (tabParam === 'requests' || tabParam === 'my_request') {
      setActiveTab('requests');
    }

    const ticketIdParam = searchParams.get('ticketId');

    if (!ticketIdParam) {
      handledTicketIdRef.current = null;
      return;
    }

    if (handledTicketIdRef.current === ticketIdParam) return;

    handledTicketIdRef.current = ticketIdParam;

    void openTicketFromUrl(ticketIdParam, tabParam === 'pending');
  }, [searchParams, setActiveTab, openTicketFromUrl]);

  const resetHandledTicket = () => {
    handledTicketIdRef.current = null;
  };

  return { resetHandledTicket };
}
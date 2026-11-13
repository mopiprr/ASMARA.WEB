import api from '../../../services/api';

import type {
  CategoryOption,
  ItemOption,
  MyTicketStatistics,
  PagedResult,
  PendingProcurementTicket,
  ProcurementPayload,
  ProcurementTicket,
  ProcurementTicketListItem,
  ResubmitProcurementPayload,
} from '../types/procurement.types';

// Semua pemanggilan API untuk fitur Procurement ada di sini.
// Hook cukup memanggil fungsi ini lalu mengurus state (loading, error).
export const procurementApi = {
  // ==========================================
  // LIST & DETAIL
  // ==========================================

  async getMyTickets(params: {
    page: number;
    pageSize: number;
    sortBy: string;
    desc: boolean;
  }): Promise<PagedResult<ProcurementTicketListItem>> {
    const response = await api.get<PagedResult<ProcurementTicketListItem>>(
      '/tickets',
      { params: { type: 2, ...params } }
    );

    return response.data;
  },

  async getPendingTickets(params: {
    search?: string;
    page: number;
    pageSize: number;
    sortBy: string;
    desc: boolean;
  }): Promise<PagedResult<PendingProcurementTicket>> {
    const response = await api.get<PagedResult<PendingProcurementTicket>>(
      '/tickets/pending',
      {
        params: {
          Type: 'Procurement',
          Search: params.search,
          Page: params.page,
          PageSize: params.pageSize,
          SortBy: params.sortBy,
          Desc: params.desc,
        },
      }
    );

    return response.data;
  },

  // Detail untuk dilihat (tab My Requests). Permission selalu false.
  async getTicketById(id: string): Promise<ProcurementTicket> {
    const response = await api.get<ProcurementTicket>(`/tickets/${id}`);

    return response.data;
  },

  // Detail tiket yang menunggu aksi user ini, beserta permission tombolnya.
  async getPendingTicketById(id: string): Promise<ProcurementTicket> {
    const response = await api.get<ProcurementTicket>(`/tickets/pending/${id}`);

    return response.data;
  },

  async getMyStatistics(): Promise<MyTicketStatistics> {
    const response = await api.get<MyTicketStatistics>(
      '/tickets/my-statistics',
      { params: { type: 2 } } // 2 = Procurement
    );

    return response.data;
  },

  // ==========================================
  // ACTIONS
  // ==========================================

  async create(payload: ProcurementPayload): Promise<void> {
    await api.post('/procurements', payload);
  },

  // action: 'Approve' | 'Revise' | 'Reject'
  async executeAction(
    ticketId: string,
    action: string,
    note: string | null
  ): Promise<void> {
    await api.post(`/procurements/${ticketId}/action`, { action, note });
  },

  async receiveGoods(
    ticketId: string,
    note: string,
    proofFile: File
  ): Promise<void> {
    const formData = new FormData();
    formData.append('note', note);
    formData.append('proofFile', proofFile);

    await api.post(`/procurements/${ticketId}/receive-goods`, formData, {
      headers: { 'Content-Type': undefined },
    });
  },

  async resubmit(
    ticketId: string,
    payload: ResubmitProcurementPayload
  ): Promise<void> {
    await api.post(`/procurements/${ticketId}/resubmit`, payload);
  },

  // ==========================================
  // INVENTORY OPTIONS
  // ==========================================

  async getCategories(): Promise<CategoryOption[]> {
    const response = await api.get<CategoryOption[]>('/inventory/categories');

    return response.data;
  },

  async getItemsByCategory(categoryId: string): Promise<ItemOption[]> {
    const response = await api.get<ItemOption[]>('/inventory/items', {
      params: { categoryId },
    });

    return response.data;
  },

  // ==========================================
  // PURCHASE PROOF
  // ==========================================

  async getPurchaseProof(ticketId: string, signal: AbortSignal): Promise<Blob> {
    const response = await api.get<Blob>(`/tickets/${ticketId}/purchase-proof`, {
      responseType: 'blob',
      signal,
    });

    return response.data;
  },
};
import api from '../../../services/api';

import type {
  AssignMaintenanceHandlerPayload,
  CreateMaintenancePayload,
  MaintenanceAssetOption,
  MaintenanceChildTicketResult,
  MaintenanceHandlerOption,
  MaintenanceNotePayload,
  MaintenancePartCheckPayload,
  MaintenanceReplacementPayload,
  MaintenanceTicket,
  MaintenanceTicketListItem,
  MaintenanceTransitionResult,
  OrderMaintenancePartPayload,
  PagedResult,
  PendingMaintenanceTicket,
  SendMaintenanceReplacementPayload,
  SubmitRepairResultPayload,
} from '../types/maintenance.types';

export interface ReplacementAssetOption {
  assetId: number;
  assetTag: string;
  itemName: string;
  categoryName: string;
}

/**
 * Centralized API layer for all Maintenance endpoints.
 */
export const maintenanceApi = {
  async getTickets(params: {
    search?: string;
    page: number;
    pageSize: number;
    sortBy: string;
    desc: boolean;
  }): Promise<PagedResult<MaintenanceTicketListItem>> {
    const response = await api.get<PagedResult<MaintenanceTicketListItem>>(
      '/tickets',
      {
        params: {
          Type: 'Maintenance',
          Search: params.search || undefined,
          Page: params.page,
          PageSize: params.pageSize,
          SortBy: params.sortBy,
          Desc: params.desc,
        },
      },
    );

    return response.data;
  },

  async getTicketById(id: string): Promise<MaintenanceTicket> {
    const response = await api.get<MaintenanceTicket>(`/tickets/${id}`);
    return response.data;
  },

  async getPendingTickets(params: {
    search?: string;
    page: number;
    pageSize: number;
    sortBy: string;
    desc: boolean;
  }): Promise<PagedResult<PendingMaintenanceTicket>> {
    const response = await api.get<PagedResult<PendingMaintenanceTicket>>(
      '/tickets/pending',
      {
        params: {
          Type: 'Maintenance',
          Search: params.search || undefined,
          Page: params.page,
          PageSize: params.pageSize,
          SortBy: params.sortBy,
          Desc: params.desc,
        },
      },
    );

    return response.data;
  },

  async getPendingTicketById(id: string): Promise<MaintenanceTicket> {
    const response = await api.get<MaintenanceTicket>(
      `/tickets/pending/${id}`,
    );
    return response.data;
  },

  async getAvailableAssets(): Promise<MaintenanceAssetOption[]> {
    const response = await api.get<MaintenanceAssetOption[]>(
      '/assets/available-for-maintenance',
    );
    return response.data;
  },

  async getAvailableHandlers(): Promise<MaintenanceHandlerOption[]> {
    const response = await api.get<MaintenanceHandlerOption[]>(
      '/employees/handlers',
    );
    return response.data;
  },

  async getReplacementAssets(
    ticketId: string,
  ): Promise<ReplacementAssetOption[]> {
    const response = await api.get<ReplacementAssetOption[]>(
      '/assets/available-for-replacement',
      {
        params: { ticketId },
      },
    );
    return response.data ?? [];
  },

  async create(payload: CreateMaintenancePayload): Promise<unknown> {
    const response = await api.post<unknown>('/maintenances', payload);
    return response.data;
  },

  async executeAction(
    ticketId: string,
    action: 'Approve' | 'Send' | 'Close' | 'Dispose' | 'Archive',
    note?: string | null,
  ): Promise<MaintenanceTransitionResult> {
    const response = await api.post<MaintenanceTransitionResult>(
      `/maintenances/${ticketId}/action`,
      {
        action,
        note: note ?? (action === 'Approve' || action === 'Send' ? undefined : ''),
      },
    );
    return response.data;
  },

  async reject(
    ticketId: string,
    payload: MaintenanceNotePayload,
  ): Promise<MaintenanceTransitionResult> {
    const response = await api.post<MaintenanceTransitionResult>(
      `/maintenances/${ticketId}/reject`,
      { note: payload.note },
    );
    return response.data;
  },

  async assignHandler(
    ticketId: string,
    payload: AssignMaintenanceHandlerPayload,
  ): Promise<MaintenanceTransitionResult> {
    const response = await api.post<MaintenanceTransitionResult>(
      `/maintenances/${ticketId}/assign-handler`,
      payload,
    );
    return response.data;
  },

  async receive(
    ticketId: string,
    payload: MaintenanceNotePayload,
  ): Promise<MaintenanceTransitionResult> {
    const response = await api.post<MaintenanceTransitionResult>(
      `/maintenances/${ticketId}/receive`,
      payload,
    );
    return response.data;
  },

  async submitRepairResult(
    ticketId: string,
    payload: SubmitRepairResultPayload,
  ): Promise<MaintenanceTransitionResult> {
    const response = await api.post<MaintenanceTransitionResult>(
      `/maintenances/${ticketId}/repair-result`,
      payload,
    );
    return response.data;
  },

  async checkPart(
    ticketId: string,
    payload: MaintenancePartCheckPayload,
  ): Promise<MaintenanceTransitionResult> {
    const response = await api.post<MaintenanceTransitionResult>(
      `/maintenances/${ticketId}/part-check`,
      payload,
    );
    return response.data;
  },

  async orderPart(
    ticketId: string,
    payload: OrderMaintenancePartPayload,
  ): Promise<MaintenanceChildTicketResult> {
    const response = await api.post<MaintenanceChildTicketResult>(
      `/maintenances/${ticketId}/order-part`,
      payload,
    );
    return response.data;
  },

  async sendPart(
    ticketId: string,
    payload: MaintenanceNotePayload,
  ): Promise<MaintenanceTransitionResult> {
    const response = await api.post<MaintenanceTransitionResult>(
      `/maintenances/${ticketId}/send-part`,
      payload,
    );
    return response.data;
  },

  async processReplacement(
    ticketId: string,
    payload: MaintenanceReplacementPayload,
  ): Promise<MaintenanceTransitionResult | MaintenanceChildTicketResult> {
    const response = await api.post<
      MaintenanceTransitionResult | MaintenanceChildTicketResult
    >(`/maintenances/${ticketId}/replacement`, payload);
    return response.data;
  },

  async sendReplacement(
    ticketId: string,
    payload: SendMaintenanceReplacementPayload,
  ): Promise<MaintenanceTransitionResult> {
    const response = await api.post<MaintenanceTransitionResult>(
      `/maintenances/${ticketId}/send-replacement`,
      payload,
    );
    return response.data;
  },
};

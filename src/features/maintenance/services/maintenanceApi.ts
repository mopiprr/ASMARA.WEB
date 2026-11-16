import api from '../../../services/api';

import type {
  AssignMaintenanceHandlerPayload,
  CreateMaintenancePayload,
  MaintenanceAssetOption,
  MaintenanceHandlerOption,
  MaintenancePartCheckPayload,
  MaintenanceReplacementPayload,
  MaintenanceStatisticsData,
  MaintenanceTicket,
  MaintenanceTicketListItem,
  OrderMaintenancePartPayload,
  PagedResult,
  PendingMaintenanceTicket,
  ReplacementAssetOption,
  SendMaintenanceReplacementPayload,
  SparePartCategoryOption,
  SparePartOption,
  SubmitRepairResultPayload,
} from '../types/maintenance.types';

interface ListParams {
  search?: string;
  page: number;
  pageSize: number;
  sortBy: string;
  desc: boolean;
}

const toQuery = (params: ListParams) => ({
  Type: 'Maintenance',
  Search: params.search,
  Page: params.page,
  PageSize: params.pageSize,
  SortBy: params.sortBy,
  Desc: params.desc,
});

// Semua pemanggilan API untuk fitur Maintenance ada di sini.
export const maintenanceApi = {
  // ==========================================
  // LIST, DETAIL & STATISTICS
  // ==========================================

  async getMyTickets(params: ListParams) {
    const response = await api.get<PagedResult<MaintenanceTicketListItem>>(
      '/tickets',
      { params: toQuery(params) }
    );
    return response.data;
  },

  async getPendingTickets(params: ListParams) {
    const response = await api.get<PagedResult<PendingMaintenanceTicket>>(
      '/tickets/pending',
      { params: toQuery(params) }
    );
    return response.data;
  },

  async getTicketById(id: string) {
    const response = await api.get<MaintenanceTicket>(`/tickets/${id}`);
    return response.data;
  },

  async getPendingTicketById(id: string) {
    const response = await api.get<MaintenanceTicket>(`/tickets/pending/${id}`);
    return response.data;
  },

  async getMyStatistics() {
    const response = await api.get<MaintenanceStatisticsData>(
      '/tickets/my-statistics',
      { params: { type: 1 } } // 1 = Maintenance
    );
    return response.data;
  },

  // ==========================================
  // OPTIONS (dipanggil hanya saat dibutuhkan)
  // ==========================================

  // Form create.
  async getAssetsForMaintenance() {
    const response = await api.get<MaintenanceAssetOption[]>(
      '/assets/available-for-maintenance'
    );
    return response.data;
  },

  // IT Support (role ROL-07) saat assign handler.
  async getHandlers() {
    const response = await api.get<MaintenanceHandlerOption[]>('/employees/handlers');
    return response.data;
  },

  // Inventory (role ROL-06) saat memilih asset pengganti.
  async getReplacementAssets(ticketId: string) {
    const response = await api.get<ReplacementAssetOption[]>(
      '/assets/available-for-replacement',
      { params: { ticketId } }
    );
    return response.data;
  },

  // Handler (Need Part) & Inventory (cek stok part).
  async getSpareParts() {
    const response = await api.get<SparePartOption[]>('/inventory/spare-parts', {
      params: { onlyInStock: false },
    });
    return response.data;
  },

  async getSparePartCategories() {
    const response = await api.get<SparePartCategoryOption[]>('/inventory/categories', {
      params: { onlyActive: true, trackingType: 1 },
    });
    return response.data;
  },

  // ==========================================
  // ACTIONS
  // ==========================================

  async create(payload: CreateMaintenancePayload) {
    await api.post('/maintenances', payload);
  },

  // action: Approve | Send | Close | Dispose | Archive
  async executeAction(ticketId: string, action: string, note?: string | null) {
    await api.post(`/maintenances/${ticketId}/action`, { action, note });
  },

  async reject(ticketId: string, note: string) {
    await api.post(`/maintenances/${ticketId}/reject`, { note });
  },

  async assignHandler(ticketId: string, payload: AssignMaintenanceHandlerPayload) {
    await api.post(`/maintenances/${ticketId}/assign-handler`, payload);
  },

  // Terima barang / terima part (step HANDLER_RECEIVE_ITEM, HANDLER_RECEIVE_PART, REQUESTER_RECEIVE_ITEM).
  async receive(ticketId: string, note?: string | null) {
    await api.post(`/maintenances/${ticketId}/receive`, { note });
  },

  async submitRepairResult(ticketId: string, payload: SubmitRepairResultPayload) {
    await api.post(`/maintenances/${ticketId}/repair-result`, payload);
  },

  async checkPart(ticketId: string, payload: MaintenancePartCheckPayload) {
    await api.post(`/maintenances/${ticketId}/part-check`, payload);
  },

  async orderPart(ticketId: string, payload: OrderMaintenancePartPayload) {
    await api.post(`/maintenances/${ticketId}/order-part`, payload);
  },

  async processReplacement(ticketId: string, payload: MaintenanceReplacementPayload) {
    await api.post(`/maintenances/${ticketId}/replacement`, payload);
  },

  async sendReplacement(ticketId: string, payload: SendMaintenanceReplacementPayload) {
    await api.post(`/maintenances/${ticketId}/send-replacement`, payload);
  },
};
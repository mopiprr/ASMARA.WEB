import type { ConfirmDialogType } from '../../../components/common/ConfirmDialog';

// ==========================================
// OPSI INVENTORY (form create)
// ==========================================

export interface CategoryOption {
  id: number;
  categoryName: string;
}

export interface ItemOption {
  id: number;
  itemCategoryId: number;
  itemName: string;
}

export type CategoryItemsState = Record<string, ItemOption[]>;
export type LoadingState = Record<string, boolean>;
export type ErrorState = Record<string, string>;

// ==========================================
// FORM CREATE PROCUREMENT
// ==========================================

// Satu baris item di form create (semua string karena berasal dari input).
export interface ProcurementItem {
  categoryId: string;
  itemId: string;
  itemName: string;
  quantity: string;
  estimatedPrice: string;
  isManual: boolean;
}

export interface ProcurementLocationState {
  parentTicketId?: string | null;
}

// Item yang dikirim ke backend (create & resubmit).
export interface ProcurementItemPayload {
  itemCategoryId: number;
  itemName: string;
  quantity: number;
  price: number;
  itemId: number | null;
}

// Payload untuk POST /api/procurements
export interface ProcurementPayload {
  subject: string;
  description: string;
  parentTicketId: string | null;
  items: ProcurementItemPayload[];
}

// Payload untuk POST /api/procurements/{id}/resubmit
export interface ResubmitProcurementPayload {
  subject: string;
  description: string;
  note: string;
  items: ProcurementItemPayload[];
}

// ==========================================
// LIST
// ==========================================

// Tab di halaman Procurement.
export type ProcurementTab = 'requests' | 'pending';

// GET /api/tickets (tab My Requests)
export interface ProcurementTicketListItem {
  id: string;
  ticketNumber: string;
  ticketType: number;
  subject: string;
  requesterId: string;
  requesterName: string;
  requesterDepartment?: string | null;
  createdAt: string;
  closedAt: string | null;
  currentStep: string;
  currentStepName: string;
}

// GET /api/tickets/pending (tab Pending Approval)
export interface PendingProcurementTicket {
  id: string;
  ticketNumber: string;
  ticketType: number;
  ticketTypeName: string;
  subject: string;
  requesterId: string;
  requesterName: string;
  requesterDepartment?: string | null;
  createdAt: string;
  currentStep: string;
  currentStepName: string;
}

// Generic pagination response dari backend.
export interface PagedResult<T> {
  items: T[];
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  hasPrevious: boolean;
  hasNext: boolean;
}

export interface MyTicketStatistics {
  totalRequests: number;
  activeRequests: number;
  closedRequests: number;
  rejectedRequests: number;
}

// ==========================================
// DETAIL
// ==========================================

// Satu item di detail tiket.
export interface ProcurementDetail {
  ticketId: string;
  itemId: number | null;
  itemCode: string | null;
  itemCategoryId: number;
  categoryName: string;
  itemName: string;
  quantity: number;
  price: number;
  totalPrice: number;
  createdAt: string;
}

// Satu baris history workflow.
export interface TicketHistoryItem {
  action: string | null;
  actionLabel: string;
  fromStep: string;
  toStep: string;
  employeeId: string;
  employeeName: string | null;
  note: string | null;
  createdAt: string;
}

// Isi tiket (sama untuk GET /tickets/{id} dan GET /tickets/pending/{id}).
export interface ProcurementTicketDetail {
  id: string;
  parentTicketId: string | null;
  employeeId: string;
  employeeName: string | null;
  requesterDepartment?: string | null;
  ticketNumber: string;
  ticketType: number;
  subject: string;
  description: string | null;
  assignedToEmployeeId: string | null;
  assignedTo: string | null;
  createdAt: string;
  closedAt: string | null;
  updatedAt: string | null;
  currentTaskEmployeeId: string | null;
  currentStep: string;
  maintenanceDetail: unknown | null;
  procurementDetails: ProcurementDetail[] | null;
  history?: TicketHistoryItem[] | null;
  purchaseProofFileName?: string | null;
}

// Tombol yang boleh dipakai user ini.
// Diisi oleh GET /tickets/pending/{id}; GET /tickets/{id} selalu mengirim false (hanya lihat).
export interface ProcurementTicketPermissions {
  canApprove: boolean;
  canRevise: boolean;
  canReject: boolean;
  canReceiveGoods: boolean;
  canResubmit?: boolean;
}

// Response detail lengkap dari backend (isi + permission dalam satu objek JSON).
export type ProcurementTicket = ProcurementTicketDetail & ProcurementTicketPermissions;

// ==========================================
// DETAIL MODAL (state lokal)
// ==========================================

export interface ConfirmModalConfig {
  isOpen: boolean;
  title: string;
  message: string;
  description?: string;
  type: ConfirmDialogType;
  confirmText: string;
  cancelText?: string;
  onConfirm: () => Promise<void>;
}
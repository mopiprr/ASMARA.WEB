export interface CategoryOption {
  id: number;
  categoryName: string;
}

export interface ItemOption {
  id: number;
  itemCategoryId: number;
  itemName: string;
}

export interface ProcurementItem {
  categoryId: string;
  itemId: string;
  itemName: string;
  quantity: string;
  estimatedPrice: string;
  isManual: boolean;
}

export type CategoryItemsState = Record<string, ItemOption[]>;
export type LoadingState = Record<string, boolean>;
export type ErrorState = Record<string, string>;

export interface ProcurementLocationState {
  parentTicketId?: string | null;
}

export interface ProcurementPayload {
  subject: string;
  description: string;
  parentTicketId: string | null;
  items: {
    itemCategoryId: number;
    itemName: string;
    quantity: number;
    price: number;
    itemId: number | null;
  }[];
}

// Payload untuk PUT /api/procurements/{id}/resubmit
export interface ResubmitProcurementPayload {
  subject: string;
  description: string;
  note: string;
  items: {
    itemCategoryId: number;
    itemName: string;
    quantity: number;
    price: number;
    itemId: number | null;
  }[];
}

// Data Procurement untuk halaman daftar tiket.
export interface ProcurementTicketListItem {
  id: string;
  ticketNumber: string;
  ticketType: number;
  subject: string;
  requesterId: string;
  requesterName: string;
  createdAt: string;
  closedAt: string | null;
  currentStep: string;
  currentStepName: string;
}

// Data detail Procurement.
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

// Data detail history Procurement.
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

// Data Procurement untuk halaman detail.
export interface ProcurementTicket {
  id: string;
  parentTicketId: string | null;
  employeeId: string;
  employeeName: string | null;
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

  // Permission dari backend.
  canApprove: boolean;
  canRevise: boolean;
  canReject: boolean;
  canReceiveGoods: boolean;
  canResubmit?: boolean;
}

// Data Procurement untuk antrean approval.
export interface PendingProcurementTicket {
  id: string;
  ticketNumber: string;
  ticketType: number;
  ticketTypeName: string;
  subject: string;
  requesterId: string;
  requesterName: string;
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
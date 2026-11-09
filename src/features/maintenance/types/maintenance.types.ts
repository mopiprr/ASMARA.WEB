
export interface PagedResult<T> {
  items: T[];
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  hasPrevious: boolean;
  hasNext: boolean;
}

// Maintenance ticket untuk daftar My Requests.
export interface MaintenanceTicketListItem {
  id: string;
  ticketNumber: string;
  subject: string;
  createdAt: string;
  currentStep: string;
  ticketType: number;
  currentStepName: string;
}

// Maintenance ticket untuk Pending Tasks.
export interface PendingMaintenanceTicket {
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

// Detail aset pada maintenance.
export interface MaintenanceDetail {
  ticketId: string;
  assetId: number;
  assetTag: string | null;
  description: string;
  repairResult: number | null;
  handlerNote: string | null;
  partRequirement: string | null;
  replacementAssetId: number | null;
  replacementAssetTag: string | null;
  createdAt: string;
}

// Riwayat workflow.
export interface MaintenanceHistoryItem {
  action: string | null;
  actionLabel: string;
  fromStep: string;
  toStep: string;
  employeeId: string;
  employeeName: string | null;
  note: string | null;
  createdAt: string;
}

// Detail tiket Maintenance.
export interface MaintenanceTicket {
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

  maintenanceDetail: MaintenanceDetail | null;
  procurementDetails: unknown[] | null;
  history: MaintenanceHistoryItem[] | null;

  // Workflow permissions.
  canApprove: boolean;
  canRevise: boolean;
  canReject: boolean;
  canReceiveGoods: boolean;
  canResubmit: boolean;
  canAssignHandler: boolean;
  canSendItem: boolean;
  canReceiveItem: boolean;
}

// Aset yang dapat dipilih untuk Maintenance.
export interface MaintenanceAssetOption {
  assetId: number;
  assetTag: string;
  itemName: string;
  categoryName: string;
  isShared: boolean;
}

// Handler yang dapat ditugaskan oleh IT Support.

export interface MaintenanceHandlerOption {
  employeeId: string;
  employeeNumber: string;
  fullName: string;
}


// Request membuat tiket.
export interface CreateMaintenancePayload {
  subject: string;
  description: string | null;
  assetId: number;
  problemDescription: string;
}

// Request dengan note.
export interface MaintenanceNotePayload {
  note?: string | null;
}

// Request assign handler.
export interface AssignMaintenanceHandlerPayload {
  technicianId: string;
  instructionNote?: string;
}

// Backend RepairResultEnum:
// Repaired = 1, Unrepairable = 2, NeedPart = 3.
export type RepairResult = 1 | 2 | 3;

export interface SubmitRepairResultPayload {
  result: RepairResult;
  handlerNote?: string | null;
  partRequirement?: string | null;
}

// Request pengecekan part.
export interface MaintenancePartCheckPayload {
  available: boolean;
  note?: string | null;
}

// Request pengecekan replacement.
export interface MaintenanceReplacementPayload {
  available: boolean;
  replacementAssetId?: number | null;
  note?: string | null;
  subject?: string | null;
  description?: string | null;
  items?: MaintenanceProcurementItemPayload[] | null;
}

// Item untuk child Procurement.
export interface MaintenanceProcurementItemPayload {
  itemCategoryId: number;
  itemName: string;
  quantity: number;
  price: number;
  itemId: number | null;
}

// Request order part.
export interface OrderMaintenancePartPayload {
  subject: string;
  description: string | null;
  items: MaintenanceProcurementItemPayload[];
  note?: string | null;
}

// Request send replacement.
export interface SendMaintenanceReplacementPayload {
  replacementAssetId: number;
  note?: string | null;
}

// Response transisi workflow.
export interface MaintenanceTransitionResult {
  ticketId?: string;
  fromStep?: string;
  toStep?: string;
  nextTaskEmployeeId?: string | null;
  [key: string]: unknown;
}

// Response create child Procurement.
export interface MaintenanceChildTicketResult {
  parent?: MaintenanceTransitionResult;
  childTicketId?: string;
  childTicketNumber?: string;
  [key: string]: unknown;
}

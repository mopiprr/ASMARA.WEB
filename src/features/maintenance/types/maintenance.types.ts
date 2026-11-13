
export interface PagedResult<T> {
  items: T[];
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  hasPrevious: boolean;
  hasNext: boolean;
}

// ==========================================
// MAINTENANCE TICKET LIST
// ==========================================

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

// ==========================================
// MAINTENANCE DETAIL
// ==========================================

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

// Struktur kebutuhan spare part dari Maintenance Handler.
// Data ini disimpan dalam JSON pada partRequirement.
export interface MaintenancePartRequirementItem {
  itemName: string;
  note: string;
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

  // Existing workflow permissions.
  canApprove: boolean;
  canRevise: boolean;
  canReject: boolean;
  canReceiveGoods: boolean;
  canResubmit: boolean;
  canAssignHandler: boolean;
  canSendItem: boolean;
  canReceiveItem: boolean;
  canArchive: boolean;
  canDispose: boolean;

  // Maintenance Handler permissions.
  canSubmitRepairResult: boolean;
  canReceivePart: boolean;

  // Inventory permissions.
  canCheckPart: boolean;
  canOrderPart: boolean;
  canSendPart: boolean;
  canProcessReplacement: boolean;
  canSendReplacement: boolean;

  // IT Support permission.
  canReviewRepairResult: boolean;
}

// ==========================================
// MAINTENANCE OPTIONS
// ==========================================

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

// ==========================================
// CREATE MAINTENANCE
// ==========================================

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

// ==========================================
// REPAIR RESULT
// ==========================================

// Backend RepairResultEnum:
// Repaired = 1, Unrepairable = 2, NeedPart = 3.
export type RepairResult = 1 | 2 | 3;

// Spare part yang diminta oleh Maintenance Handler.
// Tetap dipertahankan untuk kompatibilitas dengan kontrak
// parts pada endpoint repair-result jika masih digunakan.
export interface MaintenancePartItemPayload {
  itemId: number | null;
  itemCategoryId: number;
  itemName: string;
  quantity: number;
}

// State untuk satu baris input kebutuhan spare part di form Repair Result (NeedPart).
export interface RepairPartFormItem {
  isCustom: boolean;
  itemId: number | null;
  itemCategoryId: number | '';
  itemName: string;
  quantity: number;
  stock?: number;
  itemCode?: string;
  categoryName?: string;
}

// Request submit hasil perbaikan.
export interface SubmitRepairResultPayload {
  result: RepairResult;
  handlerNote?: string | null;
  partRequirement?: string | null;
  parts?: MaintenancePartItemPayload[] | null;
}

// ==========================================
// SPARE PART WORKFLOW
// ==========================================

// Request pengecekan ketersediaan part.
export interface MaintenancePartCheckPayload {
  available: boolean;
  note?: string | null;
}

// Satu hasil pemeriksaan stok spare part dari Inventory.
// partIndex mengacu pada indeks kebutuhan spare part
// yang dikirim oleh Maintenance Handler.
export interface OrderMaintenancePartItemPayload {
  partIndex: number;
  availableQuantity: number;
  estimatedPrice: number;
}

// Request Inventory membuat Procurement untuk spare part.
export interface OrderMaintenancePartPayload {
  subject: string;
  description: string | null;
  items: MaintenanceProcurementItemPayload[];
  note?: string | null;
}

// ==========================================
// REPLACEMENT ASSET WORKFLOW
// ==========================================

// Request pengecekan replacement.
export interface MaintenanceReplacementPayload {
  available: boolean;
  replacementAssetId?: number | null;
  note?: string | null;
  subject?: string | null;
  description?: string | null;
  items?: MaintenanceProcurementItemPayload[] | null;
}

// Item untuk child Procurement atau replacement.
export interface MaintenanceProcurementItemPayload {
  itemCategoryId: number;
  itemName: string;
  quantity: number;
  price: number;
  itemId: number | null;
}

// Request send replacement.
export interface SendMaintenanceReplacementPayload {
  replacementAssetId: number;
  note?: string | null;
}

// ==========================================
// WORKFLOW RESPONSE
// ==========================================

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

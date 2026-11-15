import type { ConfirmDialogType } from '../../../components/common/ConfirmDialog';
import type { TicketHistoryItem } from '../../procurement/types/procurement.types';

export type { PagedResult, TicketHistoryItem } from '../../procurement/types/procurement.types';

// Tab di halaman Maintenance.
export type MaintenanceTab = 'requests' | 'pending';

// ==========================================
// LIST
// ==========================================

// GET /api/tickets?Type=Maintenance (tab My Requests)
export interface MaintenanceTicketListItem {
  id: string;
  ticketNumber: string;
  subject: string;
  createdAt: string;
  currentStep: string;
  ticketType: number;
  currentStepName: string;
}

// GET /api/tickets/pending?Type=Maintenance (tab Pending Tasks)
export interface PendingMaintenanceTicket {
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

export interface MaintenanceStatisticsData {
  totalRequests: number;
  activeRequests: number;
  closedRequests: number;
  rejectedRequests: number;
}

// ==========================================
// DETAIL
// ==========================================

export interface MaintenanceDetail {
  ticketId: string;
  assetId: number;
  assetTag: string | null;
  description: string;
  repairResult: number | null; // 1 Repaired, 2 Unrepairable, 3 NeedPart
  handlerNote: string | null;
  partRequirement: string | null; // teks lama atau JSON daftar part
  replacementAssetId: number | null;
  replacementAssetTag: string | null;
  createdAt: string;
  assetItemName?: string | null;
  assetCategoryName?: string | null;
  replacementAssetItemName?: string | null;
}

// Isi tiket (sama untuk GET /tickets/{id} dan GET /tickets/pending/{id}).
export interface MaintenanceTicketDetail {
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
  maintenanceDetail: MaintenanceDetail | null;
  history?: TicketHistoryItem[] | null;
}

// Tombol yang boleh dipakai user ini (dihitung backend: MaintenanceActionFlags).
export interface MaintenanceTicketPermissions {
  canApprove: boolean;
  canReject: boolean;
  canAssignHandler: boolean;
  canSendItem: boolean;
  canReceiveItem: boolean;
  canSubmitRepairResult: boolean;
  canCheckPart: boolean;
  canReceivePart: boolean;
  canOrderPart: boolean;
  canArchive: boolean;
  canDispose: boolean;
  canProcessReplacement: boolean;
  canSendReplacement: boolean;
}

export type MaintenanceTicket = MaintenanceTicketDetail & MaintenanceTicketPermissions;

// Aksi yang sedang tersedia di modal detail (satu per step workflow).
export type MaintenanceActionMode =
  | 'approval'
  | 'assign'
  | 'send-item'
  | 'receive-item'
  | 'repair-result'
  | 'part-check'
  | 'receive-part'
  | 'order-part'
  | 'disposition'
  | 'replacement'
  | 'send-replacement'
  | 'close';

// Tombol yang ditekan (dipakai untuk dialog konfirmasi).
export type MaintenanceAction =
  | 'approve'
  | 'reject'
  | 'assign'
  | 'send-item'
  | 'receive-item'
  | 'repair-result'
  | 'part-check'
  | 'receive-part'
  | 'order-part'
  | 'archive'
  | 'dispose'
  | 'replacement'
  | 'send-replacement'
  | 'close';

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

// ==========================================
// OPTIONS
// ==========================================

// GET /api/assets/available-for-maintenance
export interface MaintenanceAssetOption {
  assetId: number;
  assetTag: string;
  itemName: string;
  categoryName: string;
  isShared: boolean;
}

// GET /api/assets/available-for-replacement?ticketId=...
export interface ReplacementAssetOption {
  assetId: number;
  assetTag: string;
  itemName: string;
  categoryName: string;
}

// GET /api/employees/handlers
export interface MaintenanceHandlerOption {
  employeeId: string;
  employeeNumber: string;
  fullName: string;
}

// GET /api/inventory/spare-parts
export interface SparePartOption {
  id: number;
  itemCategoryId: number;
  categoryName: string;
  itemCode: string;
  itemName: string;
  stock: number;
  isActive: boolean;
}

// GET /api/inventory/categories?trackingType=1
export interface SparePartCategoryOption {
  id: number;
  categoryName: string;
}

// ==========================================
// FORM STATE
// ==========================================

// Backend RepairResultEnum: Repaired = 1, Unrepairable = 2, NeedPart = 3.
export type RepairResult = 1 | 2 | 3;

// Satu baris spare part di form Repair Result (Need Part).
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

// Kebutuhan part yang tersimpan di MaintenanceDetail.PartRequirement (JSON).
export interface RequiredPart {
  itemName: string;
  note?: string;
  quantity?: number;
  itemCategoryId?: number;
  itemId?: number | null;
}

// ==========================================
// PAYLOAD
// ==========================================

export interface CreateMaintenancePayload {
  subject: string;
  description: string | null;
  assetId: number;
  problemDescription: string;
}

export interface MaintenanceNotePayload {
  note?: string | null;
}

export interface AssignMaintenanceHandlerPayload {
  technicianId: string;
  instructionNote?: string;
}

export interface MaintenancePartItemPayload {
  itemId: number | null;
  itemCategoryId: number;
  itemName: string;
  quantity: number;
}

export interface SubmitRepairResultPayload {
  result: RepairResult;
  handlerNote?: string | null;
  partRequirement?: string | null;
  parts?: MaintenancePartItemPayload[] | null;
}

// available: true -> backend mengurangi stok + kirim part ke handler.
export interface MaintenancePartCheckPayload {
  available: boolean;
  note?: string | null;
}

// Item Procurement child (beli part / beli pengganti).
export interface MaintenanceProcurementItemPayload {
  itemCategoryId: number;
  itemName: string;
  quantity: number;
  price: number;
  itemId: number | null;
}

export interface OrderMaintenancePartPayload {
  subject: string;
  description: string | null;
  items: MaintenanceProcurementItemPayload[];
  note?: string | null;
}

export interface MaintenanceReplacementPayload {
  available: boolean;
  replacementAssetId?: number | null;
  note?: string | null;
  subject?: string | null;
  description?: string | null;
  items?: MaintenanceProcurementItemPayload[] | null;
}

export interface SendMaintenanceReplacementPayload {
  replacementAssetId: number;
  note?: string | null;
}
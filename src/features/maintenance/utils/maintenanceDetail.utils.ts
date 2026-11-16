import type {
  MaintenanceActionMode,
  MaintenancePartItemPayload,
  MaintenanceProcurementItemPayload,
  MaintenanceTicket,
  RepairPartFormItem,
  RequiredPart,
  SparePartOption,
} from '../types/maintenance.types';
import type { ProcurementItem } from '../../../types/ticket.types';

// ==========================================
// AKSI YANG TERSEDIA (satu per step)
// ==========================================

// Urutan sama dengan pengecekan lama; flag dihitung backend (MaintenanceActionFlags).
// Jika bukan view Pending Tasks (My Requests view-only), seluruh aksi termasuk REQUESTER_CLOSE dinonaktifkan.
export function getActionMode(
  ticket: MaintenanceTicket,
  isPendingView = true,
): MaintenanceActionMode | null {
  if (!isPendingView) return null;

  const step = ticket.currentStep?.toUpperCase();

  if (step !== 'DIVISION_MANAGER_REVIEW' && (ticket.canApprove || ticket.canReject)) return 'approval';
  if (ticket.canAssignHandler) return 'assign';
  if (step === 'DIVISION_MANAGER_REVIEW' && (ticket.canArchive || ticket.canDispose)) return 'disposition';
  if (ticket.canSubmitRepairResult) return 'repair-result';
  if (ticket.canCheckPart) return 'part-check';
  if (ticket.canOrderPart) return 'order-part';
  if ((step === 'INVENTORY_DISPOSE' || step === 'INVENTORY_ARCHIVE') && ticket.canProcessReplacement) return 'replacement';
  if (step === 'INVENTORY_SEND_REPLACEMENT' && ticket.canSendReplacement) return 'send-replacement';
  if (ticket.canReceivePart) return 'receive-part';
  if (ticket.canSendItem && step !== 'INVENTORY_SEND_REPLACEMENT') return 'send-item';
  if (ticket.canReceiveItem) return 'receive-item';

  // Backend belum punya flag Close; requester yang sedang bertugas di REQUESTER_CLOSE.
  if (step === 'REQUESTER_CLOSE' && ticket.currentTaskEmployeeId === ticket.employeeId) return 'close';

  return null;
}

// ==========================================
// SPARE PART (Need Part & cek stok)
// ==========================================

export function parseRequiredParts(value?: string | null): RequiredPart[] {
  if (!value) return [];

  try {
    const parsed: unknown = JSON.parse(value);

    if (!Array.isArray(parsed)) return [];

    return parsed
      .filter(
        (part): part is Record<string, unknown> =>
          typeof part === 'object' &&
          part !== null &&
          typeof (part as Record<string, unknown>).itemName === 'string',
      )
      .map((part) => ({
        itemName: String(part.itemName),
        note: typeof part.note === 'string' ? part.note : '',
        quantity: typeof part.quantity === 'number' ? part.quantity : undefined,
        itemCategoryId: typeof part.itemCategoryId === 'number' ? part.itemCategoryId : undefined,
        itemId: typeof part.itemId === 'number' ? part.itemId : null,
      }));
  } catch {
    return [];
  }
}

export function findMatchingSparePart(part: RequiredPart, spareParts: SparePartOption[]) {
  if (part.itemId !== null && part.itemId !== undefined) {
    return spareParts.find((sp) => sp.id === part.itemId) ?? null;
  }

  const name = part.itemName.trim().toLowerCase();

  return spareParts.find((sp) => sp.itemName.trim().toLowerCase() === name) ?? null;
}

// "Available" hanya boleh dipilih jika SEMUA part ada di gudang dengan stok cukup.
export function evaluatePartRequirementAvailability(
  requiredParts: RequiredPart[],
  spareParts: SparePartOption[],
): boolean {
  if (requiredParts.length === 0) return false;

  return requiredParts.every((part) => {
    const requestedQty = part.quantity && part.quantity > 0 ? part.quantity : 1;
    const match = findMatchingSparePart(part, spareParts);

    return Boolean(match) && match!.stock >= requestedQty && match!.stock > 0;
  });
}

export function createEmptyRepairPart(): RepairPartFormItem {
  return {
    isCustom: false,
    itemId: null,
    itemCategoryId: '',
    itemName: '',
    quantity: 1,
  };
}

// Semua baris part sudah terisi (penjagaan tombol; validasi detail di backend).
export function isRepairPartComplete(part: RepairPartFormItem) {
  if (part.isCustom) {
    return Boolean(part.itemCategoryId) && part.itemName.trim().length > 0 && part.quantity > 0;
  }

  return part.itemId !== null && part.quantity > 0;
}

export function toRepairPartPayload(parts: RepairPartFormItem[]): MaintenancePartItemPayload[] {
  return parts.map((part) => ({
    itemId: part.isCustom ? null : part.itemId,
    itemCategoryId: Number(part.itemCategoryId),
    itemName: part.itemName.trim(),
    quantity: Number(part.quantity) || 1,
  }));
}

// ==========================================
// ITEM PROCUREMENT CHILD (order part & pengganti)
// Memakai bentuk ProcurementItem supaya bisa pakai ProcurementItemForm.
// ==========================================

export function toProcurementChildItems(
  items: ProcurementItem[],
  fixedQuantity?: number,
): MaintenanceProcurementItemPayload[] {
  return items.map((item) => ({
    itemCategoryId: Number(item.categoryId),
    itemName: item.itemName.trim(),
    quantity: fixedQuantity ?? Number(item.quantity),
    price: Number(item.estimatedPrice || 0),
    itemId: item.isManual || !item.itemId ? null : Number(item.itemId),
  }));
}
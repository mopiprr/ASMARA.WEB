import type {
  ProcurementItem,
  ProcurementTicket,
  ResubmitProcurementPayload,
} from '../types/procurement.types';

import { isProcurementItemInvalid } from './procurementForm.utils';

// Batas ukuran bukti pembelian
export const MAX_PROOF_SIZE = 5 * 1024 * 1024; // 5 MB

export const SUBJECT_MAX_LENGTH = 100;
export const DESCRIPTION_MAX_LENGTH = 500;
export const NOTE_MAX_LENGTH = 200;

// ==========================================
// EDIT ITEM SAAT REVISI (bentuk sama dengan form create)
// ==========================================

// Isi awal form edit dari item tiket.
// Item tanpa ItemId = item manual (diketik sendiri saat create).
export function toEditableItems(ticket: ProcurementTicket): ProcurementItem[] {
  return (ticket.procurementDetails ?? []).map((item) => ({
    categoryId: item.itemCategoryId.toString(),
    itemId: item.itemId?.toString() ?? '',
    itemName: item.itemName,
    quantity: item.quantity.toString(),
    estimatedPrice: item.price.toString(),
    isManual: item.itemId == null,
  }));
}

// Kategori unik dari item, untuk memuat pilihan item inventory saat mulai edit.
export function getItemCategoryIds(items: ProcurementItem[]): string[] {
  return [...new Set(items.map((item) => item.categoryId).filter(Boolean))];
}

// ==========================================
// VALIDASI RESUBMIT (aturan item sama dengan create)
// ==========================================

export function isResubmitInvalid(
  subject: string,
  description: string,
  items: ProcurementItem[]
): boolean {
  return (
    !subject.trim() ||
    subject.trim().length > SUBJECT_MAX_LENGTH ||
    description.length > DESCRIPTION_MAX_LENGTH ||
    items.length === 0 ||
    items.some(isProcurementItemInvalid)
  );
}

export function buildResubmitPayload(
  subject: string,
  description: string,
  note: string,
  items: ProcurementItem[]
): ResubmitProcurementPayload {
  return {
    subject: subject.trim(),
    description: description.trim(),
    note: note.trim(),
    items: items.map((item) => ({
      itemId: item.isManual ? null : Number(item.itemId),
      itemCategoryId: Number(item.categoryId),
      itemName: item.itemName.trim(),
      quantity: Number(item.quantity),
      price: Number(item.estimatedPrice || 0),
    })),
  };
}

// ==========================================
// BAGIAN YANG TAMPIL DI MODAL DETAIL
// ==========================================

export function getDetailVisibility(ticket: ProcurementTicket, isEditing: boolean) {
  const currentStep = ticket.currentStep?.toUpperCase();

  const isApprovalStep =
    currentStep === 'DEPARTMENT_APPROVAL' || currentStep === 'FINANCE_APPROVAL';

  const canShowApprovalActions =
    isApprovalStep && (ticket.canApprove || ticket.canRevise || ticket.canReject);

  const canShowReceiveGoods =
    ticket.canReceiveGoods && currentStep === 'PURCHASING';

  const canShowResubmit =
    (ticket.canResubmit ?? false) && currentStep === 'EMPLOYEE_REVISION';

  const isResubmitting = canShowResubmit && isEditing;

  return {
    currentStep,
    canShowApprovalActions,
    canShowReceiveGoods,
    canShowResubmit,
    isResubmitting,
    canShowHistory:
      !canShowApprovalActions && !canShowReceiveGoods && !isResubmitting,
  };
}
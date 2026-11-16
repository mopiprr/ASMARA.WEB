import type {
  ProcurementItem,
  ProcurementPayload,
} from '../types/procurement.types';

export {
  getFormItemsTotal,
  getFormItemSubtotal,
  hasIncompleteItems,
  INCOMPLETE_ITEMS_HINT,
  isItemIncomplete,
  ITEM_NAME_MAX_LENGTH,
} from '../../../utils/itemForm.utils';

// Batas panjang input (mengikuti kolom database). Hanya untuk maxLength & penghitung karakter.
// Validasi isi form dilakukan backend (FluentValidation); pesannya ditampilkan apa adanya.
export const SUBJECT_MAX_LENGTH = 50;
export const DESCRIPTION_MAX_LENGTH = 500;

export const buildProcurementPayload = (
  subject: string,
  description: string,
  parentTicketId: string | null,
  items: ProcurementItem[],
): ProcurementPayload => ({
  subject: subject.trim(),
  description: description.trim(),
  parentTicketId,
  items: items.map((item) => ({
    itemCategoryId: Number(item.categoryId),
    itemName: item.itemName.trim(),
    quantity: Number(item.quantity),
    price: Number(item.estimatedPrice || 0),
    // Belum memilih item inventory -> null, supaya backend menampilkan pesan validasi yang jelas.
    itemId: item.isManual || !item.itemId ? null : Number(item.itemId),
  })),
});

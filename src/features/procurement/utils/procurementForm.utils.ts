import type {
  ProcurementItem,
  ProcurementPayload,
} from '../types/procurement.types';

// Batas panjang input (mengikuti kolom database). Hanya untuk maxLength & penghitung karakter.
// Validasi isi form dilakukan backend (FluentValidation); pesannya ditampilkan apa adanya.
export const SUBJECT_MAX_LENGTH = 50;
export const DESCRIPTION_MAX_LENGTH = 500;
export const ITEM_NAME_MAX_LENGTH = 50;

// Penjagaan ringan di UI: item yang masih kosong tidak bisa dikirim.
// (Pesan validasi detail tetap dari backend.)
export const isItemIncomplete = (item: ProcurementItem): boolean =>
  !item.categoryId ||
  !item.itemName.trim() ||
  (!item.isManual && !item.itemId) ||
  !item.quantity.trim() ||
  Number(item.quantity) <= 0 ||
  !item.estimatedPrice.trim() ||
  Number(item.estimatedPrice) <= 0;

export const hasIncompleteItems = (items: ProcurementItem[]): boolean =>
  items.length === 0 || items.some(isItemIncomplete);

export const INCOMPLETE_ITEMS_HINT =
  'Complete all item fields (category, item, quantity, and price) to continue.';

// Subtotal satu item form create.
export const getFormItemSubtotal = (item: ProcurementItem): number =>
  (Number(item.quantity) || 0) * (Number(item.estimatedPrice) || 0);

// Total estimasi seluruh item form create.
export const getFormItemsTotal = (items: ProcurementItem[]): number =>
  items.reduce((total, item) => total + getFormItemSubtotal(item), 0);

export const buildProcurementPayload = (
  subject: string,
  description: string,
  parentTicketId: string | null,
  items: ProcurementItem[]
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
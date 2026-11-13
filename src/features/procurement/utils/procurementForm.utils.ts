import type {
  ProcurementItem,
  ProcurementPayload,
} from '../types/procurement.types';

// Item form create dianggap tidak lengkap jika salah satu syarat ini gagal.
// Dipakai saat "Proceed to Review" dan saat submit.
export const isProcurementItemInvalid = (item: ProcurementItem): boolean => {
  const quantity = Number(item.quantity);
  const price = Number(item.estimatedPrice || 0);

  return (
    !item.categoryId ||
    !item.itemName.trim() ||
    (!item.isManual && !item.itemId) ||
    !Number.isInteger(quantity) ||
    quantity <= 0 ||
    !Number.isFinite(price) ||
    price < 0
  );
};

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
    itemId: item.isManual ? null : Number(item.itemId),
  })),
});
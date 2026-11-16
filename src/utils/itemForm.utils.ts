import type { ProcurementItem } from '../types/ticket.types';

export const ITEM_NAME_MAX_LENGTH = 50;

export const createEmptyItem = (): ProcurementItem => ({
  categoryId: '',
  itemId: '',
  itemName: '',
  quantity: '1',
  estimatedPrice: '',
  isManual: false,
});

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

export const getFormItemSubtotal = (item: ProcurementItem): number =>
  (Number(item.quantity) || 0) * (Number(item.estimatedPrice) || 0);

export const getFormItemsTotal = (items: ProcurementItem[]): number =>
  items.reduce((total, item) => total + getFormItemSubtotal(item), 0);

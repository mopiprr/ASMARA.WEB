
export { formatIDR, formatDateTime } from '../../../utils/formatters';

import type { ProcurementItem } from '../../procurement/types/procurement.types';
import type { MaintenanceProcurementItemPayload } from '../types/maintenance.types';

export interface RequiredPart {
  itemName: string;
  note?: string;
  quantity?: number;
  itemCategoryId?: number;
  itemId?: number | null;
}

export function formatDate(value: string | null) {
  if (!value) return '-';

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return '-';

  return date.toLocaleString('id-ID', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
}

export function parseRequiredParts(
  value?: string | null,
): RequiredPart[] {
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
        itemCategoryId:
          typeof part.itemCategoryId === 'number'
            ? part.itemCategoryId
            : undefined,
        itemId: typeof part.itemId === 'number' ? part.itemId : null,
      }));
  } catch {
    return [];
  }
}

export function toSharedProcurementItem(
  item: MaintenanceProcurementItemPayload,
  isManual: boolean,
): ProcurementItem {
  return {
    categoryId: item.itemCategoryId ? String(item.itemCategoryId) : '',
    itemId: item.itemId ? String(item.itemId) : '',
    itemName: item.itemName,
    quantity: String(item.quantity),
    estimatedPrice: String(item.price),
    isManual,
  };
}

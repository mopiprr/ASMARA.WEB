// Shared inventory option and ticket data contracts used across Procurement and Maintenance.

export interface CategoryOption {
  id: number;
  categoryName: string;
}

export interface ItemOption {
  id: number;
  itemCategoryId: number;
  itemName: string;
}

export type CategoryItemsState = Record<string, ItemOption[]>;
export type LoadingState = Record<string, boolean>;
export type ErrorState = Record<string, string>;

export interface ProcurementItem {
  categoryId: string;
  itemId: string;
  itemName: string;
  quantity: string;
  estimatedPrice: string;
  isManual: boolean;
}

export interface PagedResult<T> {
  items: T[];
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  hasPrevious: boolean;
  hasNext: boolean;
}

export interface TicketHistoryItem {
  action: string | null;
  actionLabel: string;
  fromStep: string;
  toStep: string;
  employeeId: string;
  employeeName: string | null;
  note: string | null;
  createdAt: string;
}

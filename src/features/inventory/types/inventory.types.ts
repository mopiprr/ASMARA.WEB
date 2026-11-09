export type TrackingType = 1 | 2; // 1 = Consumable, 2 = NonConsumable

export interface InventoryCategory {
  id: number;
  categoryCode: string;
  categoryName: string;
  trackingType: TrackingType;
  isActive: boolean;
}

export interface InventoryItem {
  id: number;
  itemCategoryId: number;
  categoryName: string | null;
  itemCode: string;
  itemName: string;
  qty: number | null;
  isActive: boolean;
}

export type StockStatusFilter = 'all' | 'in_stock' | 'low_stock' | 'out_of_stock';

export interface InventoryFilterState {
  search: string;
  categoryId: number | 'all';
  stockStatus: StockStatusFilter;
}

export interface InventorySummary {
  totalSkus: number;
  totalUnits: number;
  lowStockCount: number;
  outOfStockCount: number;
}

// Satu baris dari GET /api/assets.
export interface AssetListItem {
  id: number;
  assetTag: string;
  itemName: string;
  categoryName: string;
  status: number;
  holderId: string | null;
  holderName: string | null;
  holderDepartment: string | null;
  isPublic: boolean;
}

// Field sorting yang didukung backend (GET /api/assets -> sortBy).
export type AssetSortField =
  | 'assetTag'
  | 'itemName'
  | 'category'
  | 'holder'
  | 'status';
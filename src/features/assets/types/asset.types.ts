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

export type AssetSortField =
  | 'assetTag'
  | 'itemName'
  | 'category'
  | 'holder'
  | 'status';

export interface AssetStatistics {
  totalAssets: number;
  available: number;
  inUse: number;
  underMaintenance: number;
}

export interface EmployeeOption {
  id: string;
  employeeNumber: string;
  fullName: string;
  departmentName: string;
}
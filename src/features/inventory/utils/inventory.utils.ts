import type { TrackingType } from '../types/inventory.types';

export const LOW_STOCK_THRESHOLD = 5;

export type StockStatusType = 'IN_STOCK' | 'LOW_STOCK' | 'OUT_OF_STOCK';

export interface StockBadgeInfo {
  type: StockStatusType;
  label: string;
  badgeClass: string;
  dotClass: string;
}

export function getStockStatus(qty: number | null | undefined): StockBadgeInfo {
  if (qty === null || qty === undefined || qty <= 0) {
    return {
      type: 'OUT_OF_STOCK',
      label: 'Out of Stock',
      badgeClass: 'bg-rose-50 text-rose-700 border-rose-200',
      dotClass: 'bg-rose-500',
    };
  }

  if (qty < LOW_STOCK_THRESHOLD) {
    return {
      type: 'LOW_STOCK',
      label: 'Low Stock',
      badgeClass: 'bg-amber-50 text-amber-700 border-amber-200',
      dotClass: 'bg-amber-500',
    };
  }

  return {
    type: 'IN_STOCK',
    label: 'In Stock',
    badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    dotClass: 'bg-emerald-500',
  };
}

export function getStockStatusRank(qty: number | null | undefined): number {
  if (qty === null || qty === undefined || qty <= 0) return 0;
  if (qty < LOW_STOCK_THRESHOLD) return 1;
  return 2;
}

export function getTrackingTypeLabel(type: TrackingType | number): {
  label: string;
  description: string;
  colorClass: string;
} {
  if (type === 1) {
    return {
      label: 'Consumable',
      description: 'Consumable Item',
      colorClass: 'bg-blue-50 text-blue-700 border-blue-200',
    };
  }

  return {
    label: 'Non-Consumable',
    description: 'Fixed Asset / Capital Item',
    colorClass: 'bg-purple-50 text-purple-700 border-purple-200',
  };
}

/**
 * Memeriksa apakah user berwenang mengakses data inventaris:
 * - Memiliki role 'ROL-06' atau role yang mengandung 'INVENTORY'
 * - Berada di departemen yang mengandung 'INVENTORY'
 */
export function isUserInInventoryRole(user: any, profile: any): boolean {
  // 1. Cek departemen dari profile atau stored user
  const dept = (
    profile?.department ||
    profile?.departmentName ||
    user?.department ||
    ''
  ).toString().toLowerCase();

  if (dept.includes('inventory')) {
    return true;
  }

  // 2. Cek roles dari profile (string[])
  const profileRoles = profile?.roles;
  if (Array.isArray(profileRoles)) {
    const hasRole = profileRoles.some((r: any) => {
      const s = (typeof r === 'string' ? r : r?.roleCode || r?.roleName || '')
        .toString()
        .toUpperCase();
      return s === 'ROL-06' || s.includes('INVENTORY');
    });
    if (hasRole) return true;
  }

  // 3. Cek roles dari stored user (biasanya { roleCode, roleName }[])
  const userRoles = user?.roles;
  if (Array.isArray(userRoles)) {
    const hasRole = userRoles.some((r: any) => {
      const code = (r?.roleCode || (typeof r === 'string' ? r : ''))
        .toString()
        .toUpperCase();
      const name = (r?.roleName || '').toString().toUpperCase();
      return (
        code === 'ROL-06' ||
        code.includes('INVENTORY') ||
        name.includes('INVENTORY')
      );
    });
    if (hasRole) return true;
  }

  return false;
}


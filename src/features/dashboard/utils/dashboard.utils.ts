import { hasAnyRole } from '../../../utils/auth';
import { ASSET_ACCESS_ROLES } from '../../assets/utils/asset.utils';
import { FINANCE_ACCESS_ROLES } from '../../finance/utils/finance.utils';

import type { StatCategory, TopTicketItem } from '../types/dashboard.types';

// Role yang punya tugas approval / proses tiket (selain Employee biasa & Admin).
export const APPROVER_ROLES = [
  'ROL-02', // Department Manager
  'ROL-03', // Division Manager
  'ROL-04', // Finance
  'ROL-05', // Purchasing
  'ROL-06', // Inventory
  'ROL-07', // IT Support
  'ROL-08', // Maintenance Handler
];

// Bagian dashboard yang tampil per role.
export function getDashboardAccess() {
  return {
    isApprover: hasAnyRole(APPROVER_ROLES),
    canViewAssets: hasAnyRole(ASSET_ACCESS_ROLES), // hanya Inventory & Admin
    canViewFinance: hasAnyRole(FINANCE_ACCESS_ROLES), // hanya Finance & Admin
  };
}

export function formatToday() {
  return new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  }).format(new Date());
}

export function toPercent(value: number, total: number) {
  return total > 0 ? Math.round((value / total) * 100) : 0;
}

// Ubah item list tiket dari API menjadi item Top 5.
export function toTopTicketItem(raw: Record<string, unknown>): TopTicketItem {
  const ticketType = Number(raw.ticketType);

  return {
    id: String(raw.id),
    ticketNumber: String(raw.ticketNumber),
    subject: String(raw.subject),
    ticketType,
    currentStep: raw.currentStep as string | undefined,
    currentStepName: raw.currentStepName as string | undefined,
  };
}

export function getTopTicketsTitle(category: StatCategory, isApprover: boolean) {
  switch (category) {
    case 'pending':
      return isApprover
        ? 'Top 5 Tiket — Menunggu Approval Anda'
        : 'Top 5 Tiket — Perlu Revisi / Resubmit';
    case 'in_progress':
      return 'Top 5 Tiket — Sedang Diproses (In Progress)';
    case 'completed':
      return 'Top 5 Tiket — Telah Selesai (Completed)';
    default:
      return 'Top 5 Tiket — Seluruh Tiket Diajukan';
  }
}
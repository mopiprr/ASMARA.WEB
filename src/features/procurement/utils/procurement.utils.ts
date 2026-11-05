
import type {
  ProcurementItem,
  ProcurementTicket,
} from '../types/procurement.types';

// ==========================================
// INITIAL FORM
// ==========================================

export const createEmptyItem = (): ProcurementItem => ({
  categoryId: '',
  itemId: '',
  itemName: '',
  quantity: '1',
  estimatedPrice: '',
  isManual: false,
});

// ==========================================
// FORMAT CURRENCY
// ==========================================

export const formatIDR = (value: string | number): string => {
  const number = Number(value);

  if (!Number.isFinite(number)) {
    return 'Rp0';
  }

  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(number);
};

// ==========================================
// FORMAT DATE
// ==========================================

export const formatDate = (value: string): string => {
  if (!value) {
    return '-';
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return '-';
  }

  return date.toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

// ==========================================
// STATUS LABEL
// ==========================================

export const getStatusLabel = (step: string): string => {
  if (!step) {
    return 'Created';
  }

  return step
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/_/g, ' ');
};

// ==========================================
// STATUS STYLE
// ==========================================

export const getStatusStyle = (step: string): string => {
  const status = step.toLowerCase();

  if (
    status.includes('completed') ||
    status.includes('approved')
  ) {
    return 'bg-green-50 text-green-700 border-green-200';
  }

  if (
    status.includes('reject') ||
    status.includes('cancel')
  ) {
    return 'bg-red-50 text-red-700 border-red-200';
  }

  if (
    status.includes('created') ||
    status.includes('review')
  ) {
    return 'bg-amber-50 text-amber-700 border-amber-200';
  }

  return 'bg-blue-50 text-blue-700 border-blue-200';
};

// ==========================================
// PROCUREMENT TOTAL
// ==========================================

export const getTicketTotal = (
  ticket: ProcurementTicket
): number => {
  return (ticket.procurementDetails ?? []).reduce(
    (total, item) =>
      total +
      Number(item.totalPrice ?? item.quantity * item.price),
    0
  );
};

// ==========================================
// PROCUREMENT STATUS
// ==========================================

export const isCompletedTicket = (
  ticket: ProcurementTicket
): boolean => {
  const step = ticket.currentStep.toLowerCase();

  return step.includes('completed');
};

export const isPendingTicket = (
  ticket: ProcurementTicket
): boolean => {
  const step = ticket.currentStep.toLowerCase();

  return (
    !step.includes('completed') &&
    !step.includes('rejected') &&
    !step.includes('cancelled')
  );
};

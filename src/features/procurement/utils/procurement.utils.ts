import type { ProcurementTicket } from '../types/procurement.types';

export {
  formatDate,
  formatIDR,
  formatShortDateEn,
} from '../../../utils/formatters';
export { getApiErrorMessage } from '../../../utils/apiError';
export { createEmptyItem } from '../../../utils/itemForm.utils';

// ==========================================
// PROCUREMENT TOTAL
// ==========================================

export const getTicketTotal = (ticket: ProcurementTicket): number => {
  return (ticket.procurementDetails ?? []).reduce(
    (total, item) =>
      total + Number(item.totalPrice ?? item.quantity * item.price),
    0,
  );
};

// ==========================================
// PROCUREMENT STATUS
// ==========================================

export const isCompletedTicket = (ticket: ProcurementTicket): boolean => {
  const step = ticket.currentStep.toLowerCase();

  return step.includes('completed');
};

export const isPendingTicket = (ticket: ProcurementTicket): boolean => {
  const step = ticket.currentStep.toLowerCase();

  return (
    !step.includes('completed') &&
    !step.includes('rejected') &&
    !step.includes('cancelled')
  );
};
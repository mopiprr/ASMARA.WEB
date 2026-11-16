import type { ConfirmDialogType } from '../../../components/common/ConfirmDialog';

import type { ProcurementAction } from '../hooks/useProcurementActions';

import { formatIDR } from './procurement.utils';

// Teks dialog konfirmasi (tanpa handler) untuk aksi di modal detail.
export interface ConfirmContent {
  title: string;
  message: string;
  description: string;
  type: ConfirmDialogType;
  confirmText: string;
  cancelText?: string;
}

export function getActionConfirm(
  action: ProcurementAction,
  ticketNumber: string,
  estimatedTotal: number
): ConfirmContent {
  switch (action) {
    case 'approve':
      return {
        title: 'Approve Procurement Request',
        message: `Are you sure you want to approve procurement request ${ticketNumber}?`,
        description: `Total estimated value: ${formatIDR(estimatedTotal)}. This request will proceed to the next approval step or purchasing.`,
        type: 'info',
        confirmText: 'Yes, Approve',
      };

    case 'reject':
      return {
        title: 'Reject Procurement Request',
        message: `Are you sure you want to reject procurement request ${ticketNumber}?`,
        description:
          'This action will permanently reject this procurement request. The requester will be notified.',
        type: 'danger',
        confirmText: 'Yes, Reject',
      };

    case 'revise':
      return {
        title: 'Request Revision',
        message: `Are you sure you want to return procurement request ${ticketNumber} for revision?`,
        description:
          'The requester will receive this request back with your notes to make required corrections.',
        type: 'warning',
        confirmText: 'Yes, Request Revision',
      };
      
    case 'cancel':
      return {
        title: 'Cancel Procurement Request',
        message: `Are you sure you want to cancel procurement request ${ticketNumber}?`,
        description:
          'The request will be closed as Cancelled and can no longer be edited or resubmitted. This action cannot be undone.',
        type: 'danger',
        confirmText: 'Yes, Cancel Request',
        cancelText: 'Keep Request',
      };
  }
}

export function getReceiveGoodsConfirm(ticketNumber: string): ConfirmContent {
  return {
    title: 'Confirm Purchase Completion',
    message: `Are you sure you want to mark procurement request ${ticketNumber} as purchased?`,
    description:
      'Ensure that all requested items or services have been received and verified according to the ticket details.',
    type: 'success',
    confirmText: 'Yes, Mark as Purchased',
  };
}

export function getResubmitConfirm(
  ticketNumber: string,
  newTotal: number
): ConfirmContent {
  return {
    title: 'Confirm Resubmission',
    message: `Are you sure you want to resubmit procurement request ${ticketNumber} with the updated details?`,
    description: `The new estimated total is ${formatIDR(newTotal)}. The ticket will be re-submitted for approval.`,
    type: 'info',
    confirmText: 'Yes, Resubmit',
  };
}
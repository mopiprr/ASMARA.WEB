import type { ConfirmDialogType } from '../../../components/common/ConfirmDialog';

import type { MaintenanceAction } from '../types/maintenance.types';

export interface ConfirmContent {
  title: string;
  message: string;
  description: string;
  type: ConfirmDialogType;
  confirmText: string;
  cancelText?: string;
}

// Teks dialog konfirmasi untuk tiap tombol aksi di modal detail.
export function getMaintenanceConfirm(
  action: MaintenanceAction,
  ticketNumber: string,
  extra: { handlerName?: string; repairResultLabel?: string; assetTag?: string; available?: boolean } = {},
): ConfirmContent {
  switch (action) {
    case 'approve':
      return {
        title: 'Approve Maintenance Request',
        message: `Are you sure you want to approve maintenance request ${ticketNumber}?`,
        description: 'The request will be forwarded to IT Support to assign a handler.',
        type: 'info',
        confirmText: 'Yes, Approve',
      };
    case 'reject':
      return {
        title: 'Reject Maintenance Request',
        message: `Are you sure you want to reject maintenance request ${ticketNumber}?`,
        description: 'This request will be closed as Rejected and the asset returns to In Use. The requester will be notified.',
        type: 'danger',
        confirmText: 'Yes, Reject',
      };
    case 'assign':
      return {
        title: 'Assign Maintenance Handler',
        message: `Assign ${extra.handlerName ?? 'this handler'} to maintenance request ${ticketNumber}?`,
        description: 'The requester will be asked to send the item to the assigned handler.',
        type: 'info',
        confirmText: 'Yes, Assign',
      };
    case 'send-item':
      return {
        title: 'Confirm Item Sent',
        message: `Confirm that the item for ${ticketNumber} has been sent?`,
        description: 'The receiving party will be asked to confirm that the item has arrived.',
        type: 'info',
        confirmText: 'Yes, Item Sent',
      };
    case 'receive-item':
      return {
        title: 'Confirm Item Received',
        message: `Confirm that the item for ${ticketNumber} has been received?`,
        description: 'Make sure the item has been checked before confirming.',
        type: 'success',
        confirmText: 'Yes, Item Received',
      };
    case 'repair-result':
      return {
        title: 'Submit Repair Result',
        message: `Submit "${extra.repairResultLabel ?? '-'}" as the repair result for ${ticketNumber}?`,
        description: 'The ticket will move to the next step based on this result. This cannot be changed afterwards.',
        type: 'info',
        confirmText: 'Yes, Submit Result',
      };
    case 'part-check':
      return extra.available
        ? {
            title: 'Confirm Parts Available',
            message: `Send the requested spare parts for ${ticketNumber} to the handler?`,
            description: 'The requested quantity will be deducted from inventory stock.',
            type: 'success',
            confirmText: 'Yes, Send Parts',
          }
        : {
            title: 'Confirm Parts Not Available',
            message: `Mark the requested spare parts for ${ticketNumber} as not available?`,
            description: 'The handler will be asked to create a procurement request for the parts.',
            type: 'warning',
            confirmText: 'Yes, Not Available',
          };
    case 'receive-part':
      return {
        title: 'Confirm Parts Received',
        message: `Confirm that the spare parts for ${ticketNumber} have been received?`,
        description: 'The ticket will return to Repair In Progress.',
        type: 'success',
        confirmText: 'Yes, Parts Received',
      };
    case 'order-part':
      return {
        title: 'Create Spare Part Procurement',
        message: `Create a procurement request for the spare parts of ${ticketNumber}?`,
        description: 'A new Procurement ticket will be submitted for approval. This ticket waits until the parts are purchased.',
        type: 'info',
        confirmText: 'Yes, Create Request',
      };
    case 'archive':
      return {
        title: 'Archive Asset',
        message: `Archive the asset of maintenance request ${ticketNumber}?`,
        description: 'The asset will be archived and Inventory will process a replacement.',
        type: 'warning',
        confirmText: 'Yes, Archive',
      };
    case 'dispose':
      return {
        title: 'Dispose Asset',
        message: `Dispose the asset of maintenance request ${ticketNumber}?`,
        description: 'The asset will be disposed permanently and Inventory will process a replacement.',
        type: 'danger',
        confirmText: 'Yes, Dispose',
      };
    case 'replacement':
      return extra.available
        ? {
            title: 'Assign Replacement Asset',
            message: `Give ${extra.assetTag ?? 'the selected asset'} to the requester of ${ticketNumber}?`,
            description: 'The replacement asset will be assigned to the requester.',
            type: 'success',
            confirmText: 'Yes, Assign Replacement',
          }
        : {
            title: 'Purchase Replacement Asset',
            message: `Create a procurement request for the replacement asset of ${ticketNumber}?`,
            description: 'A new Procurement ticket will be submitted for approval. This ticket waits until the replacement is purchased.',
            type: 'info',
            confirmText: 'Yes, Create Request',
          };
    case 'send-replacement':
      return {
        title: 'Send Replacement Asset',
        message: `Send ${extra.assetTag ?? 'the selected asset'} to the requester of ${ticketNumber}?`,
        description: 'The requester will be asked to confirm that the replacement has been received.',
        type: 'success',
        confirmText: 'Yes, Send Replacement',
      };
    case 'close':
      return {
        title: 'Close Maintenance Request',
        message: `Close maintenance request ${ticketNumber}?`,
        description: 'The ticket will be marked as Completed.',
        type: 'success',
        confirmText: 'Yes, Close Ticket',
      };
  }
}
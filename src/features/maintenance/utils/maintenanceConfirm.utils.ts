import type { ConfirmDialogType } from '../../../components/common/ConfirmDialog';
import { formatIDR } from '../../../utils/formatters';

export interface MaintenanceConfirmContent {
  title: string;
  message: string;
  description: string;
  type: ConfirmDialogType;
  confirmText: string;
  cancelText?: string;
}

export function getMaintenanceApproveConfirm(
  ticketNumber: string,
): MaintenanceConfirmContent {
  return {
    title: 'Approve Maintenance Request',
    message: `Are you sure you want to approve maintenance request ${ticketNumber}?`,
    description:
      'This ticket will proceed to the next step in the maintenance workflow.',
    type: 'info',
    confirmText: 'Yes, Approve',
  };
}

export function getMaintenanceRejectConfirm(
  ticketNumber: string,
): MaintenanceConfirmContent {
  return {
    title: 'Reject Maintenance Request',
    message: `Are you sure you want to reject maintenance request ${ticketNumber}?`,
    description:
      'This action will reject the maintenance request with your note. The requester will be notified.',
    type: 'danger',
    confirmText: 'Yes, Reject',
  };
}

export function getMaintenanceAssignConfirm(
  ticketNumber: string,
  handlerLabel?: string,
): MaintenanceConfirmContent {
  return {
    title: 'Assign Maintenance Handler',
    message: `Are you sure you want to assign ${handlerLabel || 'this handler'} to ${ticketNumber}?`,
    description:
      'The assigned technician/handler will be responsible for inspecting and repairing the asset.',
    type: 'info',
    confirmText: 'Yes, Assign Handler',
  };
}

export function getMaintenanceArchiveConfirm(
  ticketNumber: string,
): MaintenanceConfirmContent {
  return {
    title: 'Confirm Archive Disposition',
    message: `Are you sure you want to archive the asset for maintenance ticket ${ticketNumber}?`,
    description:
      'The ticket will proceed to archive handling without triggering asset disposal.',
    type: 'warning',
    confirmText: 'Yes, Archive Asset',
  };
}

export function getMaintenanceDisposeConfirm(
  ticketNumber: string,
): MaintenanceConfirmContent {
  return {
    title: 'Confirm Asset Disposal',
    message: `Are you sure you want to dispose of the asset for maintenance ticket ${ticketNumber}?`,
    description:
      'Disposal marks the asset as unrepairable and moves the ticket to replacement/disposal handling.',
    type: 'danger',
    confirmText: 'Yes, Dispose Asset',
  };
}

export function getMaintenanceRepairResultConfirm(
  ticketNumber: string,
  result: 1 | 2 | 3,
): MaintenanceConfirmContent {
  const resultLabels: Record<1 | 2 | 3, string> = {
    1: 'Repaired',
    2: 'Unrepairable',
    3: 'Need Spare Part',
  };

  return {
    title: 'Submit Repair Result',
    message: `Are you sure you want to submit "${resultLabels[result]}" for ${ticketNumber}?`,
    description:
      result === 3
        ? 'The requested spare parts will be routed to Inventory for stock verification.'
        : 'This inspection result will advance the ticket to the next workflow step.',
    type: result === 2 ? 'warning' : 'info',
    confirmText: 'Yes, Submit Result',
  };
}

export function getMaintenanceCheckPartConfirm(
  ticketNumber: string,
  available: boolean,
): MaintenanceConfirmContent {
  return available
    ? {
        title: 'Confirm Spare Parts Available',
        message: `Confirm that required spare parts for ${ticketNumber} are available in Inventory?`,
        description:
          'Available stock quantities will be deducted automatically and reserved for the handler.',
        type: 'success',
        confirmText: 'Yes, Confirm Available',
      }
    : {
        title: 'Mark Spare Parts Unavailable',
        message: `Confirm that required spare parts for ${ticketNumber} are unavailable in Inventory?`,
        description:
          'The handler will be instructed to create a spare part procurement request.',
        type: 'warning',
        confirmText: 'Yes, Mark Unavailable',
      };
}

export function getMaintenanceOrderPartConfirm(
  ticketNumber: string,
  estimatedTotal: number,
): MaintenanceConfirmContent {
  return {
    title: 'Create Spare Part Procurement',
    message: `Submit spare part procurement request for ${ticketNumber}?`,
    description: `Total estimated value: ${formatIDR(estimatedTotal)}. A linked procurement ticket will be created.`,
    type: 'info',
    confirmText: 'Yes, Create Procurement',
  };
}

export function getMaintenanceSendPartConfirm(
  ticketNumber: string,
): MaintenanceConfirmContent {
  return {
    title: 'Send Spare Parts to Handler',
    message: `Mark spare parts for ${ticketNumber} as sent to the handler?`,
    description:
      'Confirm that the required spare parts have been dispatched from Inventory.',
    type: 'info',
    confirmText: 'Yes, Send Parts',
  };
}

export function getMaintenanceReceivePartConfirm(
  ticketNumber: string,
): MaintenanceConfirmContent {
  return {
    title: 'Confirm Spare Parts Received',
    message: `Confirm that you have received the spare parts for ${ticketNumber}?`,
    description:
      'Once confirmed, the ticket will return to repair execution status.',
    type: 'success',
    confirmText: 'Yes, Confirm Received',
  };
}

export function getMaintenanceProcessReplacementConfirm(
  ticketNumber: string,
  available: boolean,
  estimatedTotal?: number,
): MaintenanceConfirmContent {
  return available
    ? {
        title: 'Confirm Replacement Asset Available',
        message: `Confirm replacement asset selection for ${ticketNumber}?`,
        description:
          'The selected replacement asset from Inventory will be assigned to this maintenance ticket.',
        type: 'info',
        confirmText: 'Yes, Confirm Available',
      }
    : {
        title: 'Create Replacement Procurement',
        message: `Submit replacement asset procurement request for ${ticketNumber}?`,
        description: `Total estimated value: ${formatIDR(estimatedTotal ?? 0)}. A procurement request will be created because no replacement asset is available.`,
        type: 'warning',
        confirmText: 'Yes, Create Procurement',
      };
}

export function getMaintenanceSendReplacementConfirm(
  ticketNumber: string,
): MaintenanceConfirmContent {
  return {
    title: 'Send Replacement Asset',
    message: `Confirm sending the replacement asset for ${ticketNumber}?`,
    description:
      'Confirm that the replacement asset has been handed over / dispatched to the requester.',
    type: 'info',
    confirmText: 'Yes, Send Replacement',
  };
}

export function getMaintenanceSendItemConfirm(
  ticketNumber: string,
): MaintenanceConfirmContent {
  return {
    title: 'Confirm Item Sent',
    message: `Confirm that you have sent the damaged asset for ${ticketNumber}?`,
    description:
      'The assigned handler will be able to confirm receipt once the item arrives.',
    type: 'info',
    confirmText: 'Yes, Send Item',
  };
}

export function getMaintenanceReceiveItemConfirm(
  ticketNumber: string,
): MaintenanceConfirmContent {
  return {
    title: 'Confirm Item Received',
    message: `Confirm that you have received the asset for ${ticketNumber}?`,
    description:
      'Once received, you can proceed with inspection and submit the repair result.',
    type: 'success',
    confirmText: 'Yes, Confirm Received',
  };
}

export function getMaintenanceCloseTicketConfirm(
  ticketNumber: string,
): MaintenanceConfirmContent {
  return {
    title: 'Close Maintenance Ticket',
    message: `Are you sure you want to close maintenance ticket ${ticketNumber}?`,
    description:
      'Confirm that the repaired or replacement asset has been received and the issue is resolved.',
    type: 'success',
    confirmText: 'Yes, Close Ticket',
  };
}

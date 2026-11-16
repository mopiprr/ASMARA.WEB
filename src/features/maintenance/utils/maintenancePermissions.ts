import type { MaintenanceTicket } from '../types/maintenance.types';

export interface MaintenanceDetailVisibility {
  currentStep?: string;
  isDivisionManagerReview: boolean;
  showDecisionActions: boolean;
  showAssignmentAction: boolean;
  showDispositionActions: boolean;
  showSendItemAction: boolean;
  showReceiveItemAction: boolean;
  showCloseTicketAction: boolean;
  showSubmitRepairResultAction: boolean;
  showCheckPartAction: boolean;
  showOrderPartAction: boolean;
  showSendPartAction: boolean;
  showReceivePartAction: boolean;
  showReplacementDecisionAction: boolean;
  showSendReplacementAction: boolean;
  hasActions: boolean;
}

/**
 * Computes which action sections are visible for a maintenance ticket.
 */
export function getMaintenanceDetailVisibility(
  ticket: MaintenanceTicket | null,
): MaintenanceDetailVisibility {
  const currentStep = ticket?.currentStep?.toUpperCase();
  const isDivisionManagerReview = currentStep === 'DIVISION_MANAGER_REVIEW';

  const showDecisionActions = Boolean(
    ticket &&
      !isDivisionManagerReview &&
      (ticket.canApprove || ticket.canReject),
  );

  const showAssignmentAction = Boolean(ticket?.canAssignHandler);

  const showDispositionActions = Boolean(
    ticket &&
      isDivisionManagerReview &&
      (ticket.canArchive || ticket.canDispose),
  );

  const showSendItemAction = Boolean(
    ticket?.canSendItem && currentStep !== 'INVENTORY_SEND_REPLACEMENT',
  );

  const showReceiveItemAction = Boolean(ticket?.canReceiveItem);

  const showCloseTicketAction = Boolean(
    ticket &&
      currentStep === 'REQUESTER_CLOSE' &&
      ticket.currentTaskEmployeeId === ticket.employeeId,
  );

  const showSubmitRepairResultAction = Boolean(ticket?.canSubmitRepairResult);
  const showCheckPartAction = Boolean(ticket?.canCheckPart);
  const showOrderPartAction = Boolean(ticket?.canOrderPart);
  const showSendPartAction = Boolean(ticket?.canSendPart);
  const showReceivePartAction = Boolean(ticket?.canReceivePart);

  const isInventoryReplacementStep =
    currentStep === 'INVENTORY_DISPOSE' ||
    currentStep === 'INVENTORY_ARCHIVE';

  const showReplacementDecisionAction = Boolean(
    ticket && isInventoryReplacementStep && ticket.canProcessReplacement,
  );

  const showSendReplacementAction = Boolean(
    ticket &&
      currentStep === 'INVENTORY_SEND_REPLACEMENT' &&
      ticket.canSendReplacement,
  );

  const hasActions =
    showDecisionActions ||
    showAssignmentAction ||
    showDispositionActions ||
    showSendItemAction ||
    showReceiveItemAction ||
    showCloseTicketAction ||
    showSubmitRepairResultAction ||
    showCheckPartAction ||
    showOrderPartAction ||
    showSendPartAction ||
    showReceivePartAction ||
    showReplacementDecisionAction ||
    showSendReplacementAction;

  return {
    currentStep,
    isDivisionManagerReview,
    showDecisionActions,
    showAssignmentAction,
    showDispositionActions,
    showSendItemAction,
    showReceiveItemAction,
    showCloseTicketAction,
    showSubmitRepairResultAction,
    showCheckPartAction,
    showOrderPartAction,
    showSendPartAction,
    showReceivePartAction,
    showReplacementDecisionAction,
    showSendReplacementAction,
    hasActions,
  };
}


import { useCallback, useState } from 'react';

import api from '../../../services/api';

import type {
  AssignMaintenanceHandlerPayload,
  CreateMaintenancePayload,
  MaintenanceChildTicketResult,
  MaintenanceNotePayload,
  MaintenancePartCheckPayload,
  MaintenanceReplacementPayload,
  MaintenanceTransitionResult,
  OrderMaintenancePartPayload,
  SendMaintenanceReplacementPayload,
  SubmitRepairResultPayload,
} from '../types/maintenance.types';

interface UseMaintenanceActionsProps {
  onSuccess?: () => void | Promise<void>;
}

interface ApiErrorResponse {
  response?: {
    data?: {
      message?: string;
      detail?: string;
      title?: string;
    };
  };
  message?: string;
}

function getErrorMessage(error: unknown): string {
  const apiError = error as ApiErrorResponse;

  return (
    apiError.response?.data?.detail ||
    apiError.response?.data?.message ||
    apiError.response?.data?.title ||
    apiError.message ||
    'An error occurred while processing maintenance.'
  );
}

export function useMaintenanceActions({
  onSuccess,
}: UseMaintenanceActionsProps = {}) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [actionError, setActionError] = useState('');

  const execute = useCallback(
    async <T,>(request: () => Promise<T>): Promise<T> => {
      try {
        setIsProcessing(true);
        setActionError('');

        const result = await request();

        if (onSuccess) {
          await onSuccess();
        }

        return result;
      } catch (error: unknown) {
        console.error(
          'Failed to process maintenance action:',
          error,
        );

        const message = getErrorMessage(error);
        setActionError(message);

        throw new Error(message);
      } finally {
        setIsProcessing(false);
      }
    },
    [onSuccess],
  );

  // Create Maintenance ticket.
  const createMaintenance = useCallback(
    (payload: CreateMaintenancePayload) =>
      execute(async () => {
        const response = await api.post<unknown>(
          '/maintenances',
          payload,
        );

        return response.data;
      }),
    [execute],
  );


const approveMaintenance = useCallback(
  (ticketId: string, payload: MaintenanceNotePayload = {}) =>
    execute(async () => {
      const response = await api.post<MaintenanceTransitionResult>(
        `/maintenances/${ticketId}/action`,
        {
          action: 'Approve',
          note: payload.note,
        },
      );

      return response.data;
    }),
  [execute],
);

const rejectMaintenance = useCallback(
  (ticketId: string, payload: MaintenanceNotePayload) =>
    execute(async () => {
      const response = await api.post<MaintenanceTransitionResult>(
        `/maintenances/${ticketId}/action`,
        {
          action: 'Reject',
          note: payload.note,
        },
      );

      return response.data;
    }),
  [execute],
);


  // IT Support: Assign handler.
  const assignHandler = useCallback(
    (
      ticketId: string,
      payload: AssignMaintenanceHandlerPayload,
    ) =>
      execute(async () => {
        const response =
          await api.post<MaintenanceTransitionResult>(
            `/maintenances/${ticketId}/assign-handler`,
            payload,
          );

        return response.data;
      }),
    [execute],
  );

  // Requester: Send item.
  const sendItem = useCallback(
    (
      ticketId: string,
      payload: MaintenanceNotePayload = {},
    ) =>
      execute(async () => {
        const response =
          await api.post<MaintenanceTransitionResult>(
            `/maintenances/${ticketId}/send`,
            payload,
          );

        return response.data;
      }),
    [execute],
  );

  // Requester: Receive item.
  const receiveItem = useCallback(
    (
      ticketId: string,
      payload: MaintenanceNotePayload = {},
    ) =>
      execute(async () => {
        const response =
          await api.post<MaintenanceTransitionResult>(
            `/maintenances/${ticketId}/receive`,
            payload,
          );

        return response.data;
      }),
    [execute],
  );

  // Maintenance Handler: Submit repair result.
  const submitRepairResult = useCallback(
    (
      ticketId: string,
      payload: SubmitRepairResultPayload,
    ) =>
      execute(async () => {
        const response =
          await api.post<MaintenanceTransitionResult>(
            `/maintenances/${ticketId}/repair-result`,
            payload,
          );

        return response.data;
      }),
    [execute],
  );

  // Inventory: Check part availability.
  const checkPart = useCallback(
    (
      ticketId: string,
      payload: MaintenancePartCheckPayload,
    ) =>
      execute(async () => {
        const response =
          await api.post<MaintenanceTransitionResult>(
            `/maintenances/${ticketId}/part-check`,
            payload,
          );

        return response.data;
      }),
    [execute],
  );

  // Close Maintenance ticket.
  const closeMaintenance = useCallback(
    (
      ticketId: string,
      payload: MaintenanceNotePayload = {},
    ) =>
      execute(async () => {
        const response =
          await api.post<MaintenanceTransitionResult>(
            `/maintenances/${ticketId}/close`,
            payload,
          );

        return response.data;
      }),
    [execute],
  );

  // IT Support: Dispose.
  const disposeMaintenance = useCallback(
    (
      ticketId: string,
      payload: MaintenanceNotePayload = {},
    ) =>
      execute(async () => {
        const response =
          await api.post<MaintenanceTransitionResult>(
            `/maintenances/${ticketId}/dispose`,
            payload,
          );

        return response.data;
      }),
    [execute],
  );

  // Division Manager: Archive.
  const archiveMaintenance = useCallback(
    (
      ticketId: string,
      payload: MaintenanceNotePayload = {},
    ) =>
      execute(async () => {
        const response =
          await api.post<MaintenanceTransitionResult>(
            `/maintenances/${ticketId}/archive`,
            payload,
          );

        return response.data;
      }),
    [execute],
  );

  // Inventory: Process replacement availability.
  const processReplacement = useCallback(
    (
      ticketId: string,
      payload: MaintenanceReplacementPayload,
    ) =>
      execute(async () => {
        const response =
          await api.post<MaintenanceTransitionResult>(
            `/maintenances/${ticketId}/replacement`,
            payload,
          );

        return response.data;
      }),
    [execute],
  );

  // Inventory: Order part (creates child Procurement).
  const orderPart = useCallback(
    (
      ticketId: string,
      payload: OrderMaintenancePartPayload,
    ) =>
      execute(async () => {
        const response =
          await api.post<MaintenanceChildTicketResult>(
            `/maintenances/${ticketId}/order-part`,
            payload,
          );

        return response.data;
      }),
    [execute],
  );

  // Inventory: Send replacement item.
  const sendReplacement = useCallback(
    (
      ticketId: string,
      payload: SendMaintenanceReplacementPayload,
    ) =>
      execute(async () => {
        const response =
          await api.post<MaintenanceTransitionResult>(
            `/maintenances/${ticketId}/send-replacement`,
            payload,
          );

        return response.data;
      }),
    [execute],
  );

  return {
    isProcessing,
    actionError,
    setActionError,

    createMaintenance,
    approveMaintenance,
    rejectMaintenance,
    assignHandler,
    sendItem,
    receiveItem,
    submitRepairResult,
    checkPart,
    closeMaintenance,
    disposeMaintenance,
    archiveMaintenance,
    processReplacement,
    orderPart,
    sendReplacement,
  };
}

import { useCallback, useState } from 'react';

import { extractApiErrorMessage } from '../../../utils/apiError';
import { maintenanceApi } from '../services/maintenanceApi';

import type {
  AssignMaintenanceHandlerPayload,
  CreateMaintenancePayload,
  MaintenanceNotePayload,
  MaintenancePartCheckPayload,
  MaintenanceReplacementPayload,
  OrderMaintenancePartPayload,
  SendMaintenanceReplacementPayload,
  SubmitRepairResultPayload,
} from '../types/maintenance.types';

interface UseMaintenanceActionsProps {
  onSuccess?: () => void | Promise<void>;
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
        console.error('Failed to process maintenance action:', error);
        const message = extractApiErrorMessage(
          error,
          'An error occurred while processing maintenance.',
        );
        setActionError(message);
        throw new Error(message);
      } finally {
        setIsProcessing(false);
      }
    },
    [onSuccess],
  );

  const createMaintenance = useCallback(
    (payload: CreateMaintenancePayload) =>
      execute(() => maintenanceApi.create(payload)),
    [execute],
  );

  const approveMaintenance = useCallback(
    (ticketId: string, payload: MaintenanceNotePayload = {}) =>
      execute(() =>
        maintenanceApi.executeAction(ticketId, 'Approve', payload.note),
      ),
    [execute],
  );

  const rejectMaintenance = useCallback(
    (ticketId: string, payload: MaintenanceNotePayload) =>
      execute(() => maintenanceApi.reject(ticketId, payload)),
    [execute],
  );

  const assignHandler = useCallback(
    (ticketId: string, payload: AssignMaintenanceHandlerPayload) =>
      execute(() => maintenanceApi.assignHandler(ticketId, payload)),
    [execute],
  );

  const sendItem = useCallback(
    (ticketId: string, payload: MaintenanceNotePayload = {}) =>
      execute(() =>
        maintenanceApi.executeAction(ticketId, 'Send', payload.note),
      ),
    [execute],
  );

  const receiveItem = useCallback(
    (ticketId: string, payload: MaintenanceNotePayload = {}) =>
      execute(() => maintenanceApi.receive(ticketId, payload)),
    [execute],
  );

  const submitRepairResult = useCallback(
    (ticketId: string, payload: SubmitRepairResultPayload) =>
      execute(() => maintenanceApi.submitRepairResult(ticketId, payload)),
    [execute],
  );

  const checkPart = useCallback(
    (ticketId: string, payload: MaintenancePartCheckPayload) =>
      execute(() => maintenanceApi.checkPart(ticketId, payload)),
    [execute],
  );

  const orderPart = useCallback(
    (ticketId: string, payload: OrderMaintenancePartPayload) =>
      execute(() => maintenanceApi.orderPart(ticketId, payload)),
    [execute],
  );

  const sendPart = useCallback(
    (ticketId: string, payload: MaintenanceNotePayload = {}) =>
      execute(() => maintenanceApi.sendPart(ticketId, payload)),
    [execute],
  );

  const receivePart = useCallback(
    (ticketId: string, payload: MaintenanceNotePayload = {}) =>
      execute(() => maintenanceApi.receive(ticketId, payload)),
    [execute],
  );

  const closeMaintenance = useCallback(
    (ticketId: string, payload: MaintenanceNotePayload = {}) =>
      execute(() =>
        maintenanceApi.executeAction(ticketId, 'Close', payload.note ?? ''),
      ),
    [execute],
  );

  const disposeMaintenance = useCallback(
    (ticketId: string, payload: MaintenanceNotePayload = {}) =>
      execute(() =>
        maintenanceApi.executeAction(ticketId, 'Dispose', payload.note ?? ''),
      ),
    [execute],
  );

  const archiveMaintenance = useCallback(
    (ticketId: string, payload: MaintenanceNotePayload = {}) =>
      execute(() =>
        maintenanceApi.executeAction(ticketId, 'Archive', payload.note ?? ''),
      ),
    [execute],
  );

  const processReplacement = useCallback(
    (ticketId: string, payload: MaintenanceReplacementPayload) =>
      execute(() => maintenanceApi.processReplacement(ticketId, payload)),
    [execute],
  );

  const sendReplacement = useCallback(
    (ticketId: string, payload: SendMaintenanceReplacementPayload) =>
      execute(() => maintenanceApi.sendReplacement(ticketId, payload)),
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
    orderPart,
    sendPart,
    receivePart,
    closeMaintenance,
    disposeMaintenance,
    archiveMaintenance,
    processReplacement,
    sendReplacement,
  };
}

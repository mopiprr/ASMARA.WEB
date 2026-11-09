import { useCallback, useState } from 'react';

import api from '../../../services/api';

import type {
  ResubmitProcurementPayload,
} from '../types/procurement.types';

interface UseProcurementActionsProps {
  onSuccess?: () => void | Promise<void>;
}

// Export agar dapat digunakan oleh ProcurementDetailModal.
export type ProcurementAction = 'approve' | 'revise' | 'reject';

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

export function useProcurementActions({
  onSuccess,
}: UseProcurementActionsProps = {}) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [actionError, setActionError] = useState('');

  // Mengambil pesan error dari API.
  const getErrorMessage = (error: unknown): string => {
    const apiError = error as ApiErrorResponse;

    return (
      apiError.response?.data?.detail ||
      apiError.response?.data?.message ||
      apiError.response?.data?.title ||
      apiError.message ||
      'An error occurred while processing the procurement request.'
    );
  };

  // Menjalankan aksi approval Procurement.
  const executeAction = useCallback(
    async (
      ticketId: string,
      action: ProcurementAction,
      note: string
    ): Promise<boolean> => {
      try {
        setIsProcessing(true);
        setActionError('');

        await api.post(
          `/procurements/${ticketId}/action`,
          {
            action: action.charAt(0).toUpperCase() + action.slice(1),
            note: note.trim() || null,
          }
        );

        if (onSuccess) {
          await onSuccess();
        }

        return true;
      } catch (error: unknown) {
        console.error(
          `Failed to execute procurement action (${action}):`,
          error
        );

        setActionError(getErrorMessage(error));

        return false;
      } finally {
        setIsProcessing(false);
      }
    },
    [onSuccess]
  );

  // Menerima barang Procurement.
  const receiveGoods = useCallback(
    async (
      ticketId: string,
      note: string
    ): Promise<boolean> => {
      try {
        setIsProcessing(true);
        setActionError('');

        await api.post(
          `/procurements/${ticketId}/receive-goods`,
          { note }
        );

        if (onSuccess) {
          await onSuccess();
        }

        return true;
      } catch (error: unknown) {
        console.error(
          'Failed to receive procurement goods:',
          error
        );

        setActionError(getErrorMessage(error));

        return false;
      } finally {
        setIsProcessing(false);
      }
    },
    [onSuccess]
  );

  // Mengirim ulang Procurement setelah revisi.
  const resubmitProcurement = useCallback(
    async (
      ticketId: string,
      payload: ResubmitProcurementPayload
    ): Promise<boolean> => {
      try {
        setIsProcessing(true);
        setActionError('');

        await api.post(
          `/procurements/${ticketId}/resubmit`,
          payload
        );

        if (onSuccess) {
          await onSuccess();
        }

        return true;
      } catch (error: unknown) {
        console.error(
          'Failed to resubmit procurement:',
          error
        );

        setActionError(getErrorMessage(error));

        return false;
      } finally {
        setIsProcessing(false);
      }
    },
    [onSuccess]
  );

  return {
    isProcessing,
    actionError,
    setActionError,
    executeAction,
    receiveGoods,
    resubmitProcurement,
  };
}
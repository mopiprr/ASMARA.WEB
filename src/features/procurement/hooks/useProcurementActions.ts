import { useState } from 'react';
import api from '../../../services/api';

export type ProcurementAction = 'approve' | 'revise' | 'reject';

interface UseProcurementActionsOptions {
  onSuccess: () => Promise<void> | void;
}

export function useProcurementActions({
  onSuccess,
}: UseProcurementActionsOptions) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [actionError, setActionError] = useState('');

  const executeAction = async (
    ticketId: string,
    action: ProcurementAction,
    note: string
  ): Promise<boolean> => {
    try {
      setIsProcessing(true);
      setActionError('');

      await api.post(`/procurements/${ticketId}/${action}`, {
        note: note.trim() || null,
      });

      await onSuccess();

      return true;
    } catch (error: unknown) {
      console.error('Failed to execute procurement action:', error);

      const apiError = error as {
        response?: {
          data?: {
            message?: string;
            detail?: string;
            title?: string;
          };
        };
        message?: string;
      };

      setActionError(
        apiError.response?.data?.detail ||
          apiError.response?.data?.message ||
          apiError.response?.data?.title ||
          apiError.message ||
          'Failed to process procurement action.'
      );

      return false;
    } finally {
      setIsProcessing(false);
    }
  };

  const receiveGoods = async (
    ticketId: string,
    note: string
  ): Promise<boolean> => {
    try {
      setIsProcessing(true);
      setActionError('');

      await api.post(`/procurements/${ticketId}/receive-goods`, {
        note: note.trim() || null,
      });

      await onSuccess();

      return true;
    } catch (error: unknown) {
      console.error('Failed to receive procurement goods:', error);

      const apiError = error as {
        response?: {
          data?: {
            message?: string;
            detail?: string;
            title?: string;
          };
        };
        message?: string;
      };

      setActionError(
        apiError.response?.data?.detail ||
          apiError.response?.data?.message ||
          apiError.response?.data?.title ||
          apiError.message ||
          'Failed to mark procurement as purchased.'
      );

      return false;
    } finally {
      setIsProcessing(false);
    }
  };

  return {
    isProcessing,
    actionError,
    setActionError,
    executeAction,
    receiveGoods,
  };
}
import { useState } from 'react';
import api from '../../../services/api';

import type {
  ResubmitProcurementPayload,
} from '../types/procurement.types';

export type ProcurementAction = 'approve' | 'revise' | 'reject';

interface UseProcurementActionsOptions {
  onSuccess: () => Promise<void> | void;
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

export function useProcurementActions({
  onSuccess,
}: UseProcurementActionsOptions) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [actionError, setActionError] = useState('');

  const getErrorMessage = (
    error: unknown,
    fallback: string
  ): string => {
    const apiError = error as ApiErrorResponse;

    return (
      apiError.response?.data?.detail ||
      apiError.response?.data?.message ||
      apiError.response?.data?.title ||
      apiError.message ||
      fallback
    );
  };

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
      setActionError(
        getErrorMessage(
          error,
          'Failed to process procurement action.'
        )
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

      await api.post(
        `/procurements/${ticketId}/receive-goods`,
        {
          note: note.trim() || null,
        }
      );

      await onSuccess();
      return true;
    } catch (error: unknown) {
      console.error('Failed to receive procurement goods:', error);
      setActionError(
        getErrorMessage(
          error,
          'Failed to mark procurement as purchased.'
        )
      );
      return false;
    } finally {
      setIsProcessing(false);
    }
  };

  const resubmitProcurement = async (
    ticketId: string,
    payload: ResubmitProcurementPayload
  ): Promise<boolean> => {
    try {
      setIsProcessing(true);
      setActionError('');

      await api.put(
        `/procurements/${ticketId}/resubmit`,
        payload
      );

      await onSuccess();
      return true;
    } catch (error: unknown) {
      console.error('Failed to resubmit procurement:', error);
      setActionError(
        getErrorMessage(
          error,
          'Failed to resubmit procurement request.'
        )
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
    resubmitProcurement,
  };
}
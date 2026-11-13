import { useCallback, useState } from 'react';

import { procurementApi } from '../services/procurementApi';
import { getApiErrorMessage } from '../utils/procurement.utils';

import type { ResubmitProcurementPayload } from '../types/procurement.types';

interface UseProcurementActionsProps {
  onSuccess?: () => void | Promise<void>;
}

// Export agar dapat digunakan oleh ProcurementDetailModal.
export type ProcurementAction = 'approve' | 'revise' | 'reject';

const ACTION_ERROR =
  'An error occurred while processing the procurement request.';

export function useProcurementActions({
  onSuccess,
}: UseProcurementActionsProps = {}) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [actionError, setActionError] = useState('');

  // Pola yang sama untuk semua aksi: loading -> panggil API -> refresh -> true,
  // atau simpan pesan error -> false.
  const run = useCallback(
    async (
      request: () => Promise<void>,
      logMessage: string
    ): Promise<boolean> => {
      try {
        setIsProcessing(true);
        setActionError('');

        await request();

        if (onSuccess) {
          await onSuccess();
        }

        return true;
      } catch (error: unknown) {
        console.error(logMessage, error);

        setActionError(getApiErrorMessage(error, ACTION_ERROR));

        return false;
      } finally {
        setIsProcessing(false);
      }
    },
    [onSuccess]
  );

  // Menjalankan aksi approval Procurement.
  const executeAction = useCallback(
    (ticketId: string, action: ProcurementAction, note: string) =>
      run(
        () =>
          procurementApi.executeAction(
            ticketId,
            action.charAt(0).toUpperCase() + action.slice(1),
            note.trim() || null
          ),
        `Failed to execute procurement action (${action}):`
      ),
    [run]
  );

  // Menerima barang Procurement.
  const receiveGoods = useCallback(
    (ticketId: string, note: string, proofFile: File) =>
      run(
        () => procurementApi.receiveGoods(ticketId, note, proofFile),
        'Failed to receive procurement goods:'
      ),
    [run]
  );

  // Mengirim ulang Procurement setelah revisi.
  const resubmitProcurement = useCallback(
    (ticketId: string, payload: ResubmitProcurementPayload) =>
      run(
        () => procurementApi.resubmit(ticketId, payload),
        'Failed to resubmit procurement:'
      ),
    [run]
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
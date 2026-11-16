import { useCallback, useState } from 'react';

import { getApiErrorMessage } from '../utils/maintenance.utils';

interface UseMaintenanceActionsProps {
  onSuccess?: () => void | Promise<void>;
}

const ACTION_ERROR = 'An error occurred while processing the maintenance request.';

// Menjalankan aksi workflow Maintenance (request API dibuat di modal detail lewat maintenanceApi).
// Mengembalikan true (berhasil) / false (gagal, pesan di actionError).
export function useMaintenanceActions({ onSuccess }: UseMaintenanceActionsProps = {}) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [actionError, setActionError] = useState('');

  // Pola yang sama dengan Procurement: loading -> API -> refresh -> true, atau simpan pesan error -> false.
  const run = useCallback(
    async (request: () => Promise<void>, logMessage: string): Promise<boolean> => {
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
    [onSuccess],
  );

  return {
    isProcessing,
    actionError,
    setActionError,
    run,
  };
}
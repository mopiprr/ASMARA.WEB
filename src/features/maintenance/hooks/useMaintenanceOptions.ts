import { useCallback, useState } from 'react';

import { extractApiErrorMessage } from '../../../utils/apiError';
import { maintenanceApi } from '../services/maintenanceApi';
import type {
  MaintenanceAssetOption,
  MaintenanceHandlerOption,
} from '../types/maintenance.types';

function isValidGuid(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
    value,
  );
}

export function useMaintenanceOptions() {
  const [assets, setAssets] = useState<MaintenanceAssetOption[]>([]);
  const [handlers, setHandlers] = useState<MaintenanceHandlerOption[]>([]);

  const [isLoadingAssets, setIsLoadingAssets] = useState(false);
  const [isLoadingHandlers, setIsLoadingHandlers] = useState(false);

  const [assetError, setAssetError] = useState('');
  const [handlerError, setHandlerError] = useState('');

  const fetchAssets = useCallback(async () => {
    try {
      setIsLoadingAssets(true);
      setAssetError('');

      const data = await maintenanceApi.getAvailableAssets();

      if (!Array.isArray(data)) {
        setAssets([]);
        setAssetError('Invalid asset data received from server.');
        return;
      }

      setAssets(data);
    } catch (error: unknown) {
      console.error('Failed to fetch maintenance assets:', error);
      setAssets([]);
      setAssetError(
        extractApiErrorMessage(error, 'Failed to load maintenance options.'),
      );
    } finally {
      setIsLoadingAssets(false);
    }
  }, []);

  const fetchHandlers = useCallback(async () => {
    try {
      setIsLoadingHandlers(true);
      setHandlerError('');

      const data = await maintenanceApi.getAvailableHandlers();

      if (!Array.isArray(data)) {
        setHandlers([]);
        setHandlerError('Invalid handler data received from server.');
        return;
      }

      const invalidHandlers = data.filter(
        (handler) => !isValidGuid(handler.employeeId),
      );

      if (invalidHandlers.length > 0) {
        setHandlers([]);
        setHandlerError(
          'Invalid handler ID received from server. Please check the handler API response.',
        );
        return;
      }

      setHandlers(data);
    } catch (error: unknown) {
      console.error('Failed to fetch maintenance handlers:', error);
      setHandlers([]);
      setHandlerError(
        extractApiErrorMessage(error, 'Failed to load maintenance options.'),
      );
    } finally {
      setIsLoadingHandlers(false);
    }
  }, []);

  return {
    assets,
    handlers,
    isLoadingAssets,
    isLoadingHandlers,
    assetError,
    handlerError,
    fetchAssets,
    fetchHandlers,
  };
}


import { useCallback, useEffect, useState } from 'react';

import api from '../../../services/api';

import type {
  MaintenanceAssetOption,
  MaintenanceHandlerOption,
} from '../types/maintenance.types';

interface ApiErrorResponse {
  response?: {
    status?: number;
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
    'Failed to load maintenance options.'
  );
}

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

  // ==========================================
  // FETCH ASSETS AVAILABLE FOR MAINTENANCE
  // ==========================================

  const fetchAssets = useCallback(async () => {
    try {
      setIsLoadingAssets(true);
      setAssetError('');

      const response = await api.get<MaintenanceAssetOption[]>(
        '/assets/available-for-maintenance',
      );

      console.log('========== MAINTENANCE ASSETS ==========');
      console.log('HTTP STATUS:', response.status);
      console.log('ASSET RESPONSE:', response.data);

      if (!Array.isArray(response.data)) {
        console.error('Invalid maintenance assets response:', response.data);

        setAssets([]);
        setAssetError('Invalid asset data received from server.');
        return;
      }

      console.table(
        response.data.map((asset) => ({
          assetId: asset.assetId,
          assetTag: asset.assetTag,
          itemName: asset.itemName,
          categoryName: asset.categoryName,
          isShared: asset.isShared,
          ownership: asset.isShared ? 'Company Asset' : 'Personal',
        })),
      );

      setAssets(response.data);
    } catch (error: unknown) {
      console.error('Failed to fetch maintenance assets:', error);

      setAssets([]);
      setAssetError(getErrorMessage(error));
    } finally {
      setIsLoadingAssets(false);
    }
  }, []);

  // ==========================================
  // FETCH AVAILABLE MAINTENANCE HANDLERS
  // ==========================================

  const fetchHandlers = useCallback(async () => {
    try {
      setIsLoadingHandlers(true);
      setHandlerError('');

      console.log('========== FETCH MAINTENANCE HANDLERS ==========');
      console.log('REQUEST URL: /employees/handlers');

      const response = await api.get<MaintenanceHandlerOption[]>(
        '/employees/handlers',
      );

      console.log('HTTP STATUS:', response.status);
      console.log('HANDLER RESPONSE:', response.data);
      console.log('IS ARRAY:', Array.isArray(response.data));

      if (!Array.isArray(response.data)) {
        console.error(
          'Invalid maintenance handlers response:',
          response.data,
        );

        setHandlers([]);
        setHandlerError('Invalid handler data received from server.');
        return;
      }

      
console.table(
  response.data.map((handler) => ({
    employeeId: handler.employeeId,
    isValidGuid: isValidGuid(handler.employeeId),
    employeeNumber: handler.employeeNumber,
    fullName: handler.fullName,
  })),
);

const invalidHandlers = response.data.filter(
  (handler) => !isValidGuid(handler.employeeId),
);

if (invalidHandlers.length > 0) {
  console.error('Invalid handler IDs received from API:', invalidHandlers);

  setHandlers([]);
  setHandlerError(
    'Invalid handler ID received from server. Please check the handler API response.',
  );
  return;
}

setHandlers(response.data);


      console.log('HANDLERS COUNT:', response.data.length);

      setHandlers(response.data);
    } catch (error: unknown) {
      console.error('Failed to fetch maintenance handlers:', error);

      setHandlers([]);
      setHandlerError(getErrorMessage(error));
    } finally {
      setIsLoadingHandlers(false);
    }
  }, []);

  // ==========================================
  // INITIAL FETCH
  // ==========================================

 useEffect(() => {
  void fetchAssets();
  void fetchHandlers();
}, [fetchAssets, fetchHandlers]);
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

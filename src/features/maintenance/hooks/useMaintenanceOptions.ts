
import { useCallback, useEffect, useState } from 'react';

import api from '../../../services/api';

import type {
  MaintenanceAssetOption,
  MaintenanceHandlerOption,
} from '../types/maintenance.types';

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
    'Failed to load maintenance options.'
  );
}

export function useMaintenanceOptions() {
  const [assets, setAssets] = useState<MaintenanceAssetOption[]>([]);
  const [handlers, setHandlers] = useState<MaintenanceHandlerOption[]>([]);

  const [isLoadingAssets, setIsLoadingAssets] = useState(false);
  const [isLoadingHandlers, setIsLoadingHandlers] = useState(false);

  const [assetError, setAssetError] = useState('');
  const [handlerError, setHandlerError] = useState('');

  // Fetch assets available for maintenance
  const fetchAssets = useCallback(async () => {
    try {
      setIsLoadingAssets(true);
      setAssetError('');

      const response = await api.get<MaintenanceAssetOption[]>(
        '/assets/available-for-maintenance',
      );

      console.log(
        'Maintenance assets API response:',
        response.data,
      );

      if (!Array.isArray(response.data)) {
        console.error(
          'Invalid maintenance assets response:',
          response.data,
        );

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
          ownership: asset.isShared
            ? 'Company Asset'
            : 'Personal',
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

  // Fetch available maintenance handlers
  const fetchHandlers = useCallback(async () => {
    try {
      setIsLoadingHandlers(true);
      setHandlerError('');

      const response = await api.get<MaintenanceHandlerOption[]>(
        '/employees/handlers',
      );

      setHandlers(response.data ?? []);
    } catch (error: unknown) {
      console.error('Failed to fetch maintenance handlers:', error);

      setHandlers([]);
      setHandlerError(getErrorMessage(error));
    } finally {
      setIsLoadingHandlers(false);
    }
  }, []);

  useEffect(() => {
    void fetchAssets();
  }, [fetchAssets]);

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

import { useCallback, useEffect, useState } from 'react';

import api from '../../../services/api';

import type {
  MaintenanceAssetOption,
} from '../types/maintenance.types';

export function useMaintenanceAssets() {
  const [assets, setAssets] = useState<MaintenanceAssetOption[]>([]);
  const [isLoadingAssets, setIsLoadingAssets] = useState(false);
  const [assetError, setAssetError] = useState('');

  const fetchAssets = useCallback(async () => {
    try {
      setIsLoadingAssets(true);
      setAssetError('');

      const response = await api.get<MaintenanceAssetOption[]>(
        '/assets/available-for-maintenance'
      );

      setAssets(response.data);
    } catch (error: unknown) {
      console.error('Failed to fetch maintenance assets:', error);

      setAssetError(
        error instanceof Error
          ? error.message
          : 'Failed to load available assets.'
      );
    } finally {
      setIsLoadingAssets(false);
    }
  }, []);

  useEffect(() => {
    fetchAssets();
  }, [fetchAssets]);

  return {
    assets,
    isLoadingAssets,
    assetError,
    fetchAssets,
  };
}
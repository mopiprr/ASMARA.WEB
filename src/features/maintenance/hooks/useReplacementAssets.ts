import { useEffect, useState } from 'react';

import { extractApiErrorMessage } from '../../../utils/apiError';
import {
  maintenanceApi,
  type ReplacementAssetOption,
} from '../services/maintenanceApi';

/**
 * Fetches available replacement assets only when replacement decision/send steps are active.
 */
export function useReplacementAssets(
  ticketId: string | undefined,
  enabled: boolean,
) {
  const [replacementAssets, setReplacementAssets] = useState<
    ReplacementAssetOption[]
  >([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let isMounted = true;

    const fetchReplacementAssets = async () => {
      if (!ticketId || !enabled) {
        setReplacementAssets([]);
        setError('');
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError('');

        const data = await maintenanceApi.getReplacementAssets(ticketId);
        if (isMounted) {
          setReplacementAssets(data);
        }
      } catch (err: unknown) {
        if (!isMounted) return;
        setReplacementAssets([]);
        setError(extractApiErrorMessage(err, 'Failed to load replacement assets.'));
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    void fetchReplacementAssets();

    return () => {
      isMounted = false;
    };
  }, [ticketId, enabled]);

  return {
    replacementAssets,
    isLoadingReplacementAssets: isLoading,
    replacementAssetError: error,
  };
}

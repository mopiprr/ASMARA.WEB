import { useCallback, useEffect, useRef, useState } from 'react';

import { getApiErrorMessage } from '../utils/maintenance.utils';

// Memuat data pilihan (dropdown) HANYA saat enabled = true, aman terhadap race condition saat tiket berganti.
export function useLazyOptions<T>(
  loader: (() => Promise<T[]>) | null,
  enabled: boolean,
  fallbackError: string,
  key = '',
) {
  const [options, setOptions] = useState<T[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const loaderRef = useRef(loader);
  loaderRef.current = loader;

  const requestIdRef = useRef(0);

  const load = useCallback(async () => {
    const currentLoader = loaderRef.current;
    if (!currentLoader) return;

    const requestId = ++requestIdRef.current;

    try {
      setIsLoading(true);
      setError('');

      const data = await currentLoader();
      if (requestIdRef.current !== requestId) return;

      setOptions(Array.isArray(data) ? data : []);
    } catch (err: unknown) {
      if (requestIdRef.current !== requestId) return;

      console.error(fallbackError, err);
      setOptions([]);
      setError(getApiErrorMessage(err, fallbackError));
    } finally {
      if (requestIdRef.current === requestId) {
        setIsLoading(false);
      }
    }
  }, [key, fallbackError]);

  useEffect(() => {
    if (!enabled) {
      requestIdRef.current += 1;
      setOptions([]);
      setError('');
      setIsLoading(false);
      return;
    }

    void load();

    return () => {
      requestIdRef.current += 1;
    };
  }, [enabled, load]);

  return { options, isLoading, error, reload: load };
}

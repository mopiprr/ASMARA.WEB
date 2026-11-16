import { useCallback, useEffect, useState } from 'react';

import { getApiErrorMessage } from '../utils/maintenance.utils';

// Memuat data pilihan (dropdown) HANYA saat enabled = true.
// Dipakai supaya API yang belum dibutuhkan (atau yang hanya boleh untuk role tertentu) tidak dipanggil.
export function useLazyOptions<T>(
  loader: (() => Promise<T[]>) | null,
  enabled: boolean,
  fallbackError: string,
  key = '',
) {
  const [options, setOptions] = useState<T[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    if (!loader) return;

    try {
      setIsLoading(true);
      setError('');

      const data = await loader();
      setOptions(Array.isArray(data) ? data : []);
    } catch (err: unknown) {
      console.error(fallbackError, err);

      setOptions([]);
      setError(getApiErrorMessage(err, fallbackError));
    } finally {
      setIsLoading(false);
    }
    // key: muat ulang saat tiket berganti
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, fallbackError]);

  useEffect(() => {
    if (!enabled) {
      setOptions([]);
      setError('');
      return;
    }

    void load();
  }, [enabled, load]);

  return { options, isLoading, error, reload: load };
}
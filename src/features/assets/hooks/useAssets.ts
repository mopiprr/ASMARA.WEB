import { useCallback, useEffect, useState } from 'react';

import api from '../../../services/api';

import type { PagedResult } from '../../procurement/types/procurement.types';

import type { AssetListItem, AssetSortField } from '../types/asset.types';

const PAGE_SIZE = 10;

export function useAssets() {
  const [assets, setAssets] = useState<AssetListItem[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Filter, sorting, paging
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');   // '' = semua status
  const [sortBy, setSortBy] = useState<AssetSortField>('assetTag');
  const [desc, setDesc] = useState(false);
  const [page, setPage] = useState(1);

  // Search ditunda 400ms supaya tidak request setiap ketikan.
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchInput.trim());
      setPage(1);
    }, 400);

    return () => clearTimeout(timer);
  }, [searchInput]);

  const fetchAssets = useCallback(async () => {
    try {
      setIsLoading(true);
      setError('');

      const response = await api.get<PagedResult<AssetListItem>>('/assets', {
        params: {
          status: status || undefined,
          search: search || undefined,
          sortBy,
          desc,
          page,
          pageSize: PAGE_SIZE,
        },
      });

      setAssets(response.data.items ?? []);
      setTotalCount(response.data.totalCount ?? 0);
      setTotalPages(response.data.totalPages ?? 0);
    } catch (err: unknown) {
      console.error('Failed to fetch assets:', err);

      const apiError = err as {
        response?: {
          data?: { message?: string; detail?: string; title?: string };
        };
        message?: string;
      };

      setAssets([]);
      setTotalCount(0);
      setTotalPages(0);
      setError(
        apiError.response?.data?.detail ||
          apiError.response?.data?.message ||
          apiError.response?.data?.title ||
          apiError.message ||
          'Failed to load assets.'
      );
    } finally {
      setIsLoading(false);
    }
  }, [status, search, sortBy, desc, page]);

  useEffect(() => {
    void fetchAssets();
  }, [fetchAssets]);

  const changeStatus = (value: string) => {
    setStatus(value);
    setPage(1);
  };

  // Klik header: field sama -> balik arah, field beda -> mulai dari asc.
  const toggleSort = (field: AssetSortField) => {
    if (field === sortBy) {
      setDesc((previous) => !previous);
    } else {
      setSortBy(field);
      setDesc(false);
    }

    setPage(1);
  };

  const goToPage = (nextPage: number) => {
    if (nextPage < 1 || nextPage > totalPages) return;

    setPage(nextPage);
  };

  return {
    assets,
    isLoading,
    error,
    fetchAssets,

    searchInput,
    setSearchInput,
    hasFilter: Boolean(search || status),

    status,
    changeStatus,

    sortBy,
    desc,
    toggleSort,

    page,
    totalCount,
    totalPages,
    goToPage,
  };
}
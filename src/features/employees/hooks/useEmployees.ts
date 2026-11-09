import { useCallback, useEffect, useState } from 'react';

import api from '../../../services/api';

import type { PagedResult } from '../../procurement/types/procurement.types';

import type {
  EmployeeListItem,
  EmployeeSortField,
} from '../types/employee.types';

import { getApiErrorMessage } from '../utils/employee.utils';

const PAGE_SIZE = 10;

export function useEmployees() {
  const [employees, setEmployees] = useState<EmployeeListItem[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');   // '' = semua status
  const [sortBy, setSortBy] = useState<EmployeeSortField>('employeeNumber');
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

  const fetchEmployees = useCallback(async () => {
    try {
      setIsLoading(true);
      setError('');

      const response = await api.get<PagedResult<EmployeeListItem>>('/employees', {
        params: {
          status: status || undefined,
          search: search || undefined,
          sortBy,
          desc,
          page,
          pageSize: PAGE_SIZE,
        },
      });

      setEmployees(response.data.items ?? []);
      setTotalCount(response.data.totalCount ?? 0);
      setTotalPages(response.data.totalPages ?? 0);
    } catch (err: unknown) {
      console.error('Failed to fetch employees:', err);

      setEmployees([]);
      setTotalCount(0);
      setTotalPages(0);
      setError(getApiErrorMessage(err, 'Failed to load employees.'));
    } finally {
      setIsLoading(false);
    }
  }, [status, search, sortBy, desc, page]);

  useEffect(() => {
    void fetchEmployees();
  }, [fetchEmployees]);

  const changeStatus = (value: string) => {
    setStatus(value);
    setPage(1);
  };

  const toggleSort = (field: EmployeeSortField) => {
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
    employees,
    isLoading,
    error,
    fetchEmployees,

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
import { useState, useEffect, useCallback, useMemo } from 'react';
import { financeApi } from '../services/financeApi';
import type {
  DepartmentBudget,
  BudgetOverview,
  BudgetLog,
  AdjustBudgetPayload,
} from '../types/finance.types';

export function useBudget(initialYear: number = new Date().getFullYear()) {
  const [selectedYear, setSelectedYear] = useState<number>(initialYear);
  const [budgets, setBudgets] = useState<DepartmentBudget[]>([]);
  const [overview, setOverview] = useState<BudgetOverview | null>(null);
  const [logs, setLogs] = useState<BudgetLog[]>([]);
  const [logsTotalCount, setLogsTotalCount] = useState<number>(0);
  const [logsPage, setLogsPage] = useState<number>(1);
  const [logsPageSize] = useState<number>(10);
  const [selectedDepartmentFilter, setSelectedDepartmentFilter] = useState<string>('all');
  const [search, setSearch] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isAdjusting, setIsAdjusting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [budgetsData, overviewData, logsData] = await Promise.all([
        financeApi.getBudgets(selectedYear),
        financeApi.getOverview(selectedYear),
        financeApi.getLogs({
          departmentId: selectedDepartmentFilter !== 'all' ? selectedDepartmentFilter : undefined,
          page: logsPage,
          pageSize: logsPageSize,
        }),
      ]);

      setBudgets(budgetsData);
      setOverview(overviewData);
      setLogs(logsData.items || []);
      setLogsTotalCount(logsData.totalCount || 0);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to load budget data.';
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  }, [selectedYear, selectedDepartmentFilter, logsPage, logsPageSize]);

  useEffect(() => {
    void fetchData();
  }, [fetchData]);

  const filteredBudgets = useMemo(() => {
    return budgets.filter((b) => {
      const matchesSearch =
        search.trim() === '' ||
        b.departmentName.toLowerCase().includes(search.toLowerCase()) ||
        b.departmentCode.toLowerCase().includes(search.toLowerCase());

      const matchesDept =
        selectedDepartmentFilter === 'all' || b.departmentId === selectedDepartmentFilter;

      return matchesSearch && matchesDept;
    });
  }, [budgets, search, selectedDepartmentFilter]);

  const adjustBudget = async (payload: AdjustBudgetPayload) => {
    setIsAdjusting(true);
    setError(null);
    try {
      await financeApi.adjustBudget(payload);
      await fetchData();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to adjust budget.';
      throw new Error(msg);
    } finally {
      setIsAdjusting(false);
    }
  };

  return {
    selectedYear,
    setSelectedYear,
    budgets: filteredBudgets,
    allBudgets: budgets,
    overview,
    logs,
    logsTotalCount,
    logsPage,
    setLogsPage,
    logsPageSize,
    selectedDepartmentFilter,
    setSelectedDepartmentFilter,
    search,
    setSearch,
    isLoading,
    isAdjusting,
    error,
    refetch: fetchData,
    adjustBudget,
  };
}

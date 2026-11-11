import api from '../../../services/api';
import type {
  DepartmentBudget,
  BudgetOverview,
  BudgetCheckResult,
  BudgetLog,
  AdjustBudgetPayload,
} from '../types/finance.types';
import type { PagedResult } from '../../procurement/types/procurement.types';

export const financeApi = {
  async getBudgets(year?: number): Promise<DepartmentBudget[]> {
    const response = await api.get<DepartmentBudget[]>('/finance/budgets', {
      params: { year },
    });
    return response.data;
  },

  async getOverview(year?: number): Promise<BudgetOverview> {
    const response = await api.get<BudgetOverview>('/finance/overview', {
      params: { year },
    });
    return response.data;
  },

  async checkBudget(
    departmentName: string,
    estimatedTotal: number
  ): Promise<BudgetCheckResult> {
    const response = await api.get<BudgetCheckResult>('/finance/check', {
      params: { departmentName, estimatedTotal },
    });
    return response.data;
  },

  async getLogs(params?: {
    departmentId?: string;
    ticketId?: string;
    page?: number;
    pageSize?: number;
  }): Promise<PagedResult<BudgetLog>> {
    const response = await api.get<PagedResult<BudgetLog>>('/finance/logs', {
      params,
    });
    return response.data;
  },

  async adjustBudget(payload: AdjustBudgetPayload): Promise<DepartmentBudget> {
    const response = await api.post<DepartmentBudget>('/finance/adjust', payload);
    return response.data;
  },
};

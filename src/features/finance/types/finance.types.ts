export type BudgetStatus = 'normal' | 'warning' | 'critical' | 'exceeded';

export interface DepartmentBudget {
  id: string;
  departmentId: string;
  departmentCode: string;
  departmentName: string;
  fiscalYear: number;
  allocatedBudget: number;
  spentBudget: number;
  committedBudget: number;
  remainingBudget: number;
  utilizationRate: number;
  status: BudgetStatus;
  createdAt: string;
  updatedAt: string | null;
}

export interface BudgetOverview {
  fiscalYear: number;
  totalAllocated: number;
  totalSpent: number;
  totalCommitted: number;
  totalRemaining: number;
  overallUtilizationRate: number;
}

export interface BudgetCheckResult {
  departmentName: string;
  estimatedTotal: number;
  remainingBudget: number;
  isSufficient: boolean;
  projectedUtilizationRate: number;
  status: BudgetStatus;
  message: string;
}

export interface BudgetLog {
  id: string;
  logNumber: string;
  departmentBudgetId: string;
  departmentName: string;
  ticketId: string | null;
  ticketNumber: string | null;
  relatedDepartmentId: string | null;
  relatedDepartmentName: string | null;
  changeType: number;
  changeTypeName: string;
  amount: number;
  previousAllocated: number;
  newAllocated: number;
  previousRemaining: number;
  newRemaining: number;
  description: string;
  createdByName: string;
  createdAt: string;
}

export interface AdjustBudgetPayload {
  departmentId: string;
  targetDepartmentId?: string | null;
  changeType: number; // 4 = Increase, 5 = Decrease, 6/7 = Transfer
  amount: number;
  reason: string;
}

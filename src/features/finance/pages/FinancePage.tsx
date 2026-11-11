import { useState } from 'react';
import { useBudget } from '../hooks/useBudget';
import FinanceHeader from '../components/FinanceHeader';
import BudgetOverviewCards from '../components/BudgetOverviewCards';
import DepartmentBudgetTable from '../components/DepartmentBudgetTable';
import BudgetLogTable from '../components/BudgetLogTable';
import BudgetAdjustmentModal from '../components/BudgetAdjustmentModal';
import AccessDenied from '../../../components/common/AccessDenied';
import { isFinanceUser } from '../utils/finance.utils';
import type { DepartmentBudget, AdjustBudgetPayload } from '../types/finance.types';
import { Building2, History, CheckCircle2, AlertCircle, X } from 'lucide-react';

export default function FinancePage() {
  const isFinance = isFinanceUser();

  const {
    selectedYear,
    setSelectedYear,
    budgets,
    allBudgets,
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
    error,
    refetch,
    adjustBudget,
  } = useBudget(new Date().getFullYear(), isFinance);

  const [activeTab, setActiveTab] = useState<'budgets' | 'logs'>('budgets');
  const [isAdjustModalOpen, setIsAdjustModalOpen] = useState<boolean>(false);
  const [selectedBudgetForAdjust, setSelectedBudgetForAdjust] = useState<DepartmentBudget | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  if (!isFinance) {
    return <AccessDenied message="Only finance officers and administrators can access the Finance module." />;
  }

  const handleOpenAdjust = (budget?: DepartmentBudget) => {
    setSelectedBudgetForAdjust(budget || null);
    setIsAdjustModalOpen(true);
  };

  const handleAdjustSubmit = async (payload: AdjustBudgetPayload) => {
    await adjustBudget(payload);
    setToastMessage('Budget allocation successfully updated and recorded to audit ledger.');
    setTimeout(() => setToastMessage(null), 5000);
  };

  return (
    <div className="space-y-6">
      {/* TOAST SUCCESS BANNER */}
      {toastMessage && (
        <div className="flex items-center justify-between gap-3 rounded-2xl border border-emerald-200 bg-emerald-50/90 p-4 text-emerald-800 shadow-xs animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 size={18} className="shrink-0 text-emerald-600" />
            <span className="text-xs font-semibold">{toastMessage}</span>
          </div>
          <button
            type="button"
            onClick={() => setToastMessage(null)}
            className="rounded-lg p-1 text-emerald-600 hover:bg-emerald-100/60 transition"
          >
            <X size={15} />
          </button>
        </div>
      )}

      {/* ERROR BANNER */}
      {error && (
        <div className="flex items-center justify-between gap-3 rounded-2xl border border-red-200 bg-red-50/90 p-4 text-red-800 shadow-xs">
          <div className="flex items-center gap-2.5">
            <AlertCircle size={18} className="shrink-0 text-red-600" />
            <span className="text-xs font-semibold">{error}</span>
          </div>
          <button
            type="button"
            onClick={() => refetch()}
            className="text-xs font-bold underline hover:no-underline"
          >
            Retry
          </button>
        </div>
      )}

      {/* HEADER */}
      <FinanceHeader
        selectedYear={selectedYear}
        onYearChange={setSelectedYear}
        search={search}
        onSearchChange={setSearch}
        departmentFilter={selectedDepartmentFilter}
        onDepartmentFilterChange={setSelectedDepartmentFilter}
        departments={allBudgets}
        isLoading={isLoading}
        onRefresh={() => void refetch()}
        onOpenAdjustModal={() => handleOpenAdjust()}
      />

      {/* KPI METRIC CARDS */}
      <BudgetOverviewCards overview={overview} isLoading={isLoading} />

      {/* NAVIGATION TABS */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-px text-xs font-bold">
        <button
          type="button"
          onClick={() => setActiveTab('budgets')}
          className={`flex items-center gap-2 border-b-2 px-4 py-2.5 transition ${
            activeTab === 'budgets'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Building2 size={15} />
          <span>Department Budgets ({budgets.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('logs')}
          className={`flex items-center gap-2 border-b-2 px-4 py-2.5 transition ${
            activeTab === 'logs'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <History size={15} />
          <span>Audit & Expense Ledger ({logsTotalCount})</span>
        </button>
      </div>

      {/* TAB CONTENT */}
      {activeTab === 'budgets' ? (
        <DepartmentBudgetTable
          budgets={budgets}
          isLoading={isLoading}
          onAdjust={handleOpenAdjust}
        />
      ) : (
        <BudgetLogTable
          logs={logs}
          isLoading={isLoading}
          totalCount={logsTotalCount}
          currentPage={logsPage}
          pageSize={logsPageSize}
          onPageChange={setLogsPage}
        />
      )}

      {/* ADJUSTMENT MODAL */}
      <BudgetAdjustmentModal
        isOpen={isAdjustModalOpen}
        selectedBudget={selectedBudgetForAdjust}
        departments={allBudgets}
        onClose={() => setIsAdjustModalOpen(false)}
        onSubmit={handleAdjustSubmit}
      />
    </div>
  );
}

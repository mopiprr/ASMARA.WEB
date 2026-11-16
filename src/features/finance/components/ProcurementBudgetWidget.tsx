import { useState, useEffect } from 'react';
import {
  Wallet,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Loader2,
  Building2,
} from 'lucide-react';
import { financeApi } from '../services/financeApi';
import type { BudgetCheckResult } from '../types/finance.types';
import { formatIDR } from './BudgetOverviewCards';

interface ProcurementBudgetWidgetProps {
  estimatedTotal: number;
  departmentName?: string;
  onBudgetCheckResult?: (result: BudgetCheckResult) => void;
}

export default function ProcurementBudgetWidget({
  estimatedTotal,
  departmentName,
  onBudgetCheckResult,
}: ProcurementBudgetWidgetProps) {
  const [checkResult, setCheckResult] = useState<BudgetCheckResult | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const activeDept = departmentName?.trim() || '';

  // Evaluate budget in backend whenever departmentName or estimatedTotal changes
  useEffect(() => {
    if (!activeDept) {
      setIsLoading(false);
      setCheckResult(null);
      return;
    }

    let isMounted = true;
    setIsLoading(true);
    setError(null);

    async function evaluate() {
      try {
        const result = await financeApi.checkBudget(activeDept, estimatedTotal);
        if (isMounted) {
          setCheckResult(result);
          onBudgetCheckResult?.(result);
        }
      } catch (err: unknown) {
        console.error('Failed to evaluate budget:', err);
        if (isMounted) {
          setError(
            err instanceof Error ? err.message : 'Failed to evaluate department budget.'
          );
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    void evaluate();
    return () => {
      isMounted = false;
    };
  }, [activeDept, estimatedTotal, onBudgetCheckResult]);

  if (!activeDept) {
    return (
      <div className="flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50/70 p-4 text-xs text-amber-800">
        <Building2 size={16} className="text-amber-600" />
        <span>Requester department information is not specified for budget check.</span>
      </div>
    );
  }

  if (isLoading && !checkResult) {
    return (
      <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50/70 p-4 text-xs text-slate-500 animate-pulse">
        <Loader2 size={16} className="animate-spin text-blue-600" />
        <span>Evaluating budget availability for {activeDept}...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50/70 p-4 text-xs text-red-800">
        <XCircle size={16} className="text-red-600" />
        <span>{error}</span>
      </div>
    );
  }

  if (!checkResult) return null;

  const isOverBudget = !checkResult.isSufficient;
  const isWarning = checkResult.status === 'warning';

  return (
    <div
      className={`rounded-2xl border p-4 transition-all text-xs ${
        isOverBudget
          ? 'border-red-300 bg-red-50/70 text-red-900'
          : isWarning
          ? 'border-amber-300 bg-amber-50/70 text-amber-900'
          : 'border-emerald-200 bg-emerald-50/50 text-emerald-950'
      }`}
    >
      {/* HEADER */}
      <div className="flex items-center justify-between pb-3 border-b border-black/5">
        <div className="flex items-center gap-2">
          <div
            className={`flex h-7 w-7 items-center justify-center rounded-lg ${
              isOverBudget
                ? 'bg-red-200/80 text-red-700'
                : isWarning
                ? 'bg-amber-200/80 text-amber-700'
                : 'bg-emerald-200/80 text-emerald-700'
            }`}
          >
            <Wallet size={15} />
          </div>
          <div>
            <span className="font-bold">Department Budget Utilization Check</span>
            <div className="flex items-center gap-1 text-[11px] opacity-75">
              <Building2 size={11} />
              <span>{checkResult.departmentName}</span>
            </div>
          </div>
        </div>

        {/* STATUS BADGE */}
        <div>
          {isOverBudget ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-red-600 px-2.5 py-0.5 text-[11px] font-extrabold text-white shadow-2xs">
              <XCircle size={12} />
              Over Budget
            </span>
          ) : isWarning ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-amber-500 px-2.5 py-0.5 text-[11px] font-extrabold text-white shadow-2xs">
              <AlertTriangle size={12} />
              Critical Balance (&lt;10%)
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-600 px-2.5 py-0.5 text-[11px] font-extrabold text-white shadow-2xs">
              <CheckCircle2 size={12} />
              Budget Sufficient
            </span>
          )}
        </div>
      </div>

      {/* METRICS ROW */}
      <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
        <div>
          <span className="text-[11px] opacity-70">Estimated Request</span>
          <p className="font-extrabold text-slate-900">{formatIDR(estimatedTotal)}</p>
        </div>

        <div>
          <span className="text-[11px] opacity-70">Current Available Budget</span>
          <p
            className={`font-extrabold ${
              checkResult.remainingBudget < 0 ? 'text-red-700' : 'text-slate-900'
            }`}
          >
            {formatIDR(checkResult.remainingBudget)}
          </p>
        </div>

        <div>
          <span className="text-[11px] opacity-70">Projected Utilization</span>
          <p className="font-extrabold text-slate-900">
            {checkResult.projectedUtilizationRate}%
          </p>
        </div>
      </div>

      {/* MESSAGE CALLOUT */}
      <div className="mt-3 rounded-xl bg-white/70 p-2.5 text-[11px] font-medium border border-black/5">
        <p>{checkResult.message}</p>
      </div>
    </div>
  );
}

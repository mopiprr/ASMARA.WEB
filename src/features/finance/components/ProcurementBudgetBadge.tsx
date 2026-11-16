import { CheckCircle2, AlertTriangle, XCircle } from 'lucide-react';

interface ProcurementBudgetBadgeProps {
  isOverBudget?: boolean;
  isWarning?: boolean;
  departmentName?: string;
  className?: string;
}

export default function ProcurementBudgetBadge({
  isOverBudget = false,
  isWarning = false,
  departmentName,
  className = '',
}: ProcurementBudgetBadgeProps) {
  if (isOverBudget) {
    return (
      <span
        className={`inline-flex items-center gap-1 rounded-full bg-red-50 px-2.5 py-0.5 text-[11px] font-bold text-red-700 border border-red-200 ${className}`}
        title={departmentName ? `Procurement for ${departmentName} exceeds budget allocation` : undefined}
      >
        <XCircle size={11} className="text-red-600" />
        <span>Over Budget</span>
      </span>
    );
  }

  if (isWarning) {
    return (
      <span
        className={`inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-0.5 text-[11px] font-bold text-amber-700 border border-amber-200 ${className}`}
        title={departmentName ? `Remaining budget for ${departmentName} is below 10%` : undefined}
      >
        <AlertTriangle size={11} className="text-amber-600" />
        <span>Critical Balance (&lt;10%)</span>
      </span>
    );
  }

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11px] font-bold text-emerald-700 border border-emerald-200 ${className}`}
      title={departmentName ? `Department budget for ${departmentName} is sufficient` : undefined}
    >
      <CheckCircle2 size={11} className="text-emerald-600" />
      <span>Budget Sufficient</span>
    </span>
  );
}

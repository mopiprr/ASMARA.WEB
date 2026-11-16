import { useState, useEffect } from 'react';
import { X, ArrowRightLeft, TrendingUp, TrendingDown, Loader2, AlertCircle } from 'lucide-react';
import type { DepartmentBudget, AdjustBudgetPayload } from '../types/finance.types';
import { formatIDR } from './BudgetOverviewCards';

interface BudgetAdjustmentModalProps {
  isOpen: boolean;
  selectedBudget: DepartmentBudget | null;
  departments: DepartmentBudget[];
  onClose: () => void;
  onSubmit: (payload: AdjustBudgetPayload) => Promise<void>;
}

export default function BudgetAdjustmentModal({
  isOpen,
  selectedBudget,
  departments,
  onClose,
  onSubmit,
}: BudgetAdjustmentModalProps) {
  const [sourceDeptId, setSourceDeptId] = useState<string>('');
  const [targetDeptId, setTargetDeptId] = useState<string>('');
  const [adjustmentType, setAdjustmentType] = useState<number>(4); // 4 = Increase, 5 = Decrease, 7 = Transfer
  const [amount, setAmount] = useState<string>('');
  const [reason, setReason] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (selectedBudget) {
      setSourceDeptId(selectedBudget.departmentId);
    } else if (departments.length > 0) {
      setSourceDeptId(departments[0].departmentId);
    }
    setAmount('');
    setReason('');
    setError(null);
  }, [selectedBudget, departments, isOpen]);

  if (!isOpen) return null;

  const currentSourceDept = departments.find((d) => d.departmentId === sourceDeptId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const parsedAmount = Number(amount);
    if (!parsedAmount || parsedAmount <= 0) {
      setError('Please enter a valid adjustment amount greater than zero.');
      return;
    }

    if (!reason.trim()) {
      setError('A justification / reason is required for budget audit records.');
      return;
    }

    if (adjustmentType === 5) {
      // Decrease: cannot exceed remaining budget
      if (currentSourceDept && parsedAmount > currentSourceDept.remainingBudget) {
        setError(
          `Cannot decrease allocation by ${formatIDR(parsedAmount)} because available balance is only ${formatIDR(
            currentSourceDept.remainingBudget
          )}.`
        );
        return;
      }
    }

    if (adjustmentType === 7) {
      // Transfer: target required and different from source
      if (!targetDeptId) {
        setError('Please select a recipient department for this transfer.');
        return;
      }
      if (targetDeptId === sourceDeptId) {
        setError('Source and recipient departments cannot be the same.');
        return;
      }
      if (currentSourceDept && parsedAmount > currentSourceDept.remainingBudget) {
        setError(
          `Cannot transfer ${formatIDR(parsedAmount)} because source department only has ${formatIDR(
            currentSourceDept.remainingBudget
          )} available.`
        );
        return;
      }
    }

    setIsSubmitting(true);
    try {
      await onSubmit({
        departmentId: sourceDeptId,
        targetDepartmentId: adjustmentType === 7 ? targetDeptId : null,
        changeType: adjustmentType,
        amount: parsedAmount,
        reason: reason.trim(),
      });
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to adjust budget.';
      setError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-xs">
      <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        {/* HEADER */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Department Budget Allocation Adjustment
            </h3>
            <p className="text-xs text-slate-500">
              Adjust department allocation or transfer funds between departments.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-100 transition"
          >
            <X size={18} />
          </button>
        </div>

        {/* ERROR CALLOUT */}
        {error && (
          <div className="mt-4 flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50/80 p-3 text-xs text-red-800">
            <AlertCircle size={16} className="shrink-0 text-red-600 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          {/* ADJUSTMENT TYPE SELECTOR */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Adjustment Type
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setAdjustmentType(4)}
                className={`flex flex-col items-center justify-center gap-1 rounded-xl border p-3 text-xs font-bold transition ${
                  adjustmentType === 4
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <TrendingUp size={16} className="text-blue-600" />
                <span>Increase Allocation</span>
              </button>

              <button
                type="button"
                onClick={() => setAdjustmentType(5)}
                className={`flex flex-col items-center justify-center gap-1 rounded-xl border p-3 text-xs font-bold transition ${
                  adjustmentType === 5
                    ? 'border-red-500 bg-red-50 text-red-700'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <TrendingDown size={16} className="text-red-600" />
                <span>Decrease / Cut</span>
              </button>

              <button
                type="button"
                onClick={() => setAdjustmentType(7)}
                className={`flex flex-col items-center justify-center gap-1 rounded-xl border p-3 text-xs font-bold transition ${
                  adjustmentType === 7
                    ? 'border-purple-500 bg-purple-50 text-purple-700'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <ArrowRightLeft size={16} className="text-purple-600" />
                <span>Transfer Funds</span>
              </button>
            </div>
          </div>

          {/* SOURCE DEPARTMENT */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              {adjustmentType === 7 ? 'Source Department (Sender)' : 'Department'}
            </label>
            <select
              value={sourceDeptId}
              onChange={(e) => setSourceDeptId(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50/60 p-2.5 text-xs font-medium text-slate-800 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
            >
              {departments.map((d) => (
                <option key={d.departmentId} value={d.departmentId}>
                  {d.departmentName} ({d.departmentCode}) — Available: {formatIDR(d.remainingBudget)}
                </option>
              ))}
            </select>
          </div>

          {/* TARGET DEPARTMENT (ONLY FOR TRANSFER) */}
          {adjustmentType === 7 && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Recipient Department (Target)
              </label>
              <select
                value={targetDeptId}
                onChange={(e) => setTargetDeptId(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50/60 p-2.5 text-xs font-medium text-slate-800 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
              >
                <option value="">Select recipient department...</option>
                {departments
                  .filter((d) => d.departmentId !== sourceDeptId)
                  .map((d) => (
                    <option key={d.departmentId} value={d.departmentId}>
                      {d.departmentName} ({d.departmentCode})
                    </option>
                  ))}
              </select>
            </div>
          )}

          {/* AMOUNT INPUT */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Adjustment Amount (IDR)
            </label>
            <input
              type="number"
              min="1"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="e.g. 10000000"
              className="w-full rounded-xl border border-slate-200 bg-slate-50/60 p-2.5 text-xs font-medium text-slate-800 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
            />
            {amount && !isNaN(Number(amount)) && (
              <p className="mt-1 text-[11px] font-semibold text-slate-500">
                Formatted: {formatIDR(Number(amount))}
              </p>
            )}
          </div>

          {/* REASON / JUSTIFICATION */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Reason / Justification
            </label>
            <textarea
              rows={3}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Explain the reason for this budget adjustment for audit logs..."
              className="w-full rounded-xl border border-slate-200 bg-slate-50/60 p-2.5 text-xs font-medium text-slate-800 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
            />
          </div>

          {/* FOOTER ACTIONS */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-5 py-2.5 text-xs font-semibold text-white shadow-md shadow-blue-600/20 hover:bg-blue-700 transition disabled:opacity-50"
            >
              {isSubmitting && <Loader2 size={14} className="animate-spin" />}
              <span>Confirm & Save Log</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

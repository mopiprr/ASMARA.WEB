import { AlertCircle, CheckCircle, XCircle } from 'lucide-react';

import type { RequiredPart, SparePartOption } from '../../../types/maintenance.types';

import { InventoryPartComparisonTable } from '../parts/InventoryPartComparisonTable';

interface PartCheckSectionProps {
  requiredParts: RequiredPart[];
  spareParts: SparePartOption[];
  isLoading: boolean;
  error: string;
  onRetry: () => void;
  canConfirmAvailable: boolean;
  partAvailability: boolean | null;
  onChange: (value: boolean) => void;
  isProcessing: boolean;
}

// Inventory membandingkan kebutuhan part dengan stok gudang.
function PartCheckSection({
  requiredParts,
  spareParts,
  isLoading,
  error,
  onRetry,
  canConfirmAvailable,
  partAvailability,
  onChange,
  isProcessing,
}: PartCheckSectionProps) {
  const choiceClass = (active: boolean, activeClass: string) =>
    `rounded-xl border px-4 py-3 text-sm font-semibold transition ${
      active ? activeClass : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
    }`;

  return (
    <>
      <InventoryPartComparisonTable
        requiredParts={requiredParts}
        spareParts={spareParts}
        isLoading={isLoading}
        error={error || null}
        onRetry={onRetry}
      />

      {!isLoading && !canConfirmAvailable && (
        <div className="flex items-start gap-2.5 rounded-xl border border-amber-200 bg-amber-50/90 p-3 text-xs text-amber-900">
          <AlertCircle size={16} className="mt-0.5 shrink-0 text-amber-600" />
          <p className="leading-relaxed text-amber-800">
            <strong>Available</strong> cannot be selected because one or more requested parts are not registered in inventory or have insufficient stock. Select <strong>Not Available</strong> so the handler can purchase the parts.
          </p>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={() => onChange(true)}
          disabled={isProcessing || !canConfirmAvailable}
          className={`${choiceClass(partAvailability === true, 'border-emerald-500 bg-emerald-50 text-emerald-700')} disabled:cursor-not-allowed disabled:opacity-50`}
        >
          <CheckCircle size={17} className="mx-auto mb-1" />
          Available
        </button>

        <button
          type="button"
          onClick={() => onChange(false)}
          disabled={isProcessing}
          className={choiceClass(partAvailability === false, 'border-red-500 bg-red-50 text-red-700')}
        >
          <XCircle size={17} className="mx-auto mb-1" />
          Not Available
        </button>
      </div>
    </>
  );
}

export default PartCheckSection;
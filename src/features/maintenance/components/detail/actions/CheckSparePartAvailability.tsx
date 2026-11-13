import {
  AlertCircle,
  CheckCircle,
  ClipboardCheck,
  LoaderCircle,
  XCircle,
} from 'lucide-react';

import type { SparePartItem } from '../../../../inventory/types/inventory.types';
import type { RequiredPart } from '../../../utils/maintenance-detail.utils';
import { InventoryPartComparisonTable } from '../../InventoryPartComparisonTable';

interface CheckSparePartAvailabilityProps {
  requiredParts: RequiredPart[];
  spareParts: SparePartItem[];
  isLoadingSpareParts: boolean;
  sparePartsError: string | null;
  onRetrySpareParts: () => void;
  canConfirmAvailable: boolean;
  partAvailability: boolean | null;
  isProcessing: boolean;
  onSetPartAvailability: (value: boolean) => void;
  onCheckPart: () => void;
}

function CheckSparePartAvailability({
  requiredParts,
  spareParts,
  isLoadingSpareParts,
  sparePartsError,
  onRetrySpareParts,
  canConfirmAvailable,
  partAvailability,
  isProcessing,
  onSetPartAvailability,
  onCheckPart,
}: CheckSparePartAvailabilityProps) {
  return (
    <div className="space-y-3 rounded-xl border border-amber-200 bg-amber-50/50 p-4">
      <div>
        <h4 className="text-sm font-semibold text-slate-800">
          Spare Part Availability Check
        </h4>
        <p className="mt-1 text-xs text-slate-500">
          Check the requested spare parts in Inventory before recording the
          availability decision.
        </p>
      </div>

      <InventoryPartComparisonTable
        requiredParts={requiredParts}
        spareParts={spareParts}
        isLoading={isLoadingSpareParts}
        error={sparePartsError}
        onRetry={onRetrySpareParts}
      />

      {!canConfirmAvailable && (
        <div className="flex items-start gap-2.5 rounded-xl border border-amber-200 bg-amber-50/90 p-3 text-xs text-amber-900">
          <AlertCircle
            size={16}
            className="mt-0.5 shrink-0 text-amber-600"
          />
          <div className="leading-relaxed">
            <p className="font-semibold text-amber-900">
              Available Option Locked
            </p>
            <p className="mt-0.5 text-amber-800">
              You cannot mark parts as <strong>Available</strong>{' '}
              because one or more requested items are not registered
              in warehouse inventory or have insufficient stock.
              You must select <strong>Not Available</strong> to proceed
              to spare part procurement.
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={() => {
            if (canConfirmAvailable) {
              onSetPartAvailability(true);
            }
          }}
          disabled={isProcessing || !canConfirmAvailable}
          title={
            !canConfirmAvailable
              ? 'Cannot select Available: items are missing from inventory or out of stock'
              : undefined
          }
          className={`rounded-xl border px-4 py-3 text-sm font-semibold transition ${
            !canConfirmAvailable
              ? 'cursor-not-allowed border-slate-200 bg-slate-100 text-slate-400 opacity-60'
              : partAvailability === true
                ? 'border-green-500 bg-green-100 text-green-700'
                : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
          }`}
        >
          <CheckCircle size={17} className="mx-auto mb-1" />
          Available
        </button>

        <button
          type="button"
          onClick={() => onSetPartAvailability(false)}
          disabled={isProcessing}
          className={`rounded-xl border px-4 py-3 text-sm font-semibold transition ${
            partAvailability === false
              ? 'border-red-500 bg-red-100 text-red-700'
              : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
          }`}
        >
          <XCircle size={17} className="mx-auto mb-1" />
          Not Available
        </button>
      </div>

      <div className="flex justify-end">
        <button
          type="button"
          onClick={onCheckPart}
          disabled={
            isProcessing ||
            partAvailability === null ||
            (partAvailability === true && !canConfirmAvailable)
          }
          className="inline-flex items-center gap-2 rounded-xl bg-amber-600 px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
        >
          {isProcessing ? (
            <LoaderCircle size={17} className="animate-spin" />
          ) : (
            <ClipboardCheck size={17} />
          )}
          Submit Availability
        </button>
      </div>
    </div>
  );
}

export default CheckSparePartAvailability;

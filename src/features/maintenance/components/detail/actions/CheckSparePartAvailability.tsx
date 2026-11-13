
import {
  CheckCircle,
  ClipboardCheck,
  LoaderCircle,
  XCircle,
} from 'lucide-react';

interface CheckSparePartAvailabilityProps {
  partAvailability: boolean | null;
  isProcessing: boolean;
  onSetPartAvailability: (value: boolean) => void;
  onCheckPart: () => void;
}

function CheckSparePartAvailability({
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

      <div className="grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={() => onSetPartAvailability(true)}
          disabled={isProcessing}
          className={`rounded-xl border px-4 py-3 text-sm font-semibold ${
            partAvailability === true
              ? 'border-green-500 bg-green-100 text-green-700'
              : 'border-slate-200 bg-white text-slate-600'
          }`}
        >
          <CheckCircle size={17} className="mx-auto mb-1" />
          Available
        </button>

        <button
          type="button"
          onClick={() => onSetPartAvailability(false)}
          disabled={isProcessing}
          className={`rounded-xl border px-4 py-3 text-sm font-semibold ${
            partAvailability === false
              ? 'border-red-500 bg-red-100 text-red-700'
              : 'border-slate-200 bg-white text-slate-600'
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
          disabled={isProcessing || partAvailability === null}
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

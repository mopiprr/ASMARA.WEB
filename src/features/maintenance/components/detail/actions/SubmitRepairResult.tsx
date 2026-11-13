
import { CheckCircle, LoaderCircle, Plus, Trash2 } from 'lucide-react';

import type { RepairResult } from '../../../types/maintenance.types';
import type { RequiredPart } from '../../../utils/maintenance-detail.utils';

interface SubmitRepairResultProps {
  repairResult: RepairResult | '';
  setRepairResult: (value: RepairResult | '') => void;
  repairParts: RequiredPart[];
  isProcessing: boolean;
  canSubmitRepair: boolean;
  onAddRepairPart: () => void;
  onRemoveRepairPart: (index: number) => void;
  onUpdateRepairPart: (
    index: number,
    field: keyof RequiredPart,
    value: string,
  ) => void;
  onSubmitRepairResult: () => void;
}

function SubmitRepairResult({
  repairResult,
  setRepairResult,
  repairParts,
  isProcessing,
  canSubmitRepair,
  onAddRepairPart,
  onRemoveRepairPart,
  onUpdateRepairPart,
  onSubmitRepairResult,
}: SubmitRepairResultProps) {
  return (
    <div className="space-y-4 rounded-xl border border-blue-200 bg-blue-50/50 p-4">
      <div>
        <h4 className="text-sm font-semibold text-slate-800">
          Submit Repair Result
        </h4>
        <p className="mt-1 text-xs text-slate-500">
          Select the result of the maintenance inspection or repair.
        </p>
      </div>

      <div>
        <label
          htmlFor="repairResult"
          className="mb-2 block text-sm font-medium text-slate-700"
        >
          Repair Decision
        </label>

        <select
          id="repairResult"
          value={repairResult}
          onChange={(event) => {
            const value = event.target.value;
            setRepairResult(value ? (Number(value) as RepairResult) : '');
          }}
          disabled={isProcessing}
          className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-blue-500 disabled:bg-slate-100"
        >
          <option value="">Select repair result</option>
          <option value={1}>Repaired</option>
          <option value={2}>Unrepairable</option>
          <option value={3}>Need Part</option>
        </select>
      </div>

      {repairResult === 3 && (
        <div className="space-y-3 rounded-xl border border-slate-200 bg-white p-4">
          <div className="flex items-center justify-between gap-2">
            <div>
              <h5 className="text-sm font-semibold text-slate-800">
                Required Spare Parts
              </h5>
              <p className="mt-1 text-xs text-slate-500">
                Enter the spare part name and specifications.
              </p>
            </div>

            <button
              type="button"
              onClick={onAddRepairPart}
              disabled={isProcessing}
              className="inline-flex items-center gap-1 rounded-lg bg-blue-600 px-3 py-2 text-xs font-semibold text-white disabled:opacity-50"
            >
              <Plus size={14} />
              Add Part
            </button>
          </div>

          {repairParts.map((part, index) => (
            <div
              key={index}
              className="space-y-3 rounded-lg border border-slate-200 p-3"
            >
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold text-slate-600">
                  Spare Part #{index + 1}
                </p>

                {repairParts.length > 1 && (
                  <button
                    type="button"
                    onClick={() => onRemoveRepairPart(index)}
                    disabled={isProcessing}
                    className="inline-flex items-center gap-1 text-xs font-medium text-red-600"
                  >
                    <Trash2 size={13} />
                    Remove
                  </button>
                )}
              </div>

              <div>
                <label
                  htmlFor={`partName-${index}`}
                  className="mb-1 block text-xs font-medium text-slate-600"
                >
                  Part Name
                </label>

                <input
                  id={`partName-${index}`}
                  type="text"
                  value={part.itemName}
                  onChange={(event) =>
                    onUpdateRepairPart(index, 'itemName', event.target.value)
                  }
                  placeholder="Example: RAM DDR4"
                  disabled={isProcessing}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label
                  htmlFor={`partNote-${index}`}
                  className="mb-1 block text-xs font-medium text-slate-600"
                >
                  Part Note
                </label>

                <textarea
                  id={`partNote-${index}`}
                  value={part.note}
                  onChange={(event) =>
                    onUpdateRepairPart(index, 'note', event.target.value)
                  }
                  rows={2}
                  placeholder="Enter spare part specifications or additional notes..."
                  disabled={isProcessing}
                  className="w-full resize-none rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-500"
                />
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="flex justify-end">
        <button
          type="button"
          onClick={onSubmitRepairResult}
          disabled={isProcessing || !canSubmitRepair}
          className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
        >
          {isProcessing ? (
            <LoaderCircle size={17} className="animate-spin" />
          ) : (
            <CheckCircle size={17} />
          )}
          Submit Repair Result
        </button>
      </div>
    </div>
  );
}

export default SubmitRepairResult;

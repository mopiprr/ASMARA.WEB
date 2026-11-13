import { CheckCircle, LoaderCircle } from 'lucide-react';

import type {
  InventoryCategory,
  SparePartItem,
} from '../../../../inventory/types/inventory.types';
import type {
  RepairPartFormItem,
  RepairResult,
} from '../../../types/maintenance.types';
import { MaintenanceRepairPartsForm } from '../../MaintenanceRepairPartsForm';

interface SubmitRepairResultProps {
  repairResult: RepairResult | '';
  setRepairResult: (value: RepairResult | '') => void;
  repairParts: RepairPartFormItem[];
  spareParts: SparePartItem[];
  categories: InventoryCategory[];
  isLoadingSpareParts: boolean;
  sparePartsError: string | null;
  onRetrySpareParts: () => void;
  isProcessing: boolean;
  canSubmitRepair: boolean;
  onAddRepairPart: () => void;
  onRemoveRepairPart: (index: number) => void;
  onToggleCustomPart: (index: number) => void;
  onSelectInventoryPart: (index: number, selectedIdStr: string) => void;
  onUpdateRepairPartField: <K extends keyof RepairPartFormItem>(
    index: number,
    field: K,
    value: RepairPartFormItem[K],
  ) => void;
  onSubmitRepairResult: () => void;
}

function SubmitRepairResult({
  repairResult,
  setRepairResult,
  repairParts,
  spareParts,
  categories,
  isLoadingSpareParts,
  sparePartsError,
  onRetrySpareParts,
  isProcessing,
  canSubmitRepair,
  onAddRepairPart,
  onRemoveRepairPart,
  onToggleCustomPart,
  onSelectInventoryPart,
  onUpdateRepairPartField,
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
        <MaintenanceRepairPartsForm
          parts={repairParts}
          spareParts={spareParts}
          categories={categories}
          isLoadingOptions={isLoadingSpareParts}
          optionsError={sparePartsError}
          isProcessing={isProcessing}
          onAddPart={onAddRepairPart}
          onRemovePart={onRemoveRepairPart}
          onToggleCustom={onToggleCustomPart}
          onSelectInventoryPart={onSelectInventoryPart}
          onUpdateField={onUpdateRepairPartField}
          onRetry={onRetrySpareParts}
        />
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
          Submit Result
        </button>
      </div>
    </div>
  );
}

export default SubmitRepairResult;

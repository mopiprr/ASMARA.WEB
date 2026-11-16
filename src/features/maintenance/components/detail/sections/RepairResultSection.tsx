import type {
  RepairPartFormItem,
  RepairResult,
  SparePartCategoryOption,
  SparePartOption,
} from '../../../types/maintenance.types';

import { detailInputClass } from '../../../../../components/common/NoteField';

import { MaintenanceRepairPartsForm } from '../parts/RepairPartsForm';

interface RepairResultSectionProps {
  repairResult: RepairResult | '';
  onResultChange: (value: RepairResult | '') => void;

  parts: RepairPartFormItem[];
  spareParts: SparePartOption[];
  categories: SparePartCategoryOption[];
  isLoadingOptions: boolean;
  optionsError: string;
  onRetryOptions: () => void;

  isProcessing: boolean;

  onAddPart: () => void;
  onRemovePart: (index: number) => void;
  onToggleCustom: (index: number) => void;
  onSelectInventoryPart: (index: number, selectedIdStr: string) => void;
  onUpdateField: <K extends keyof RepairPartFormItem>(
    index: number,
    field: K,
    value: RepairPartFormItem[K],
  ) => void;
}

// Handler memilih hasil perbaikan; Need Part -> isi daftar spare part.
function RepairResultSection({
  repairResult,
  onResultChange,
  parts,
  spareParts,
  categories,
  isLoadingOptions,
  optionsError,
  onRetryOptions,
  isProcessing,
  onAddPart,
  onRemovePart,
  onToggleCustom,
  onSelectInventoryPart,
  onUpdateField,
}: RepairResultSectionProps) {
  return (
    <>
      <div>
        <label htmlFor="repair-result" className="mb-2 block text-sm font-medium text-slate-700">
          Repair Result <span className="text-red-500">*</span>
        </label>

        <select
          id="repair-result"
          value={repairResult}
          onChange={(event) => {
            const value = event.target.value;
            onResultChange(value ? (Number(value) as RepairResult) : '');
          }}
          disabled={isProcessing}
          className={`${detailInputClass} bg-white`}
        >
          <option value="">Select repair result</option>
          <option value={1}>Repaired</option>
          <option value={2}>Unrepairable</option>
          <option value={3}>Need Part</option>
        </select>
      </div>

      {repairResult === 3 && (
        <MaintenanceRepairPartsForm
          parts={parts}
          spareParts={spareParts}
          categories={categories}
          isLoadingOptions={isLoadingOptions}
          optionsError={optionsError || null}
          isProcessing={isProcessing}
          onAddPart={onAddPart}
          onRemovePart={onRemovePart}
          onToggleCustom={onToggleCustom}
          onSelectInventoryPart={onSelectInventoryPart}
          onUpdateField={onUpdateField}
          onRetry={onRetryOptions}
        />
      )}
    </>
  );
}

export default RepairResultSection;
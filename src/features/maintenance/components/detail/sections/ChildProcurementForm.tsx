import { Plus } from 'lucide-react';

import type { ProcurementItem } from '../../../../../types/ticket.types';
import type { useInventoryOptions } from '../../../../../hooks/useInventoryOptions';

import ProcurementItemForm from '../../../../../components/common/ProcurementItemForm';
import { detailInputClass } from '../../../../../components/common/NoteField';
import { formatIDR } from '../../../utils/maintenance.utils';
import { getFormItemsTotal } from '../../../../../utils/itemForm.utils';

type InventoryOptions = ReturnType<typeof useInventoryOptions>;

interface ChildItemsHandlers {
  items: ProcurementItem[];
  add: () => void;
  remove: (index: number) => void;
  changeCategory: (index: number, categoryId: string) => void;
  changeItem: (index: number, itemId: string, itemName: string) => void;
  toggleManual: (index: number) => void;
  changeField: (index: number, field: keyof ProcurementItem, value: string) => void;
}

interface ChildProcurementFormProps {
  ticketNumber: string;
  subject: string;
  onSubjectChange: (value: string) => void;
  description: string;
  onDescriptionChange: (value: string) => void;

  list: ChildItemsHandlers;
  inventory: InventoryOptions;

  // Pengganti asset: jumlah selalu 1.
  quantityLocked?: boolean;
  isProcessing: boolean;
}

const SUBJECT_MAX = 50;
const DESCRIPTION_MAX = 500;

// Form tiket Procurement child (beli part / beli pengganti). Kartu item sama dengan create Procurement.
function ChildProcurementForm({
  ticketNumber,
  subject,
  onSubjectChange,
  description,
  onDescriptionChange,
  list,
  inventory,
  quantityLocked = false,
  isProcessing,
}: ChildProcurementFormProps) {
  const handleCategoryChange = (index: number, categoryId: string) => {
    list.changeCategory(index, categoryId);

    if (categoryId) {
      void inventory.fetchInventoryItems(categoryId);
    }
  };

  const total = quantityLocked
    ? list.items.reduce((sum, item) => sum + (Number(item.estimatedPrice) || 0), 0)
    : getFormItemsTotal(list.items);

  return (
    <div className="space-y-4">
      <div>
        <label htmlFor="child-subject" className="mb-2 block text-sm font-medium text-slate-700">
          Procurement Subject <span className="text-red-500">*</span>
        </label>

        <input
          id="child-subject"
          type="text"
          value={subject}
          onChange={(event) => onSubjectChange(event.target.value)}
          maxLength={SUBJECT_MAX}
          placeholder={`Procurement for ${ticketNumber}`}
          disabled={isProcessing}
          className={detailInputClass}
        />

        <p className="mt-1 text-right text-xs text-slate-400">
          {subject.length}/{SUBJECT_MAX}
        </p>
      </div>

      <div>
        <label htmlFor="child-description" className="mb-2 block text-sm font-medium text-slate-700">
          Description
        </label>

        <textarea
          id="child-description"
          value={description}
          onChange={(event) => onDescriptionChange(event.target.value)}
          maxLength={DESCRIPTION_MAX}
          rows={2}
          placeholder={`Procurement for maintenance ticket ${ticketNumber}.`}
          disabled={isProcessing}
          className={detailInputClass}
        />

        <p className="mt-1 text-right text-xs text-slate-400">
          {description.length}/{DESCRIPTION_MAX}
        </p>
      </div>

      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-slate-700">
          Items ({list.items.length})
        </p>

        <button
          type="button"
          onClick={list.add}
          disabled={isProcessing}
          className="inline-flex items-center gap-2 rounded-lg bg-blue-50 px-3 py-2 text-xs font-semibold text-blue-600 transition hover:bg-blue-100"
        >
          <Plus size={14} />
          Add Item
        </button>
      </div>

      {inventory.categoryError && (
        <p className="whitespace-pre-line text-xs text-red-500">{inventory.categoryError}</p>
      )}

      {list.items.map((item, index) => (
        <ProcurementItemForm
          key={index}
          index={index}
          item={quantityLocked ? { ...item, quantity: '1' } : item}
          categories={inventory.categories}
          categoryItems={inventory.inventoryItemsByCategory}
          isLoadingItems={inventory.loadingItems}
          itemErrors={inventory.itemErrors}
          canRemove={list.items.length > 1}
          quantityLocked={quantityLocked}
          disabled={isProcessing}
          onCategoryChange={handleCategoryChange}
          onItemChange={list.changeItem}
          onToggleManualItem={list.toggleManual}
          onFieldChange={list.changeField}
          onRemove={list.remove}
        />
      ))}

      <div className="flex items-center justify-between rounded-xl bg-slate-50 px-5 py-4">
        <p className="text-sm font-medium text-slate-500">
          Total Estimated Value
        </p>

        <p className="text-lg font-bold text-slate-800">
          {formatIDR(total)}
        </p>
      </div>
    </div>
  );
}

export default ChildProcurementForm;
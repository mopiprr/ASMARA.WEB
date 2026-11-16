
import {
  LoaderCircle,
  Plus,
} from 'lucide-react';

import ProcurementItemForm from '../../../../../components/common/ProcurementItemForm';

import type {
  MaintenanceProcurementItemPayload,
} from '../../../types/maintenance.types';

import {
  type RequiredPart,
  formatIDR,
  toSharedProcurementItem,
} from '../../../utils/maintenance-detail.utils';

import type {
  useInventoryOptions,
} from '../../../../procurement/hooks/useInventoryOptions';

type InventoryOptions = ReturnType<typeof useInventoryOptions>;

interface CreateSparePartProcurementProps {
  ticketNumber: string;
  requiredParts: RequiredPart[];

  orderPartSubject: string;
  setOrderPartSubject: (value: string) => void;
  orderPartDescription: string;
  setOrderPartDescription: (value: string) => void;

  orderPartItems: MaintenanceProcurementItemPayload[];
  orderPartManualItems: boolean[];

  categories: InventoryOptions['categories'];
  isLoadingCategories: boolean;
  categoryError: string;
  inventoryItemsByCategory: InventoryOptions['inventoryItemsByCategory'];
  loadingItems: InventoryOptions['loadingItems'];
  itemErrors: InventoryOptions['itemErrors'];

  isProcessing: boolean;
  canSubmitOrderPart: boolean;
  totalOrderPartPrice: number;

  onCategoryChange: (index: number, categoryId: string) => void;
  onItemChange: (index: number, itemId: string) => void;
  onToggleManualItem: (index: number) => void;
  onManualNameChange: (index: number, itemName: string) => void;
  onFieldChange: (
    index: number,
    field: 'quantity' | 'price',
    value: number,
  ) => void;
  onAddItem: () => void;
  onRemoveItem: (index: number) => void;
  onSubmit: () => void;
}

function CreateSparePartProcurement({
  ticketNumber,
  requiredParts,
  orderPartSubject,
  setOrderPartSubject,
  orderPartDescription,
  setOrderPartDescription,
  orderPartItems,
  orderPartManualItems,
  categories,
  isLoadingCategories,
  categoryError,
  inventoryItemsByCategory,
  loadingItems,
  itemErrors,
  isProcessing,
  canSubmitOrderPart,
  totalOrderPartPrice,
  onCategoryChange,
  onItemChange,
  onToggleManualItem,
  onManualNameChange,
  onFieldChange,
  onAddItem,
  onRemoveItem,
  onSubmit,
}: CreateSparePartProcurementProps) {
  return (
    <div className="space-y-4 rounded-xl border border-orange-200 bg-orange-50/50 p-4">
      <div>
        <h4 className="text-sm font-semibold text-slate-800">
          Create Spare Part Procurement
        </h4>
        <p className="mt-1 text-xs text-slate-500">
          Create a standard Procurement request for the spare parts required
          by this maintenance ticket.
        </p>
      </div>

      {requiredParts.length > 0 && (
        <div className="rounded-lg border border-orange-100 bg-white p-3">
          <p className="mb-2 text-xs font-semibold text-slate-600">
            Handler Spare Part Requirements
          </p>

          <div className="space-y-2">
            {requiredParts.map((part, index) => (
              <div
                key={`${part.itemName}-${index}`}
                className="flex items-center justify-between text-sm"
              >
                <div>
                  <span className="font-medium text-slate-800">
                    {index + 1}. {part.itemName}
                  </span>
                  {part.note && (
                    <p className="mt-1 whitespace-pre-wrap text-xs text-slate-500">
                      {part.note}
                    </p>
                  )}
                </div>
                {part.quantity && (
                  <span className="rounded-md bg-orange-100 px-2 py-0.5 text-xs font-semibold text-orange-800">
                    Qty: {part.quantity}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <div>
        <label
          htmlFor="orderPartSubject"
          className="mb-1 block text-xs font-medium text-slate-600"
        >
          Subject
        </label>

        <input
          id="orderPartSubject"
          type="text"
          value={orderPartSubject}
          onChange={(event) => setOrderPartSubject(event.target.value)}
          placeholder={`Spare Part Procurement - ${ticketNumber}`}
          disabled={isProcessing}
          className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-orange-500"
        />
      </div>

      <div>
        <label
          htmlFor="orderPartDescription"
          className="mb-1 block text-xs font-medium text-slate-600"
        >
          Description
        </label>

        <textarea
          id="orderPartDescription"
          value={orderPartDescription}
          onChange={(event) => setOrderPartDescription(event.target.value)}
          rows={2}
          placeholder={`Procurement for maintenance ticket ${ticketNumber}.`}
          disabled={isProcessing}
          className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-orange-500"
        />
      </div>

      {orderPartItems.map((item, index) => (
        <ProcurementItemForm
          key={index}
          index={index}
          item={toSharedProcurementItem(
            item,
            orderPartManualItems[index] ?? false,
          )}
          categories={categories}
          categoryItems={inventoryItemsByCategory}
          isLoadingCategories={isLoadingCategories}
          categoryError={categoryError}
          isLoadingItems={loadingItems}
          itemErrors={itemErrors}
          canRemove={orderPartItems.length > 1}
          disabled={isProcessing}
          itemLabel="Procurement Item"
          subtitle="Spare part procurement item"
          onCategoryChange={onCategoryChange}
          onItemChange={(itemIndex, itemId) => onItemChange(itemIndex, itemId)}
          onToggleManualItem={onToggleManualItem}
          onFieldChange={(itemIndex, field, value) => {
            if (field === 'itemName') {
              onManualNameChange(itemIndex, value);
            } else if (field === 'quantity') {
              onFieldChange(
                itemIndex,
                'quantity',
                value === '' ? 0 : Math.max(0, Number(value)),
              );
            } else if (field === 'estimatedPrice') {
              onFieldChange(
                itemIndex,
                'price',
                value === '' ? 0 : Math.max(0, Number(value)),
              );
            }
          }}
          onRemove={onRemoveItem}
        />
      ))}

      <button
        type="button"
        onClick={onAddItem}
        disabled={isProcessing}
        className="inline-flex items-center gap-1 text-xs font-semibold text-orange-600"
      >
        <Plus size={14} />
        Add Procurement Item
      </button>

      <div className="flex items-center justify-between border-t border-orange-200 pt-3">
        <span className="text-sm font-semibold text-slate-700">
          Total Estimated Price
        </span>
        <span className="text-base font-bold text-orange-700">
          {formatIDR(totalOrderPartPrice)}
        </span>
      </div>

      <div className="flex justify-end">
        <button
          type="button"
          onClick={onSubmit}
          disabled={isProcessing || !canSubmitOrderPart}
          className="inline-flex items-center gap-2 rounded-xl bg-orange-600 px-5 py-2.5 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isProcessing ? (
            <LoaderCircle size={17} className="animate-spin" />
          ) : (
            <Plus size={17} />
          )}
          Create Procurement Request
        </button>
      </div>
    </div>
  );
}

export default CreateSparePartProcurement;

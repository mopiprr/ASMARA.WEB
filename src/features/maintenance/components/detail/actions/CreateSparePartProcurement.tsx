
import {
  LoaderCircle,
  Plus,
  Trash2,
} from 'lucide-react';

import type {
  MaintenanceProcurementItemPayload,
} from '../../../types/maintenance.types';

import type {
  RequiredPart,
} from '../../../utils/maintenance-detail.utils';

import { formatIDR } from '../../../utils/maintenance-detail.utils';

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
              <div key={`${part.itemName}-${index}`}>
                <p className="text-sm font-medium text-slate-800">
                  {index + 1}. {part.itemName}
                </p>
                {part.note && (
                  <p className="mt-1 whitespace-pre-wrap text-xs text-slate-500">
                    {part.note}
                  </p>
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

      {orderPartItems.map((item, index) => {
        const categoryId = String(item.itemCategoryId || '');
        const availableItems = inventoryItemsByCategory[categoryId] ?? [];
        const isLoadingItems = loadingItems[categoryId] ?? false;
        const itemError = itemErrors[categoryId] ?? '';
        const isManual = orderPartManualItems[index] ?? false;

        return (
          <div
            key={index}
            className="space-y-3 rounded-lg border border-slate-200 bg-white p-3"
          >
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold text-slate-600">
                Procurement Item #{index + 1}
              </p>

              {orderPartItems.length > 1 && (
                <button
                  type="button"
                  onClick={() => onRemoveItem(index)}
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
                htmlFor={`orderPartCategory-${index}`}
                className="mb-1 block text-xs font-medium text-slate-600"
              >
                Category
              </label>

              <select
                id={`orderPartCategory-${index}`}
                value={categoryId}
                onChange={(event) =>
                  onCategoryChange(index, event.target.value)
                }
                disabled={isProcessing || isLoadingCategories}
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-orange-500"
              >
                <option value="">
                  {isLoadingCategories
                    ? 'Loading categories...'
                    : 'Select category'}
                </option>

                {categories.map((category) => (
                  <option
                    key={category.id}
                    value={String(category.id)}
                  >
                    {category.categoryName}
                  </option>
                ))}
              </select>

              {categoryError && (
                <p className="mt-1 text-xs text-red-600">
                  {categoryError}
                </p>
              )}
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => onToggleManualItem(index)}
                disabled={isProcessing || !item.itemCategoryId}
                className="text-xs font-semibold text-orange-600 disabled:opacity-50"
              >
                {isManual
                  ? 'Switch to Inventory Item'
                  : 'Enter Item Manually'}
              </button>
            </div>

            <div>
              <label
                htmlFor={`orderPartItem-${index}`}
                className="mb-1 block text-xs font-medium text-slate-600"
              >
                Item
              </label>

              {isManual ? (
                <input
                  id={`orderPartItem-${index}`}
                  type="text"
                  value={item.itemName}
                  onChange={(event) =>
                    onManualNameChange(index, event.target.value)
                  }
                  placeholder="Enter item name manually"
                  disabled={isProcessing || !item.itemCategoryId}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-orange-500"
                />
              ) : (
                <select
                  id={`orderPartItem-${index}`}
                  value={item.itemId ? String(item.itemId) : ''}
                  onChange={(event) =>
                    onItemChange(index, event.target.value)
                  }
                  disabled={
                    isProcessing ||
                    !item.itemCategoryId ||
                    isLoadingItems
                  }
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-orange-500"
                >
                  <option value="">
                    {!item.itemCategoryId
                      ? 'Select category first'
                      : isLoadingItems
                        ? 'Loading items...'
                        : availableItems.length === 0
                          ? 'No items available'
                          : 'Select inventory item'}
                  </option>

                  {availableItems.map((inventoryItem) => (
                    <option
                      key={inventoryItem.id}
                      value={String(inventoryItem.id)}
                    >
                      {inventoryItem.itemName}
                    </option>
                  ))}
                </select>
              )}

              {itemError && (
                <p className="mt-1 text-xs text-red-600">
                  {itemError}
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label
                  htmlFor={`orderPartQuantity-${index}`}
                  className="mb-1 block text-xs font-medium text-slate-600"
                >
                  Quantity
                </label>

                <input
                  id={`orderPartQuantity-${index}`}
                  type="number"
                  min="1"
                  step="1"
                  value={item.quantity}
                  onChange={(event) =>
                    onFieldChange(
                      index,
                      'quantity',
                      event.target.value === ''
                        ? 0
                        : Math.max(0, Number(event.target.value)),
                    )
                  }
                  disabled={isProcessing}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-orange-500"
                />
              </div>

              <div>
                <label
                  htmlFor={`orderPartPrice-${index}`}
                  className="mb-1 block text-xs font-medium text-slate-600"
                >
                  Estimated Price
                </label>

                <input
                  id={`orderPartPrice-${index}`}
                  type="number"
                  min="0"
                  step="1"
                  value={item.price}
                  onChange={(event) =>
                    onFieldChange(
                      index,
                      'price',
                      event.target.value === ''
                        ? 0
                        : Math.max(0, Number(event.target.value)),
                    )
                  }
                  disabled={isProcessing}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-orange-500"
                />
              </div>
            </div>

            <div className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2">
              <span className="text-xs text-slate-500">
                Estimated Subtotal
              </span>
              <span className="text-sm font-semibold text-slate-800">
                {formatIDR(item.quantity * item.price)}
              </span>
            </div>
          </div>
        );
      })}

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

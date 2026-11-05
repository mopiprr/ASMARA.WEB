
import {
  Package,
  Trash2,
  Tag,
  Hash,
  Banknote,
  LoaderCircle,
  PenLine,
} from 'lucide-react';

import type {
  CategoryOption,
  CategoryItemsState,
  ErrorState,
  ItemOption,
  LoadingState,
  ProcurementItem,
} from '../types/procurement.types';

import { formatIDR } from '../utils/procurement.utils';

// ==========================================
// PROPS
// ==========================================

interface ProcurementItemFormProps {
  index: number;
  item: ProcurementItem;

  categories: CategoryOption[];
  categoryItems: CategoryItemsState;

  isLoadingItems: LoadingState;
  itemErrors: ErrorState;

  canRemove: boolean;

  onCategoryChange: (index: number, categoryId: string) => void;
  onItemChange: (
    index: number,
    itemId: string,
    itemName: string
  ) => void;
  onToggleManualItem: (index: number) => void;
  onFieldChange: (
    index: number,
    field: keyof ProcurementItem,
    value: string
  ) => void;
  onRemove: (index: number) => void;
}

// ==========================================
// COMPONENT
// ==========================================

function ProcurementItemForm({
  index,
  item,
  categories,
  categoryItems,
  isLoadingItems,
  itemErrors,
  canRemove,
  onCategoryChange,
  onItemChange,
  onToggleManualItem,
  onFieldChange,
  onRemove,
}: ProcurementItemFormProps) {
  const availableItems: ItemOption[] =
    categoryItems[item.categoryId] ?? [];

  const isLoading = isLoadingItems[item.categoryId] ?? false;
  const itemError = itemErrors[item.categoryId] ?? '';

  const estimatedTotal =
    (Number(item.quantity) || 0) *
    (Number(item.estimatedPrice) || 0);

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5">

      {/* ITEM HEADER */}
      <div className="mb-5 flex items-center justify-between">

        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
            <Package size={18} />
          </div>

          <div>
            <h3 className="text-sm font-bold text-slate-800">
              Item #{index + 1}
            </h3>

            <p className="text-xs text-slate-400">
              Procurement item information
            </p>
          </div>
        </div>

        {canRemove && (
          <button
            type="button"
            onClick={() => onRemove(index)}
            className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold text-red-500 transition hover:bg-red-50"
          >
            <Trash2 size={15} />
            Remove
          </button>
        )}

      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">

        {/* CATEGORY */}
        <div>
          <label className="mb-2 block text-sm font-semibold text-slate-700">
            Item Category <span className="text-red-500">*</span>
          </label>

          <select
            value={item.categoryId}
            onChange={(event) =>
              onCategoryChange(index, event.target.value)
            }
            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          >
            <option value="">Select category</option>

            {categories.map((category) => (
              <option
                key={category.id}
                value={category.id}
              >
                {category.categoryName}
              </option>
            ))}
          </select>
        </div>

        {/* MANUAL ITEM TOGGLE */}
        <div className="flex items-end">
          <button
            type="button"
            onClick={() => onToggleManualItem(index)}
            className={`inline-flex w-full items-center justify-center gap-2 rounded-xl border px-4 py-3 text-sm font-semibold transition ${
              item.isManual
                ? 'border-amber-200 bg-amber-50 text-amber-700'
                : 'border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            <PenLine size={16} />

            {item.isManual
              ? 'Switch to Inventory Item'
              : 'Enter Item Manually'}
          </button>
        </div>

        {/* ITEM NAME */}
        <div className="md:col-span-2">
          <label className="mb-2 block text-sm font-semibold text-slate-700">
            Item Name <span className="text-red-500">*</span>
          </label>

          {item.isManual ? (
            <input
              type="text"
              value={item.itemName}
              onChange={(event) =>
                onFieldChange(
                  index,
                  'itemName',
                  event.target.value
                )
              }
              placeholder="Enter item name manually"
              className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          ) : (
            <div>
              <select
                value={item.itemId}
                onChange={(event) => {
                  const selectedItem = availableItems.find(
                    (option) =>
                      String(option.id) === event.target.value
                  );

                  if (selectedItem) {
                    onItemChange(
                      index,
                      String(selectedItem.id),
                      selectedItem.itemName
                    );
                  } else {
                    onItemChange(index, '', '');
                  }
                }}
                disabled={!item.categoryId || isLoading}
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-50"
              >
                <option value="">
                  {!item.categoryId
                    ? 'Select category first'
                    : isLoading
                      ? 'Loading inventory items...'
                      : 'Select inventory item'}
                </option>

                {availableItems.map((option) => (
                  <option
                    key={option.id}
                    value={option.id}
                  >
                    {option.itemName}
                  </option>
                ))}
              </select>

              {isLoading && (
                <p className="mt-2 flex items-center gap-2 text-xs text-blue-500">
                  <LoaderCircle
                    size={13}
                    className="animate-spin"
                  />
                  Loading inventory items...
                </p>
              )}

              {itemError && (
                <p className="mt-2 text-xs text-red-500">
                  {itemError}
                </p>
              )}

              {!isLoading &&
                !itemError &&
                item.categoryId &&
                availableItems.length === 0 && (
                  <p className="mt-2 text-xs text-slate-400">
                    No inventory items found in this category.
                    You can enter the item manually.
                  </p>
                )}
            </div>
          )}
        </div>

        {/* QUANTITY */}
        <div>
          <label className="mb-2 block text-sm font-semibold text-slate-700">
            Quantity <span className="text-red-500">*</span>
          </label>

          <div className="relative">
            <Hash
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              type="number"
              min="1"
              step="1"
              value={item.quantity}
              onChange={(event) =>
                onFieldChange(
                  index,
                  'quantity',
                  event.target.value
                )
              }
              placeholder="Enter quantity"
              className="w-full rounded-xl border border-slate-200 py-3 pl-10 pr-4 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>
        </div>

        {/* ESTIMATED PRICE */}
        <div>
          <label className="mb-2 block text-sm font-semibold text-slate-700">
            Estimated Price <span className="text-red-500">*</span>
          </label>

          <div className="relative">
            <Banknote
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              type="number"
              min="0"
              step="1"
              value={item.estimatedPrice}
              onChange={(event) =>
                onFieldChange(
                  index,
                  'estimatedPrice',
                  event.target.value
                )
              }
              placeholder="Enter estimated price"
              className="w-full rounded-xl border border-slate-200 py-3 pl-10 pr-4 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>
        </div>

      </div>

      {/* ESTIMATED TOTAL */}
      <div className="mt-5 flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3">
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <Tag size={15} />
          Estimated Subtotal
        </div>

        <p className="text-sm font-bold text-slate-800">
          {formatIDR(estimatedTotal)}
        </p>
      </div>

    </div>
  );
}

export default ProcurementItemForm;

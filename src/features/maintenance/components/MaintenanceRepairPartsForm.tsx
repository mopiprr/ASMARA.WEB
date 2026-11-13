import {
  AlertCircle,
  LoaderCircle,
  Package,
  PenLine,
  Plus,
  Trash2,
} from 'lucide-react';

import type {
  InventoryCategory,
  SparePartItem,
} from '../../inventory/types/inventory.types';
import type { RepairPartFormItem } from '../types/maintenance.types';

interface MaintenanceRepairPartsFormProps {
  parts: RepairPartFormItem[];
  spareParts: SparePartItem[];
  categories: InventoryCategory[];
  isLoadingOptions: boolean;
  optionsError: string | null;
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
  onRetry: () => void;
}

export function MaintenanceRepairPartsForm({
  parts,
  spareParts,
  categories,
  isLoadingOptions,
  optionsError,
  isProcessing,
  onAddPart,
  onRemovePart,
  onToggleCustom,
  onSelectInventoryPart,
  onUpdateField,
  onRetry,
}: MaintenanceRepairPartsFormProps) {
  return (
    <div className="space-y-4 rounded-xl border border-slate-200 bg-white p-4">
      {/* HEADER SECTION */}
      <div className="flex flex-col gap-2 border-b border-slate-100 pb-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h5 className="text-sm font-semibold text-slate-800">
            Required Spare Parts
          </h5>
          <p className="mt-0.5 text-xs text-slate-500">
            Select the required spare parts from the inventory catalog, or use custom input if not yet registered.
          </p>
        </div>

        <button
          type="button"
          onClick={onAddPart}
          disabled={isProcessing || isLoadingOptions}
          className="inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white shadow-xs transition hover:bg-blue-700 disabled:opacity-50"
        >
          <Plus size={14} />
          Add Part
        </button>
      </div>

      {/* LOADING OPTIONS */}
      {isLoadingOptions ? (
        <div className="flex items-center justify-center gap-2 py-8 text-xs text-slate-500">
          <LoaderCircle size={17} className="animate-spin text-blue-600" />
          <span>Loading spare parts inventory...</span>
        </div>
      ) : optionsError ? (
        /* ERROR LOADING OPTIONS */
        <div className="flex items-center justify-between rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-800">
          <div className="flex items-center gap-2">
            <AlertCircle size={16} className="shrink-0 text-rose-600" />
            <span>{optionsError}</span>
          </div>
          <button
            type="button"
            onClick={onRetry}
            className="font-bold underline hover:no-underline"
          >
            Try Again
          </button>
        </div>
      ) : (
        /* PARTS LIST */
        <div className="space-y-4">
          {parts.map((part, index) => {
            return (
              <div
                key={index}
                className="space-y-3.5 rounded-xl border border-slate-200 bg-slate-50/60 p-4 transition"
              >
                {/* ROW HEADER */}
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200/60 pb-2.5">
                  <div className="flex items-center gap-2">
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-100 text-[11px] font-bold text-blue-700">
                      {index + 1}
                    </span>
                    <p className="text-xs font-semibold text-slate-700">
                      {part.isCustom
                        ? 'Spare Part (Custom / Manual)'
                        : 'Spare Part (Inventory Catalog)'}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* TOGGLE CUSTOM / INVENTORY BUTTON */}
                    <button
                      type="button"
                      onClick={() => onToggleCustom(index)}
                      disabled={isProcessing}
                      className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs font-semibold transition ${
                        part.isCustom
                          ? 'border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100'
                          : 'border-amber-200 bg-amber-50 text-amber-800 hover:bg-amber-100'
                      }`}
                    >
                      {part.isCustom ? (
                        <>
                          <Package size={13} />
                          <span>Select from Inventory</span>
                        </>
                      ) : (
                        <>
                          <PenLine size={13} />
                          <span>Item not in list? Enter custom item</span>
                        </>
                      )}
                    </button>

                    {/* REMOVE BUTTON */}
                    {parts.length > 1 && (
                      <button
                        type="button"
                        onClick={() => onRemovePart(index)}
                        disabled={isProcessing}
                        className="inline-flex items-center gap-1 rounded-lg p-1 text-xs font-medium text-rose-600 transition hover:bg-rose-50"
                        title="Remove this part"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                </div>

                {/* MODE 1: SELECT FROM INVENTORY */}
                {!part.isCustom ? (
                  <div className="space-y-3">
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-4">
                      {/* SPARE PART DROPDOWN */}
                      <div className="sm:col-span-3">
                        <label className="mb-1 block text-xs font-medium text-slate-600">
                          Select Spare Part <span className="text-rose-500">*</span>
                        </label>
                        <select
                          value={part.itemId ?? ''}
                          onChange={(e) =>
                            onSelectInventoryPart(index, e.target.value)
                          }
                          disabled={isProcessing}
                          className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 outline-none transition focus:border-blue-500 disabled:bg-slate-100"
                        >
                          <option value="">-- Select Spare Part from Catalog --</option>
                          {spareParts.map((sp) => (
                            <option key={sp.id} value={sp.id}>
                              {sp.itemName} ({sp.itemCode}) — {sp.categoryName}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* QUANTITY INPUT */}
                      <div className="sm:col-span-1">
                        <label className="mb-1 block text-xs font-medium text-slate-600">
                          Requested Qty <span className="text-rose-500">*</span>
                        </label>
                        <input
                          type="number"
                          min={1}
                          value={part.quantity}
                          onChange={(e) =>
                            onUpdateField(
                              index,
                              'quantity',
                              Math.max(1, parseInt(e.target.value, 10) || 1),
                            )
                          }
                          disabled={isProcessing}
                          className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 outline-none transition focus:border-blue-500 disabled:bg-slate-100"
                        />
                      </div>
                    </div>

                    {/* SELECTED PART DETAILS SUMMARY */}
                    {part.itemId !== null && (
                      <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-slate-200 bg-white p-3 text-xs">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-semibold text-slate-800">
                            {part.itemName}
                          </span>
                          {part.itemCode && (
                            <span className="font-mono text-slate-500">
                              [{part.itemCode}]
                            </span>
                          )}
                          {part.categoryName && (
                            <span className="rounded bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-600">
                              {part.categoryName}
                            </span>
                          )}
                        </div>

                        <span className="rounded-md bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700">
                          Request: {part.quantity} units
                        </span>
                      </div>
                    )}
                  </div>
                ) : (
                  /* MODE 2: CUSTOM / MANUAL INPUT */
                  <div className="space-y-3">
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-4">
                      {/* CATEGORY DROPDOWN */}
                      <div className="sm:col-span-2">
                        <label className="mb-1 block text-xs font-medium text-slate-600">
                          Part Category <span className="text-rose-500">*</span>
                        </label>
                        <select
                          value={part.itemCategoryId}
                          onChange={(e) =>
                            onUpdateField(
                              index,
                              'itemCategoryId',
                              e.target.value ? Number(e.target.value) : '',
                            )
                          }
                          disabled={isProcessing}
                          className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 outline-none transition focus:border-blue-500 disabled:bg-slate-100"
                        >
                          <option value="">-- Select Part Category --</option>
                          {categories.map((cat) => (
                            <option key={cat.id} value={cat.id}>
                              {cat.categoryName}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* ITEM NAME INPUT (MAX 50 CHARS) */}
                      <div className="sm:col-span-2">
                        <div className="mb-1 flex items-center justify-between">
                          <label className="block text-xs font-medium text-slate-600">
                            Spare Part Name <span className="text-rose-500">*</span>
                          </label>
                          <span className="text-[10px] text-slate-400">
                            {part.itemName.length}/50
                          </span>
                        </div>
                        <input
                          type="text"
                          maxLength={50}
                          value={part.itemName}
                          onChange={(e) =>
                            onUpdateField(index, 'itemName', e.target.value)
                          }
                          placeholder="Spare part name (max 50 characters)"
                          disabled={isProcessing}
                          className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 outline-none transition focus:border-blue-500 disabled:bg-slate-100"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-4">
                      {/* QUANTITY INPUT */}
                      <div className="sm:col-span-1">
                        <label className="mb-1 block text-xs font-medium text-slate-600">
                          Quantity <span className="text-rose-500">*</span>
                        </label>
                        <input
                          type="number"
                          min={1}
                          value={part.quantity}
                          onChange={(e) =>
                            onUpdateField(
                              index,
                              'quantity',
                              Math.max(1, parseInt(e.target.value, 10) || 1),
                            )
                          }
                          disabled={isProcessing}
                          className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 outline-none transition focus:border-blue-500 disabled:bg-slate-100"
                        />
                      </div>

                      <div className="flex items-center sm:col-span-3">
                        <p className="text-xs text-slate-400">
                          Custom mode is used if the required spare part is not yet registered in warehouse inventory.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}


import {
  ClipboardCheck,
  LoaderCircle,
  Plus,
} from 'lucide-react';

import ProcurementItemForm from '../../../../../components/common/ProcurementItemForm';

import type {
  MaintenanceProcurementItemPayload,
} from '../../../types/maintenance.types';

import type {
  useInventoryOptions,
} from '../../../../procurement/hooks/useInventoryOptions';

import {
  formatIDR,
  toSharedProcurementItem,
} from '../../../utils/maintenance-detail.utils';

type InventoryOptions = ReturnType<typeof useInventoryOptions>;

interface ReplacementAssetOption {
  assetId: number;
  assetTag: string;
  itemName: string;
  categoryName?: string | null;
}

interface InventoryReplacementDecisionProps {
  replacementAvailability: boolean | null;
  selectedReplacementAssetId: number | '';
  replacementAssets: ReplacementAssetOption[];
  isLoadingReplacementAssets: boolean;
  replacementAssetError: string | null;

  replacementSubject: string;
  setReplacementSubject: (value: string) => void;
  replacementDescription: string;
  setReplacementDescription: (value: string) => void;

  replacementItems: MaintenanceProcurementItemPayload[];
  replacementManualItems: boolean[];

  categories: InventoryOptions['categories'];
  isLoadingCategories: boolean;
  categoryError: string | null;
  inventoryItemsByCategory: InventoryOptions['inventoryItemsByCategory'];
  loadingItems: InventoryOptions['loadingItems'];
  itemErrors: InventoryOptions['itemErrors'];

  isProcessing: boolean;
  canSubmitReplacement: boolean;
  totalReplacementEstimatedPrice: number;

  onAvailabilityChange: (value: boolean | null) => void;
  onReplacementAssetChange: (value: number | '') => void;
  onCategoryChange: (index: number, categoryId: string) => void;
  onToggleManualItem: (index: number) => void;
  onManualNameChange: (index: number, value: string) => void;
  onItemChange: (index: number, itemId: string) => void;
  onPriceChange: (index: number, price: number) => void;
  onRemoveItem: (index: number) => void;
  onAddItem: () => void;
  onProcessReplacement: () => void;
}

export default function InventoryReplacementDecision({
  replacementAvailability,
  selectedReplacementAssetId,
  replacementAssets,
  isLoadingReplacementAssets,
  replacementAssetError,
  replacementSubject,
  setReplacementSubject,
  replacementDescription,
  setReplacementDescription,
  replacementItems,
  replacementManualItems,
  categories,
  isLoadingCategories,
  categoryError,
  inventoryItemsByCategory,
  loadingItems,
  itemErrors,
  isProcessing,
  canSubmitReplacement,
  totalReplacementEstimatedPrice,
  onAvailabilityChange,
  onReplacementAssetChange,
  onCategoryChange,
  onToggleManualItem,
  onManualNameChange,
  onItemChange,
  onPriceChange,
  onRemoveItem,
  onAddItem,
  onProcessReplacement,
}: InventoryReplacementDecisionProps) {
  return (
    <div className="space-y-4 rounded-xl border border-purple-200 bg-purple-50/50 p-4">
      <div>
        <h4 className="text-sm font-semibold text-slate-800">
          Replacement Asset Decision
        </h4>
        <p className="mt-1 text-xs text-slate-500">
          Check whether a replacement asset is available in Inventory.
        </p>
      </div>

      <div>
        <label
          htmlFor="replacementAvailability"
          className="mb-2 block text-sm font-medium text-slate-700"
        >
          Inventory Decision
        </label>

        <select
          id="replacementAvailability"
          value={
            replacementAvailability === null
              ? ''
              : replacementAvailability
                ? 'available'
                : 'unavailable'
          }
          onChange={(event) => {
            const value = event.target.value;

            onAvailabilityChange(
              value === '' ? null : value === 'available',
            );
          }}
          disabled={isProcessing}
          className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-purple-500"
        >
          <option value="">Select inventory decision</option>
          <option value="available">Replacement Available</option>
          <option value="unavailable">Not Available</option>
        </select>
      </div>

      {replacementAvailability === true && (
        <div>
          <label
            htmlFor="replacementAsset"
            className="mb-2 block text-sm font-medium text-slate-700"
          >
            Select Replacement Asset
          </label>

          <select
            id="replacementAsset"
            value={selectedReplacementAssetId}
            onChange={(event) =>
              onReplacementAssetChange(
                event.target.value
                  ? Number(event.target.value)
                  : '',
              )
            }
            disabled={
              isProcessing ||
              isLoadingReplacementAssets ||
              replacementAssets.length === 0
            }
            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-purple-500 disabled:bg-slate-100"
          >
            <option value="">
              {isLoadingReplacementAssets
                ? 'Loading replacement assets...'
                : replacementAssets.length === 0
                  ? 'No replacement assets available'
                  : 'Select available asset'}
            </option>

            {replacementAssets.map((asset) => (
              <option key={asset.assetId} value={asset.assetId}>
                {asset.assetTag} - {asset.itemName}
                {asset.categoryName
                  ? ` (${asset.categoryName})`
                  : ''}
              </option>
            ))}
          </select>

          {isLoadingReplacementAssets && (
            <p className="mt-2 flex items-center gap-2 text-xs text-slate-500">
              <LoaderCircle size={14} className="animate-spin" />
              Loading available replacement assets...
            </p>
          )}

          {replacementAssetError && (
            <p className="mt-2 text-xs text-red-600">
              {replacementAssetError}
            </p>
          )}

          {!isLoadingReplacementAssets &&
            !replacementAssetError &&
            replacementAssets.length === 0 && (
              <p className="mt-2 text-xs text-red-600">
                No replacement assets are currently available in Inventory.
              </p>
            )}
        </div>
      )}

      {replacementAvailability === false && (
        <div className="space-y-3 rounded-xl border border-slate-200 bg-white p-4">
          <h5 className="text-sm font-semibold text-slate-800">
            Create Replacement Procurement
          </h5>

          <div>
            <label
              htmlFor="replacementSubject"
              className="mb-1 block text-xs font-medium text-slate-600"
            >
              Subject
            </label>
            <input
              id="replacementSubject"
              type="text"
              value={replacementSubject}
              onChange={(event) =>
                setReplacementSubject(event.target.value)
              }
              placeholder="Replacement Asset Procurement"
              disabled={isProcessing}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-purple-500"
            />
          </div>

          <div>
            <label
              htmlFor="replacementDescription"
              className="mb-1 block text-xs font-medium text-slate-600"
            >
              Description
            </label>
            <textarea
              id="replacementDescription"
              value={replacementDescription}
              onChange={(event) =>
                setReplacementDescription(event.target.value)
              }
              rows={2}
              placeholder="Procurement description..."
              disabled={isProcessing}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-purple-500"
            />
          </div>

          {replacementItems.map((item, index) => (
            <ProcurementItemForm
              key={index}
              index={index}
              item={toSharedProcurementItem(
                item,
                replacementManualItems[index] ?? false,
              )}
              categories={categories}
              categoryItems={inventoryItemsByCategory}
              isLoadingCategories={isLoadingCategories}
              categoryError={categoryError ?? ''}
              isLoadingItems={loadingItems}
              itemErrors={itemErrors}
              canRemove={replacementItems.length > 1}
              disabled={isProcessing}
              lockQuantity
              quantityHint="Maximum quantity is 1."
              itemLabel="Replacement Item"
              subtitle="Replacement procurement item"
              onCategoryChange={onCategoryChange}
              onItemChange={(itemIndex, itemId) =>
                onItemChange(itemIndex, itemId)
              }
              onToggleManualItem={onToggleManualItem}
              onFieldChange={(itemIndex, field, value) => {
                if (field === 'itemName') {
                  onManualNameChange(itemIndex, value);
                } else if (field === 'estimatedPrice') {
                  onPriceChange(
                    itemIndex,
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
            className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600"
          >
            <Plus size={14} />
            Add Procurement Item
          </button>

          <div className="flex items-center justify-between border-t border-slate-200 pt-3">
            <span className="text-sm font-semibold text-slate-700">
              Total Estimated Price
            </span>
            <span className="text-base font-bold text-purple-700">
              {formatIDR(totalReplacementEstimatedPrice)}
            </span>
          </div>
        </div>
      )}

      <div className="flex justify-end">
        <button
          type="button"
          onClick={onProcessReplacement}
          disabled={isProcessing || !canSubmitReplacement}
          className="inline-flex items-center gap-2 rounded-xl bg-purple-600 px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
        >
          {isProcessing ? (
            <LoaderCircle size={17} className="animate-spin" />
          ) : (
            <ClipboardCheck size={17} />
          )}
          Submit Replacement Decision
        </button>
      </div>
    </div>
  );
}

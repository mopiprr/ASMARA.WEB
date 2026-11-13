import { FileText, Plus } from 'lucide-react';

import type {
  CategoryItemsState,
  CategoryOption,
  ErrorState,
  LoadingState,
  ProcurementDetail,
  ProcurementItem,
} from '../../types/procurement.types';

import { formatIDR } from '../../utils/procurement.utils';

import ProcurementBudgetWidget from '../../../finance/components/ProcurementBudgetWidget';

import ProcurementItemForm from '../ProcurementItemForm';
import ItemsTable from './ItemsTable';

interface ItemsSectionProps {
  items: ProcurementDetail[];
  editableItems: ProcurementItem[];
  isEditing: boolean;
  isProcessing: boolean;

  // Pilihan kategori & item inventory (sama dengan form create).
  categories: CategoryOption[];
  categoryItems: CategoryItemsState;
  isLoadingItems: LoadingState;
  itemErrors: ErrorState;
  categoryError: string;

  // Total yang tampil (item tiket, atau item hasil edit saat resubmit).
  total: number;

  // Tampilkan cek budget (step Finance atau user Finance).
  showBudget: boolean;
  departmentName?: string;

  onAddItem: () => void;
  onCategoryChange: (index: number, categoryId: string) => void;
  onItemChange: (index: number, itemId: string, itemName: string) => void;
  onToggleManualItem: (index: number) => void;
  onFieldChange: (index: number, field: keyof ProcurementItem, value: string) => void;
  onRemoveItem: (index: number) => void;
}

function ItemsSection({
  items,
  editableItems,
  isEditing,
  isProcessing,
  categories,
  categoryItems,
  isLoadingItems,
  itemErrors,
  categoryError,
  total,
  showBudget,
  departmentName,
  onAddItem,
  onCategoryChange,
  onItemChange,
  onToggleManualItem,
  onFieldChange,
  onRemoveItem,
}: ItemsSectionProps) {
  return (
    <section>
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FileText size={17} className="text-slate-500" />

          <h3 className="text-sm font-bold text-slate-800">
            Procurement Items (
            {isEditing ? editableItems.length : items.length})
          </h3>
        </div>

        {isEditing && (
          <button
            type="button"
            onClick={onAddItem}
            disabled={isProcessing}
            className="inline-flex items-center gap-2 rounded-lg bg-blue-50 px-3 py-2 text-xs font-semibold text-blue-600 transition hover:bg-blue-100"
          >
            <Plus size={14} />
            Add Item
          </button>
        )}
      </div>

      {isEditing ? (
        <div className="space-y-4">
          {categoryError && (
            <p className="text-xs text-red-500">{categoryError}</p>
          )}

          {editableItems.length === 0 && (
            <div className="rounded-xl border border-dashed border-slate-200 p-6 text-center text-sm text-slate-400">
              No items. Click Add Item to add a procurement item.
            </div>
          )}

          {/* Kartu item sama persis dengan form create */}
          {editableItems.map((item, index) => (
            <ProcurementItemForm
              key={index}
              index={index}
              item={item}
              categories={categories}
              categoryItems={categoryItems}
              isLoadingItems={isLoadingItems}
              itemErrors={itemErrors}
              canRemove={editableItems.length > 1}
              onCategoryChange={onCategoryChange}
              onItemChange={onItemChange}
              onToggleManualItem={onToggleManualItem}
              onFieldChange={onFieldChange}
              onRemove={onRemoveItem}
            />
          ))}
        </div>
      ) : (
        <ItemsTable items={items} />
      )}

      <div className="mt-4 flex items-center justify-between rounded-xl bg-slate-50 px-5 py-4">
        <p className="text-sm font-medium text-slate-500">
          Total Estimated Value
        </p>

        <p className="text-lg font-bold text-slate-800">
          {formatIDR(total)}
        </p>
      </div>

      {/* REAL-TIME BUDGET CHECK STATUS (ONLY FOR FINANCE) */}
      {showBudget && (
        <div className="mt-4">
          <ProcurementBudgetWidget
            estimatedTotal={total}
            departmentName={departmentName}
          />
        </div>
      )}
    </section>
  );
}

export default ItemsSection;
import { Plus } from 'lucide-react';

import type {
  CategoryItemsState,
  CategoryOption,
  ErrorState,
  LoadingState,
  ProcurementItem,
} from '../../types/procurement.types';

import { formatIDR } from '../../utils/procurement.utils';

import ProcurementItemForm from '../ProcurementItemForm';

export interface CreateRequestFormStepProps {
  subject: string;
  description: string;
  items: ProcurementItem[];
  estimatedTotal: number;

  categories: CategoryOption[];
  categoryItems: CategoryItemsState;
  isLoadingItems: LoadingState;
  itemErrors: ErrorState;

  isSubmitting: boolean;

  onSubjectChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;

  onCategoryChange: (index: number, categoryId: string) => void;
  onItemChange: (index: number, itemId: string, itemName: string) => void;
  onToggleManualItem: (index: number) => void;
  onFieldChange: (
    index: number,
    field: keyof ProcurementItem,
    value: string
  ) => void;

  onAddItem: () => void;
  onRemoveItem: (index: number) => void;
}

// STEP 1: isi subject, deskripsi, dan daftar item.
function CreateRequestFormStep({
  subject,
  description,
  items,
  estimatedTotal,
  categories,
  categoryItems,
  isLoadingItems,
  itemErrors,
  isSubmitting,
  onSubjectChange,
  onDescriptionChange,
  onCategoryChange,
  onItemChange,
  onToggleManualItem,
  onFieldChange,
  onAddItem,
  onRemoveItem,
}: CreateRequestFormStepProps) {
  return (
    <>
      {/* REQUEST INFORMATION */}
      <section>
        <div className="mb-4">
          <h3 className="text-sm font-bold text-slate-800">
            Request Information
          </h3>

          <p className="mt-1 text-xs text-slate-400">
            Provide the basic information for your request.
          </p>
        </div>

        <div className="space-y-4">
          {/* SUBJECT */}
          <div>
            <label
              htmlFor="procurement-subject"
              className="mb-2 block text-sm font-semibold text-slate-700"
            >
              Request Subject <span className="text-red-500">*</span>
            </label>

            <input
              id="procurement-subject"
              type="text"
              value={subject}
              onChange={(event) =>
                onSubjectChange(event.target.value)
              }
              placeholder="Example: Developer Laptop & Monitor Procurement"
              maxLength={200}
              required
              disabled={isSubmitting}
              className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-50"
            />
          </div>

          {/* DESCRIPTION */}
          <div>
            <label
              htmlFor="procurement-description"
              className="mb-2 block text-sm font-semibold text-slate-700"
            >
              Description
            </label>

            <textarea
              id="procurement-description"
              value={description}
              onChange={(event) =>
                onDescriptionChange(event.target.value)
              }
              placeholder="Explain the purpose or details of this procurement request..."
              rows={3}
              maxLength={2000}
              disabled={isSubmitting}
              className="w-full resize-y rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-50"
            />

            <p className="mt-1 text-right text-xs text-slate-400">
              {description.length}/2000 characters
            </p>
          </div>
        </div>
      </section>

      {/* DIVIDER */}
      <div className="my-7 border-t border-slate-100" />

      {/* PROCUREMENT ITEMS */}
      <section>
        <div className="mb-5 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
          <div>
            <h3 className="text-sm font-bold text-slate-800">
              Procurement Items
              <span className="ml-2 text-red-500">*</span>
            </h3>

            <p className="mt-1 text-xs text-slate-400">
              Add the items you want to request.
            </p>
          </div>

          <button
            type="button"
            onClick={onAddItem}
            disabled={isSubmitting}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-blue-200 bg-blue-50 px-4 py-2 text-xs font-semibold text-blue-600 transition hover:bg-blue-100 disabled:opacity-50"
          >
            <Plus size={15} />
            Add Another Item
          </button>
        </div>

        <div className="space-y-4">
          {items.map((item, index) => (
            <ProcurementItemForm
              key={index}
              index={index}
              item={item}
              categories={categories}
              categoryItems={categoryItems}
              isLoadingItems={isLoadingItems}
              itemErrors={itemErrors}
              canRemove={items.length > 1}
              onCategoryChange={onCategoryChange}
              onItemChange={onItemChange}
              onToggleManualItem={onToggleManualItem}
              onFieldChange={onFieldChange}
              onRemove={onRemoveItem}
            />
          ))}
        </div>
      </section>

      {/* ESTIMATED TOTAL */}
      <div className="mt-6 flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-5 py-4">
        <div>
          <p className="text-xs font-medium text-slate-500">
            Total Estimated Value
          </p>

          <p className="mt-1 text-xs text-slate-400">
            Based on the quantity and estimated price of each item.
          </p>
        </div>

        <p className="text-lg font-bold text-slate-800">
          {formatIDR(estimatedTotal)}
        </p>
      </div>
    </>
  );
}

export default CreateRequestFormStep;
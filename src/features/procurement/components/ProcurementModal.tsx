
import type { FormEvent } from 'react';
import {
  X,
  Plus,
  FileText,
  Package,
  Send,
  AlertCircle,
  CheckCircle2,
  LoaderCircle,
} from 'lucide-react';

import type {
  CategoryOption,
  CategoryItemsState,
  ErrorState,
  LoadingState,
  ProcurementItem,
} from '../types/procurement.types';

import { formatIDR } from '../utils/procurement.utils';
import ProcurementItemForm from './ProcurementItemForm';

// ==========================================
// PROPS
// ==========================================

interface ProcurementModalProps {
  isOpen: boolean;
  onClose: () => void;

  parentTicketId: string | null;

  subject: string;
  description: string;
  items: ProcurementItem[];

  categories: CategoryOption[];
  categoryItems: CategoryItemsState;
  isLoadingItems: LoadingState;
  itemErrors: ErrorState;

  isSubmitting: boolean;
  submitError: string;
  submitSuccess: string;

  onSubjectChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;

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

  onAddItem: () => void;
  onRemoveItem: (index: number) => void;

  onSubmit: (event: FormEvent<HTMLFormElement>) => void | Promise<void>;
}

// ==========================================
// COMPONENT
// ==========================================

function ProcurementModal({
  isOpen,
  onClose,
  parentTicketId,
  subject,
  description,
  items,
  categories,
  categoryItems,
  isLoadingItems,
  itemErrors,
  isSubmitting,
  submitError,
  submitSuccess,
  onSubjectChange,
  onDescriptionChange,
  onCategoryChange,
  onItemChange,
  onToggleManualItem,
  onFieldChange,
  onAddItem,
  onRemoveItem,
  onSubmit,
}: ProcurementModalProps) {
  if (!isOpen) return null;

  const estimatedTotal = items.reduce((total, item) => {
    const quantity = Number(item.quantity) || 0;
    const price = Number(item.estimatedPrice) || 0;

    return total + quantity * price;
  }, 0);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !isSubmitting) {
          onClose();
        }
      }}
    >
      <div className="flex max-h-[92vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">

        {/* ======================================
            MODAL HEADER
        ====================================== */}

        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <Package size={22} />
            </div>

            <div>
              <h2 className="text-lg font-bold text-slate-800">
                New Procurement Request
              </h2>

              <p className="mt-1 text-xs text-slate-500">
                Submit a request for purchasing items.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            aria-label="Close modal"
            className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <X size={20} />
          </button>
        </div>

        {/* ======================================
            MODAL BODY
        ====================================== */}

        <form
          onSubmit={onSubmit}
          className="flex min-h-0 flex-1 flex-col"
        >
          <div className="overflow-y-auto px-6 py-6">

            {/* MAINTENANCE PARENT INFO */}
            {parentTicketId && (
              <div className="mb-6 flex gap-3 rounded-xl border border-blue-100 bg-blue-50 p-4">
                <FileText
                  size={19}
                  className="mt-0.5 shrink-0 text-blue-600"
                />

                <div>
                  <p className="text-sm font-semibold text-blue-800">
                    Linked Maintenance Ticket
                  </p>

                  <p className="mt-1 break-all text-xs text-blue-600">
                    This procurement request is linked to maintenance
                    ticket: {parentTicketId}
                  </p>
                </div>
              </div>
            )}

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
                    placeholder="Example: Office equipment procurement"
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
                    rows={4}
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
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-blue-200 bg-blue-50 px-4 py-2.5 text-sm font-semibold text-blue-600 transition hover:bg-blue-100 disabled:opacity-50"
                >
                  <Plus size={16} />
                  Add Item
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

            {/* ERROR MESSAGE */}
            {submitError && (
              <div className="mt-5 flex gap-3 rounded-xl border border-red-200 bg-red-50 p-4">
                <AlertCircle
                  size={19}
                  className="mt-0.5 shrink-0 text-red-500"
                />

                <div>
                  <p className="text-sm font-semibold text-red-700">
                    Submission Failed
                  </p>

                  <p className="mt-1 text-xs text-red-600">
                    {submitError}
                  </p>
                </div>
              </div>
            )}

            {/* SUCCESS MESSAGE */}
            {submitSuccess && (
              <div className="mt-5 flex gap-3 rounded-xl border border-green-200 bg-green-50 p-4">
                <CheckCircle2
                  size={19}
                  className="mt-0.5 shrink-0 text-green-600"
                />

                <div>
                  <p className="text-sm font-semibold text-green-700">
                    Request Submitted
                  </p>

                  <p className="mt-1 text-xs text-green-600">
                    {submitSuccess}
                  </p>
                </div>
              </div>
            )}

          </div>

          {/* ======================================
              MODAL FOOTER
          ====================================== */}

          <div className="flex flex-col-reverse justify-between gap-3 border-t border-slate-100 bg-white px-6 py-5 sm:flex-row sm:items-center">
            <p className="text-xs text-slate-400">
              Fields marked with <span className="text-red-500">*</span> are required.
            </p>

            <div className="flex flex-col-reverse gap-2 sm:flex-row">
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={isSubmitting || Boolean(submitSuccess)}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSubmitting ? (
                  <>
                    <LoaderCircle
                      size={17}
                      className="animate-spin"
                    />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Send size={16} />
                    Submit Request
                  </>
                )}
              </button>
            </div>
          </div>

        </form>
      </div>
    </div>
  );
}

export default ProcurementModal;

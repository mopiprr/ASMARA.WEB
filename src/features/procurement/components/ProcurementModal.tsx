import { useState, useEffect, type FormEvent } from 'react';
import {
  X,
  Plus,
  FileText,
  Package,
  Send,
  AlertCircle,
  CheckCircle2,
  LoaderCircle,
  ArrowRight,
  ArrowLeft,
  ClipboardCheck,
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
import { ConfirmDialog } from '../../../components/common/ConfirmDialog';

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
  const [isReviewing, setIsReviewing] = useState(false);
  const [validationError, setValidationError] = useState('');
  const [showConfirmSubmit, setShowConfirmSubmit] = useState(false);

  // Reset review mode when modal opens or closes
  useEffect(() => {
    if (!isOpen) {
      setIsReviewing(false);
      setValidationError('');
      setShowConfirmSubmit(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const estimatedTotal = items.reduce((total, item) => {
    const quantity = Number(item.quantity) || 0;
    const price = Number(item.estimatedPrice) || 0;

    return total + quantity * price;
  }, 0);

  // Validate form and proceed to Review Step
  const handleProceedToReview = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setValidationError('');

    if (!subject.trim()) {
      setValidationError('Request Subject is required.');
      return;
    }

    if (items.length === 0) {
      setValidationError('Please add at least one procurement item.');
      return;
    }

    const invalidIndex = items.findIndex((item) => {
      const quantity = Number(item.quantity);
      const price = Number(item.estimatedPrice || 0);

      return (
        !item.categoryId ||
        !item.itemName.trim() ||
        (!item.isManual && !item.itemId) ||
        !Number.isInteger(quantity) ||
        quantity <= 0 ||
        !Number.isFinite(price) ||
        price < 0
      );
    });

    if (invalidIndex !== -1) {
      setValidationError(
        `Item #${invalidIndex + 1} is incomplete. Please ensure category, name, quantity (> 0), and price are valid.`
      );
      return;
    }

    setIsReviewing(true);
  };

  // Final submit handler via Confirmation Dialog
  const executeSubmit = async () => {
    try {
      await onSubmit({
        preventDefault: () => {},
      } as unknown as FormEvent<HTMLFormElement>);
    } finally {
      setShowConfirmSubmit(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm animate-in fade-in duration-150"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !isSubmitting) {
          onClose();
        }
      }}
    >
      <div className="flex max-h-[92vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl animate-in zoom-in-95 duration-150">

        {/* ======================================
            MODAL HEADER
        ====================================== */}

        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
          <div className="flex items-center gap-3">
            <div className={`flex h-11 w-11 items-center justify-center rounded-xl transition ${
              isReviewing ? 'bg-emerald-50 text-emerald-600' : 'bg-blue-50 text-blue-600'
            }`}>
              {isReviewing ? <ClipboardCheck size={22} /> : <Package size={22} />}
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-slate-800">
                  {isReviewing ? 'Review Procurement Request' : 'New Procurement Request'}
                </h2>
                <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold border ${
                  isReviewing
                    ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                    : 'border-blue-200 bg-blue-50 text-blue-700'
                }`}>
                  {isReviewing ? 'Step 2 of 2: Review' : 'Step 1 of 2: Fill Details'}
                </span>
              </div>

              <p className="mt-1 text-xs text-slate-500">
                {isReviewing
                  ? 'Please review your procurement request details carefully before submitting.'
                  : 'Submit a request for purchasing items for your department.'}
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
          onSubmit={isReviewing ? (e) => e.preventDefault() : handleProceedToReview}
          className="flex min-h-0 flex-1 flex-col"
        >
          <div className="overflow-y-auto px-6 py-6">

            {/* ERROR MESSAGE (API OR VALIDATION) */}
            {(submitError || validationError) && (
              <div className="mb-6 flex gap-3 rounded-xl border border-red-200 bg-red-50 p-4 animate-in fade-in duration-150">
                <AlertCircle
                  size={19}
                  className="mt-0.5 shrink-0 text-red-500"
                />

                <div>
                  <p className="text-sm font-semibold text-red-700">
                    Notice
                  </p>

                  <p className="mt-1 text-xs text-red-600">
                    {submitError || validationError}
                  </p>
                </div>
              </div>
            )}

            {/* SUCCESS MESSAGE */}
            {submitSuccess && (
              <div className="mb-6 flex gap-3 rounded-xl border border-green-200 bg-green-50 p-4 animate-in fade-in duration-150">
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

            {/* ====================================================
                VIEW 1: FORM INPUT (STEP 1)
            ==================================================== */}
            {!isReviewing ? (
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
            ) : (
              /* ====================================================
                  VIEW 2: REVIEW & CONFIRMATION SUMMARY (STEP 2)
              ==================================================== */
              <div className="space-y-6 animate-in fade-in duration-200">
                {/* SUMMARY HEADER INFO */}
                <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-5">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    Request Information
                  </span>

                  <h3 className="mt-1 text-base font-bold text-slate-800">
                    {subject}
                  </h3>

                  <p className="mt-2 text-xs text-slate-600 leading-relaxed whitespace-pre-wrap">
                    {description.trim() ? description : (
                      <span className="italic text-slate-400">No additional description provided.</span>
                    )}
                  </p>
                </div>

                {/* ITEMS PREVIEW TABLE */}
                <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
                  <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50/90 px-5 py-3.5">
                    <div className="flex items-center gap-2">
                      <span className="flex h-6 w-6 items-center justify-center rounded-md bg-blue-100 text-xs font-bold text-blue-700">
                        {items.length}
                      </span>
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                        Requested Items
                      </h4>
                    </div>

                    <span className="text-xs font-semibold text-slate-500">
                      Estimated Cost
                    </span>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[550px] text-left text-xs">
                      <thead className="bg-slate-50 text-[11px] uppercase tracking-wider text-slate-400 border-b border-slate-100">
                        <tr>
                          <th className="px-5 py-3 font-semibold">No</th>
                          <th className="px-5 py-3 font-semibold">Category</th>
                          <th className="px-5 py-3 font-semibold">Item Name</th>
                          <th className="px-5 py-3 font-semibold text-right">Quantity</th>
                          <th className="px-5 py-3 font-semibold text-right">Unit Price</th>
                          <th className="px-5 py-3 font-semibold text-right">Subtotal</th>
                        </tr>
                      </thead>

                      <tbody className="divide-y divide-slate-100">
                        {items.map((item, idx) => {
                          const cat = categories.find(
                            (c) => String(c.id) === String(item.categoryId)
                          );
                          const quantity = Number(item.quantity) || 0;
                          const price = Number(item.estimatedPrice) || 0;
                          const subtotal = quantity * price;

                          return (
                            <tr key={idx} className="transition hover:bg-slate-50/50">
                              <td className="px-5 py-3.5 font-medium text-slate-400">
                                {idx + 1}
                              </td>

                              <td className="px-5 py-3.5 font-semibold text-slate-700">
                                {cat?.categoryName || '-'}
                              </td>

                              <td className="px-5 py-3.5 font-medium text-slate-800">
                                <div className="flex items-center gap-1.5">
                                  <span>{item.itemName}</span>
                                  {item.isManual && (
                                    <span className="rounded bg-amber-50 border border-amber-200 px-1.5 py-0.5 text-[9px] font-bold text-amber-700">
                                      Custom Item
                                    </span>
                                  )}
                                </div>
                              </td>

                              <td className="px-5 py-3.5 text-right font-bold text-slate-800">
                                {quantity.toLocaleString('en-US')} units
                              </td>

                              <td className="px-5 py-3.5 text-right font-mono text-slate-600">
                                {formatIDR(price)}
                              </td>

                              <td className="px-5 py-3.5 text-right font-mono font-bold text-slate-900">
                                {formatIDR(subtotal)}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  {/* GRAND TOTAL ROW */}
                  <div className="flex items-center justify-between border-t border-slate-200 bg-slate-50/80 px-5 py-4">
                    <div>
                      <p className="text-xs font-bold text-slate-800">
                        Total Estimated Cost
                      </p>
                      <p className="mt-0.5 text-[11px] text-slate-400">
                        Cumulative estimated cost of all requested items
                      </p>
                    </div>

                    <p className="text-lg font-bold text-blue-700 font-mono">
                      {formatIDR(estimatedTotal)}
                    </p>
                  </div>
                </div>

                {/* CONFIRMATION INFORMATIVE ALERT */}
                <div className="flex items-start gap-3 rounded-xl border border-blue-200 bg-blue-50/70 p-4 text-xs text-blue-900">
                  <CheckCircle2 size={18} className="mt-0.5 shrink-0 text-blue-600" />
                  <div>
                    <p className="font-bold">Please Review Carefully Before Submitting</p>
                    <p className="mt-1 text-blue-800 leading-relaxed">
                      Please double-check all entered information and items before submitting. Once submitted, your request will be forwarded to your supervisor for review and approval.
                    </p>
                  </div>
                </div>
              </div>
            )}

          </div>

          {/* ======================================
              MODAL FOOTER
          ====================================== */}

          <div className="flex flex-col-reverse justify-between gap-3 border-t border-slate-100 bg-white px-6 py-4 sm:flex-row sm:items-center">
            {!isReviewing ? (
              <>
                <p className="text-xs text-slate-400">
                  Fields marked with <span className="text-red-500">*</span> are required.
                </p>

                <div className="flex flex-col-reverse gap-2 sm:flex-row">
                  <button
                    type="button"
                    onClick={onClose}
                    disabled={isSubmitting}
                    className="rounded-xl border border-slate-200 px-5 py-2.5 text-xs font-semibold text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={isSubmitting || Boolean(submitSuccess)}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-xs font-semibold text-white shadow-xs transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <span>Proceed to Review</span>
                    <ArrowRight size={14} />
                  </button>
                </div>
              </>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => setIsReviewing(false)}
                  disabled={isSubmitting}
                  className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
                >
                  <ArrowLeft size={14} />
                  <span>Back to Edit</span>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={onClose}
                    disabled={isSubmitting}
                    className="rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-semibold text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
                  >
                    Cancel
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowConfirmSubmit(true)}
                    disabled={isSubmitting || Boolean(submitSuccess)}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-xs font-semibold text-white shadow-xs transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isSubmitting ? (
                      <>
                        <LoaderCircle
                          size={15}
                          className="animate-spin"
                        />
                        <span>Submitting Request...</span>
                      </>
                    ) : (
                      <>
                        <Send size={14} />
                        <span>Submit Request</span>
                      </>
                    )}
                  </button>
                </div>
              </>
            )}
          </div>

        </form>
      </div>

      {/* CONFIRMATION DIALOG */}
      <ConfirmDialog
        isOpen={showConfirmSubmit}
        title="Submit Procurement Request"
        message="Are you sure you want to submit this procurement request?"
        description="Please confirm that all details and requested items are accurate. Once submitted, your request will be sent for approval."
        type="info"
        confirmText="Yes, Submit"
        cancelText="Cancel"
        isLoading={isSubmitting}
        onConfirm={executeSubmit}
        onCancel={() => {
          if (!isSubmitting) {
            setShowConfirmSubmit(false);
          }
        }}
      />
    </div>
  );
}

export default ProcurementModal;

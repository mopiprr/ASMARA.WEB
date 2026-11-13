import { useState, useEffect, type FormEvent } from 'react';

import type {
  CategoryOption,
  CategoryItemsState,
  ErrorState,
  LoadingState,
  ProcurementItem,
} from '../types/procurement.types';

import {
  getFormItemsTotal,
  hasIncompleteItems,
} from '../utils/procurementForm.utils';

import { ConfirmDialog } from '../../../components/common/ConfirmDialog';

import CreateRequestHeader from './create/CreateRequestHeader';
import CreateRequestAlerts from './create/CreateRequestAlerts';
import CreateRequestFormStep from './create/CreateRequestFormStep';
import CreateRequestReviewStep from './create/CreateRequestReviewStep';
import CreateRequestFooter from './create/CreateRequestFooter';

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

// Modal create Procurement dua langkah: isi form -> review -> konfirmasi submit.
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
  const [showConfirmSubmit, setShowConfirmSubmit] = useState(false);

  // Reset review mode when modal opens or closes
  useEffect(() => {
    if (!isOpen) {
      setIsReviewing(false);
      setShowConfirmSubmit(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const estimatedTotal = getFormItemsTotal(items);
  const isItemsIncomplete = hasIncompleteItems(items);

  // Lanjut ke Review. Validasi isi dilakukan backend saat Submit;
  // jika ada yang salah, pesannya tampil di atas dan user bisa kembali ke Edit.
  const handleProceedToReview = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    // Enter di input juga memicu submit form -> tetap dijaga.
    if (isItemsIncomplete) return;

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
        <CreateRequestHeader
          isReviewing={isReviewing}
          isSubmitting={isSubmitting}
          onClose={onClose}
        />

        <form
          onSubmit={isReviewing ? (e) => e.preventDefault() : handleProceedToReview}
          className="flex min-h-0 flex-1 flex-col"
        >
          <div className="overflow-y-auto px-6 py-6">
            <CreateRequestAlerts
              errorMessage={submitError}
              successMessage={submitSuccess}
              parentTicketId={parentTicketId}
            />

            {!isReviewing ? (
              <CreateRequestFormStep
                subject={subject}
                description={description}
                items={items}
                estimatedTotal={estimatedTotal}
                categories={categories}
                categoryItems={categoryItems}
                isLoadingItems={isLoadingItems}
                itemErrors={itemErrors}
                isSubmitting={isSubmitting}
                onSubjectChange={onSubjectChange}
                onDescriptionChange={onDescriptionChange}
                onCategoryChange={onCategoryChange}
                onItemChange={onItemChange}
                onToggleManualItem={onToggleManualItem}
                onFieldChange={onFieldChange}
                onAddItem={onAddItem}
                onRemoveItem={onRemoveItem}
              />
            ) : (
              <CreateRequestReviewStep
                subject={subject}
                description={description}
                items={items}
                categories={categories}
                estimatedTotal={estimatedTotal}
              />
            )}
          </div>

          <CreateRequestFooter
            isReviewing={isReviewing}
            isSubmitting={isSubmitting}
            isSubmitted={Boolean(submitSuccess)}
            hasIncompleteItems={isItemsIncomplete}
            onClose={onClose}
            onBackToEdit={() => setIsReviewing(false)}
            onSubmitClick={() => setShowConfirmSubmit(true)}
          />
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
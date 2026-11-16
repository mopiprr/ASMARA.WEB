import { ArrowLeft, ArrowRight, LoaderCircle, Send } from 'lucide-react';

import { INCOMPLETE_ITEMS_HINT } from '../../utils/procurementForm.utils';

interface CreateRequestFooterProps {
  isReviewing: boolean;
  isSubmitting: boolean;
  isSubmitted: boolean;

  // Ada item yang masih kosong -> tombol lanjut/submit nonaktif.
  hasIncompleteItems: boolean;
  onClose: () => void;
  onBackToEdit: () => void;
  onSubmitClick: () => void;
}

// Step 1: Cancel + "Proceed to Review" (type=submit -> validasi form).
// Step 2: Back to Edit + Cancel + "Submit Request" (buka konfirmasi).
function CreateRequestFooter({
  isReviewing,
  isSubmitting,
  isSubmitted,
  hasIncompleteItems,
  onClose,
  onBackToEdit,
  onSubmitClick,
}: CreateRequestFooterProps) {
  return (
    <div className="flex flex-col-reverse justify-between gap-3 border-t border-slate-100 bg-white px-6 py-4 sm:flex-row sm:items-center">
      {!isReviewing ? (
        <>
          {hasIncompleteItems ? (
            <p className="text-xs text-amber-600">
              {INCOMPLETE_ITEMS_HINT}
            </p>
          ) : (
            <p className="text-xs text-slate-400">
              Fields marked with <span className="text-red-500">*</span> are required.
            </p>
          )}

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
              disabled={isSubmitting || isSubmitted || hasIncompleteItems}
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
            onClick={onBackToEdit}
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
              onClick={onSubmitClick}
              disabled={isSubmitting || isSubmitted || hasIncompleteItems}
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
  );
}

export default CreateRequestFooter;
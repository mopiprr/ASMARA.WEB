
import { createPortal } from 'react-dom';
import { AlertTriangle, X } from 'lucide-react';

type SignOutModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  loading?: boolean;
};

function SignOutModal({
  isOpen,
  onClose,
  onConfirm,
  loading = false,
}: SignOutModalProps) {
  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">

      {/* Full Screen Backdrop */}
      <div
        className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
        onClick={loading ? undefined : onClose}
      />

      {/* Modal Container */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="signout-title"
        className="relative z-10 w-full max-w-[424px] overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-2xl animate-in fade-in zoom-in-95 duration-200"
      >

        {/* Modal Content */}
        <div className="relative px-6 pt-6 pb-6">

          {/* Close Button */}
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            aria-label="Close modal"
            className="absolute right-5 top-6 rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 disabled:opacity-50"
          >
            <X size={19} />
          </button>

          {/* Warning Icon */}
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-50">
            <AlertTriangle
              size={22}
              className="text-rose-600"
              strokeWidth={2}
            />
          </div>

          {/* Title */}
          <h2
            id="signout-title"
            className="text-base font-bold text-slate-900"
          >
            Sign Out
          </h2>

          {/* Description */}
          <p className="mt-2 text-sm leading-relaxed text-slate-600">
            Are you sure you want to sign out?
          </p>

          <p className="mt-1.5 text-xs leading-relaxed text-slate-400">
            You will be logged out of your session and redirected to the login screen.
          </p>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2.5 border-t border-slate-100 bg-slate-50/80 px-6 py-4">

          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-600 shadow-sm transition-all hover:bg-slate-100 disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className="rounded-xl bg-rose-600 px-4 py-2 text-xs font-semibold text-white shadow-sm transition-all hover:bg-rose-700 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? 'Signing Out...' : 'Yes, Sign Out'}
          </button>

        </div>
      </div>
    </div>,
    document.body
  );
}

export default SignOutModal;

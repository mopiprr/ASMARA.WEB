import { AlertTriangle, CheckCircle2, HelpCircle, AlertCircle, LoaderCircle, X } from 'lucide-react';

export type ConfirmDialogType = 'info' | 'warning' | 'danger' | 'success';

export interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  description?: string;
  type?: ConfirmDialogType;
  confirmText?: string;
  cancelText?: string;
  isLoading?: boolean;
  onConfirm: () => void | Promise<void>;
  onCancel: () => void;
}

export function ConfirmDialog({
  isOpen,
  title,
  message,
  description,
  type = 'info',
  confirmText = 'Yes, Proceed',
  cancelText = 'Cancel',
  isLoading = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  if (!isOpen) return null;

  const typeConfig = {
    info: {
      icon: HelpCircle,
      iconContainer: 'bg-blue-50 text-blue-600',
      confirmButton: 'bg-blue-600 hover:bg-blue-700 text-white',
    },
    warning: {
      icon: AlertCircle,
      iconContainer: 'bg-amber-50 text-amber-600',
      confirmButton: 'bg-amber-600 hover:bg-amber-700 text-white',
    },
    danger: {
      icon: AlertTriangle,
      iconContainer: 'bg-rose-50 text-rose-600',
      confirmButton: 'bg-rose-600 hover:bg-rose-700 text-white',
    },
    success: {
      icon: CheckCircle2,
      iconContainer: 'bg-emerald-50 text-emerald-600',
      confirmButton: 'bg-emerald-600 hover:bg-emerald-700 text-white',
    },
  }[type];

  const IconComponent = typeConfig.icon;

  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-xs animate-in fade-in duration-150"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget && !isLoading) {
          onCancel();
        }
      }}
    >
      <div
        className="w-full max-w-md overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl animate-in zoom-in-95 duration-150"
        role="dialog"
        aria-modal="true"
      >
        <div className="p-6">
          <div className="flex items-start justify-between">
            <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${typeConfig.iconContainer}`}>
              <IconComponent size={24} />
            </div>

            <button
              type="button"
              onClick={onCancel}
              disabled={isLoading}
              className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600 disabled:opacity-50"
              title="Close"
            >
              <X size={18} />
            </button>
          </div>

          <div className="mt-4">
            <h3 className="text-base font-bold text-slate-800">
              {title}
            </h3>

            <p className="mt-2 text-sm leading-relaxed text-slate-600 font-medium">
              {message}
            </p>

            {description && (
              <p className="mt-1.5 text-xs text-slate-400 leading-relaxed">
                {description}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center justify-end gap-2.5 border-t border-slate-100 bg-slate-50/80 px-6 py-4">
          <button
            type="button"
            onClick={onCancel}
            disabled={isLoading}
            className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold text-slate-600 shadow-2xs transition hover:bg-slate-50 hover:text-slate-800 disabled:opacity-50"
          >
            {cancelText}
          </button>

          <button
            type="button"
            onClick={() => void onConfirm()}
            disabled={isLoading}
            className={`inline-flex items-center justify-center gap-1.5 rounded-xl px-4 py-2.5 text-xs font-semibold shadow-xs transition disabled:cursor-not-allowed disabled:opacity-60 ${typeConfig.confirmButton}`}
          >
            {isLoading ? (
              <>
                <LoaderCircle size={14} className="animate-spin" />
                <span>Processing...</span>
              </>
            ) : (
              <span>{confirmText}</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ConfirmDialog;

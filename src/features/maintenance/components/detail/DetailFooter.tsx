import { LoaderCircle } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export interface FooterButton {
  key: string;
  label: string;
  icon: LucideIcon;
  variant: 'primary' | 'success' | 'warning' | 'danger';
  disabled?: boolean;
  title?: string;
  onClick: () => void;
}

const VARIANT_CLASS: Record<FooterButton['variant'], string> = {
  primary: 'bg-blue-600 text-white hover:bg-blue-700',
  success: 'bg-emerald-600 text-white hover:bg-emerald-700',
  warning: 'border border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100',
  danger: 'border border-red-200 bg-red-50 text-red-600 hover:bg-red-100',
};

interface DetailFooterProps {
  isProcessing: boolean;
  onClose: () => void;
  buttons: FooterButton[];
}

// Footer tetap (tidak ikut scroll): tombol Close + tombol aksi step ini.
function DetailFooter({ isProcessing, onClose, buttons }: DetailFooterProps) {
  return (
    <div className="flex flex-col-reverse justify-between gap-3 border-t border-slate-100 bg-white px-6 py-5 sm:flex-row sm:items-center">
      <button
        type="button"
        onClick={onClose}
        disabled={isProcessing}
        className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
      >
        Close
      </button>

      {buttons.length > 0 && (
        <div className="flex flex-col gap-2 sm:flex-row">
          {buttons.map(({ key, label, icon: Icon, variant, disabled, title, onClick }) => (
            <button
              key={key}
              type="button"
              onClick={onClick}
              disabled={isProcessing || disabled}
              title={title}
              className={`inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 ${VARIANT_CLASS[variant]}`}
            >
              {isProcessing ? <LoaderCircle size={16} className="animate-spin" /> : <Icon size={16} />}
              {label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default DetailFooter;
import type { ReactNode } from 'react';
import { X } from 'lucide-react';

interface TicketDetailModalHeaderProps {
  icon: ReactNode;
  iconContainerClassName?: string;
  title: string;
  ticketNumber?: string;
  subtitle?: ReactNode;
  actions?: ReactNode;
  onClose: () => void;
  closeDisabled?: boolean;
}

/**
 * Sticky header shared across procurement and maintenance ticket detail modals.
 */
function TicketDetailModalHeader({
  icon,
  iconContainerClassName = 'bg-blue-50 text-blue-600',
  title,
  ticketNumber,
  subtitle,
  actions,
  onClose,
  closeDisabled = false,
}: TicketDetailModalHeaderProps) {
  return (
    <div className="sticky top-0 z-10 flex shrink-0 items-center justify-between gap-4 border-b border-slate-100 bg-white px-6 py-4">
      <div className="flex min-w-0 items-center gap-3">
        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${iconContainerClassName}`}
        >
          {icon}
        </div>
        <div className="min-w-0">
          <h2 className="truncate text-lg font-bold text-slate-900">{title}</h2>
          {(ticketNumber || subtitle) && (
            <div className="mt-0.5 flex flex-wrap items-center gap-2 text-xs text-slate-500">
              {ticketNumber && (
                <span className="font-mono font-medium text-slate-600">
                  {ticketNumber}
                </span>
              )}
              {subtitle}
            </div>
          )}
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-2">
        {actions}
        <button
          type="button"
          onClick={onClose}
          disabled={closeDisabled}
          aria-label="Close modal"
          className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <X className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}

export default TicketDetailModalHeader;

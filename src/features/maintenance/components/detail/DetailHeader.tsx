import { Wrench, X } from 'lucide-react';

interface DetailHeaderProps {
  ticketNumber: string;
  isBusy: boolean;
  onClose: () => void;
}

function DetailHeader({ ticketNumber, isBusy, onClose }: DetailHeaderProps) {
  return (
    <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
          <Wrench size={22} />
        </div>

        <div>
          <h2 className="text-lg font-bold text-slate-800">
            Maintenance Details
          </h2>

          <p className="mt-1 text-xs text-slate-500">
            {ticketNumber}
          </p>
        </div>
      </div>

      <button
        type="button"
        onClick={onClose}
        disabled={isBusy}
        aria-label="Close detail"
        className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 disabled:opacity-50"
      >
        <X size={20} />
      </button>
    </div>
  );
}

export default DetailHeader;
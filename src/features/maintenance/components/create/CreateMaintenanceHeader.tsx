import { ClipboardCheck, Wrench, X } from 'lucide-react';

interface CreateMaintenanceHeaderProps {
  isReviewing: boolean;
  isSubmitting: boolean;
  onClose: () => void;
}

function CreateMaintenanceHeader({ isReviewing, isSubmitting, onClose }: CreateMaintenanceHeaderProps) {
  return (
    <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
      <div className="flex items-center gap-3">
        <div
          className={`flex h-11 w-11 items-center justify-center rounded-xl transition ${
            isReviewing ? 'bg-emerald-50 text-emerald-600' : 'bg-blue-50 text-blue-600'
          }`}
        >
          {isReviewing ? <ClipboardCheck size={22} /> : <Wrench size={22} />}
        </div>

        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-slate-800">
              {isReviewing ? 'Review Maintenance Request' : 'New Maintenance Request'}
            </h2>
            <span
              className={`rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${
                isReviewing
                  ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                  : 'border-blue-200 bg-blue-50 text-blue-700'
              }`}
            >
              {isReviewing ? 'Step 2 of 2: Review' : 'Step 1 of 2: Fill Details'}
            </span>
          </div>

          <p className="mt-1 text-xs text-slate-500">
            {isReviewing
              ? 'Please review your maintenance request details carefully before submitting.'
              : 'Submit a maintenance request for an asset you use.'}
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
  );
}

export default CreateMaintenanceHeader;
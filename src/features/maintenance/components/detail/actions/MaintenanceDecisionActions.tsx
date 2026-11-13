
import {
  CheckCircle,
  LoaderCircle,
  XCircle,
} from 'lucide-react';

interface MaintenanceDecisionActionsProps {
  canReject: boolean;
  canApprove: boolean;
  isProcessing: boolean;
  note: string;
  onReject: () => void;
  onApprove: () => void;
}

export default function MaintenanceDecisionActions({
  canReject,
  canApprove,
  isProcessing,
  note,
  onReject,
  onApprove,
}: MaintenanceDecisionActionsProps) {
  return (
    <div className="flex flex-wrap justify-end gap-3">
      {canReject && (
        <button
          type="button"
          onClick={onReject}
          disabled={isProcessing || !note.trim()}
          className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
        >
          {isProcessing ? (
            <LoaderCircle size={17} className="animate-spin" />
          ) : (
            <XCircle size={17} />
          )}
          Reject
        </button>
      )}

      {canApprove && (
        <button
          type="button"
          onClick={onApprove}
          disabled={isProcessing}
          className="inline-flex items-center gap-2 rounded-xl bg-green-600 px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
        >
          {isProcessing ? (
            <LoaderCircle size={17} className="animate-spin" />
          ) : (
            <CheckCircle size={17} />
          )}
          Approve
        </button>
      )}
    </div>
  );
}

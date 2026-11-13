import {
  CheckCircle2,
  LoaderCircle,
  RotateCcw,
  Send,
  XCircle,
} from 'lucide-react';

import type { ProcurementAction } from '../../hooks/useProcurementActions';

interface DetailFooterProps {
  isProcessing: boolean;
  isEditing: boolean;
  onCloseOrCancel: () => void;

  // Resubmit (requester)
  showResubmit: boolean;
  isResubmitDisabled: boolean;
  onResubmit: () => void;

  // Approval (manager / finance)
  showApproval: boolean;
  canApprove: boolean;
  canRevise: boolean;
  canReject: boolean;
  hasNote: boolean;
  onAction: (action: ProcurementAction) => void;

  // Purchasing
  showReceiveGoods: boolean;
  hasProofFile: boolean;
  onReceiveGoods: () => void;
}

function ButtonIcon({
  isProcessing,
  icon: Icon,
}: {
  isProcessing: boolean;
  icon: typeof Send;
}) {
  return isProcessing ? (
    <LoaderCircle size={16} className="animate-spin" />
  ) : (
    <Icon size={16} />
  );
}

function DetailFooter({
  isProcessing,
  isEditing,
  onCloseOrCancel,
  showResubmit,
  isResubmitDisabled,
  onResubmit,
  showApproval,
  canApprove,
  canRevise,
  canReject,
  hasNote,
  onAction,
  showReceiveGoods,
  hasProofFile,
  onReceiveGoods,
}: DetailFooterProps) {
  return (
    <div className="flex flex-col-reverse justify-between gap-3 border-t border-slate-100 bg-white px-6 py-5 sm:flex-row sm:items-center">
      <button
        type="button"
        onClick={onCloseOrCancel}
        disabled={isProcessing}
        className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
      >
        {isEditing ? 'Cancel Editing' : 'Close'}
      </button>

      {/* RESUBMIT BUTTON */}
      {showResubmit && (
        <button
          type="button"
          onClick={onResubmit}
          disabled={isProcessing || isResubmitDisabled}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <ButtonIcon isProcessing={isProcessing} icon={Send} />
          Resubmit Request
        </button>
      )}

      {/* APPROVAL BUTTONS */}
      {showApproval && (
        <div className="flex flex-col gap-2 sm:flex-row">
          {canRevise && (
            <button
              type="button"
              onClick={() => onAction('revise')}
              disabled={isProcessing || !hasNote}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-700 transition hover:bg-amber-100 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <ButtonIcon isProcessing={isProcessing} icon={RotateCcw} />
              Revise
            </button>
          )}

          {canReject && (
            <button
              type="button"
              onClick={() => onAction('reject')}
              disabled={isProcessing || !hasNote}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-600 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <ButtonIcon isProcessing={isProcessing} icon={XCircle} />
              Reject
            </button>
          )}

          {canApprove && (
            <button
              type="button"
              onClick={() => onAction('approve')}
              disabled={isProcessing}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <ButtonIcon isProcessing={isProcessing} icon={CheckCircle2} />
              Approve
            </button>
          )}
        </div>
      )}

      {/* PURCHASING BUTTON */}
      {showReceiveGoods && (
        <button
          type="button"
          onClick={onReceiveGoods}
          disabled={isProcessing || !hasProofFile}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <ButtonIcon isProcessing={isProcessing} icon={CheckCircle2} />
          Mark as Purchased
        </button>
      )}
    </div>
  );
}

export default DetailFooter;
import type { TicketHistoryItem } from '../../types/procurement.types';

import NoteField from './NoteField';

interface ResubmitSectionProps {
  lastRevision?: TicketHistoryItem;
  note: string;
  isProcessing: boolean;
  onNoteChange: (value: string) => void;
}

// Catatan revisi terakhir dari approver + catatan requester saat resubmit.
function ResubmitSection({
  lastRevision,
  note,
  isProcessing,
  onNoteChange,
}: ResubmitSectionProps) {
  return (
    <section className="border-t border-slate-100 pt-6">
      <h3 className="mb-2 text-sm font-bold text-slate-800">
        Resubmit Request
      </h3>

      <p className="mb-4 text-xs text-slate-500">
        Please review your updated request details carefully before
        resubmitting for approval.
      </p>

      {lastRevision?.note && (
        <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
          <p className="text-xs font-semibold text-amber-700">
            Revision requested by {lastRevision.employeeName || '-'}
          </p>

          <p className="mt-1 whitespace-pre-wrap text-sm text-amber-800">
            {lastRevision.note}
          </p>
        </div>
      )}

      <NoteField
        id="procurement-resubmit-note"
        label="Revision Note"
        hint="(Optional)"
        placeholder="Explain what you have corrected..."
        value={note}
        disabled={isProcessing}
        onChange={onNoteChange}
      />
    </section>
  );
}

export default ResubmitSection;
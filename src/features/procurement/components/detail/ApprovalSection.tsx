import NoteField from './NoteField';

interface ApprovalSectionProps {
  note: string;
  isProcessing: boolean;
  onNoteChange: (value: string) => void;
}

// Catatan approver (wajib untuk Revise & Reject).
function ApprovalSection({
  note,
  isProcessing,
  onNoteChange,
}: ApprovalSectionProps) {
  return (
    <section className="border-t border-slate-100 pt-6">
      <h3 className="mb-2 text-sm font-bold text-slate-800">
        Approval Action
      </h3>

      <p className="mb-4 text-xs text-slate-400">
        Review this request and select an action.
      </p>

      <NoteField
        id="procurement-approval-note"
        label="Note"
        hint="(Required for Revise and Reject)"
        placeholder="Write your approval note..."
        value={note}
        disabled={isProcessing}
        onChange={onNoteChange}
      />
    </section>
  );
}

export default ApprovalSection;
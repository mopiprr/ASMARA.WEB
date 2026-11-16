import NoteField from './NoteField';

interface ResubmitSectionProps {
  note: string;
  isProcessing: boolean;
  onNoteChange: (value: string) => void;
}

// Catatan requester saat mengajukan ulang revisi.
function ResubmitSection({
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

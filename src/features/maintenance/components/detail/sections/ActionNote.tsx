import NoteField from '../../../../../components/common/NoteField';

interface ActionNoteProps {
  label?: string;
  required?: boolean;
  placeholder?: string;
  value: string;
  disabled: boolean;
  onChange: (value: string) => void;
}

// Textarea catatan (maks 200 karakter) — komponen yang sama dengan Procurement.
function ActionNote({
  label = 'Note',
  required = false,
  placeholder = 'Write a note or additional information...',
  value,
  disabled,
  onChange,
}: ActionNoteProps) {
  return (
    <div>
      <NoteField
        id="maintenance-action-note"
        label={label}
        hint={required ? '(Required)' : '(Optional)'}
        placeholder={placeholder}
        value={value}
        disabled={disabled}
        onChange={onChange}
      />
    </div>
  );
}

export default ActionNote;
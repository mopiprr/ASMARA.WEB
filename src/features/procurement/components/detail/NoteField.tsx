import { NOTE_MAX_LENGTH } from '../../utils/procurementDetail.utils';

import { detailInputClass } from './detailStyles';

interface NoteFieldProps {
  id: string;
  label: string;
  hint: string;
  placeholder: string;
  value: string;
  disabled: boolean;
  onChange: (value: string) => void;
}

// Textarea catatan (maks 200 karakter) yang dipakai di Resubmit, Approval, dan Purchasing.
function NoteField({
  id,
  label,
  hint,
  placeholder,
  value,
  disabled,
  onChange,
}: NoteFieldProps) {
  return (
    <>
      <label
        htmlFor={id}
        className="mb-2 block text-sm font-medium text-slate-700"
      >
        {label}
        <span className="ml-1 text-xs font-normal text-slate-400">
          {hint}
        </span>
      </label>

      <textarea
        id={id}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        maxLength={NOTE_MAX_LENGTH}
        rows={3}
        disabled={disabled}
        placeholder={placeholder}
        className={detailInputClass}
      />

      <p className="mt-1 text-right text-xs text-slate-400">
        {value.length}/{NOTE_MAX_LENGTH}
      </p>
    </>
  );
}

export default NoteField;
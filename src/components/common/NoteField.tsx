export const DEFAULT_NOTE_MAX_LENGTH = 200;

export const detailInputClass =
  'w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-50';

interface NoteFieldProps {
  id: string;
  label: string;
  hint?: string;
  helperText?: string;
  placeholder: string;
  value: string;
  disabled: boolean;
  required?: boolean;
  maxLength?: number;
  rows?: number;
  onChange: (value: string) => void;
}

// Textarea catatan dengan counter karakter (default maks 200 karakter sesuai validator backend).
function NoteField({
  id,
  label,
  hint,
  helperText,
  placeholder,
  value,
  disabled,
  required = false,
  maxLength = DEFAULT_NOTE_MAX_LENGTH,
  rows = 3,
  onChange,
}: NoteFieldProps) {
  return (
    <div>
      <label
        htmlFor={id}
        className="mb-2 block text-sm font-medium text-slate-700"
      >
        {label}
        {required && <span className="ml-0.5 text-red-500">*</span>}
        {hint && (
          <span className="ml-1 text-xs font-normal text-slate-400">
            {hint}
          </span>
        )}
      </label>

      <textarea
        id={id}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        maxLength={maxLength}
        rows={rows}
        disabled={disabled}
        placeholder={placeholder}
        className={detailInputClass}
      />

      <div className="mt-1 flex items-center justify-between gap-2 text-xs text-slate-400">
        <span>{helperText ?? ''}</span>
        <span>
          {value.length}/{maxLength}
        </span>
      </div>
    </div>
  );
}

export default NoteField;

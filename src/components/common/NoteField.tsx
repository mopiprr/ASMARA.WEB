export const DEFAULT_NOTE_MAX_LENGTH = 200;

export const detailInputClass =
  'w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-50';

interface NoteFieldProps {
  id: string;
  label: string;
  hint: string;
  placeholder: string;
  value: string;
  disabled: boolean;
  maxLength?: number;
  onChange: (value: string) => void;
}

function NoteField({
  id,
  label,
  hint,
  placeholder,
  value,
  disabled,
  maxLength = DEFAULT_NOTE_MAX_LENGTH,
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
        maxLength={maxLength}
        rows={3}
        disabled={disabled}
        placeholder={placeholder}
        className={detailInputClass}
      />

      <p className="mt-1 text-right text-xs text-slate-400">
        {value.length}/{maxLength}
      </p>
    </>
  );
}

export default NoteField;

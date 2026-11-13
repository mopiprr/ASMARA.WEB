import { ArrowDown, ArrowUp, ArrowUpDown } from 'lucide-react';

interface SortableHeaderProps<TField extends string> {
  field: TField;
  label: string;
  title: string;
  sortBy: TField;
  desc: boolean;
  onSort: (field: TField) => void;
}

// Kolom header tabel yang bisa diklik untuk sorting.
function SortableHeader<TField extends string>({
  field,
  label,
  title,
  sortBy,
  desc,
  onSort,
}: SortableHeaderProps<TField>) {
  const isActive = sortBy === field;

  return (
    <th
      onClick={() => onSort(field)}
      className="group cursor-pointer select-none px-6 py-3.5 transition hover:bg-slate-100/70"
      title={title}
    >
      <div className="flex items-center gap-1.5">
        <span className={isActive ? 'font-bold text-blue-600' : ''}>
          {label}
        </span>

        {!isActive ? (
          <ArrowUpDown
            size={13}
            className="text-slate-300 transition group-hover:text-slate-500"
          />
        ) : desc ? (
          <ArrowDown size={13} className="text-blue-600" />
        ) : (
          <ArrowUp size={13} className="text-blue-600" />
        )}
      </div>
    </th>
  );
}

export default SortableHeader;
import type { LucideIcon } from 'lucide-react';
import { RotateCcw } from 'lucide-react';

interface TableEmptyStateProps {
  colSpan: number;
  icon: LucideIcon;

  // Sedang mencari -> tampilkan teks "tidak ditemukan" + tombol Clear Search.
  isSearching: boolean;
  searchTitle: string;
  emptyTitle: string;
  emptyDescription: string;

  onClearSearch: () => void;
}

function TableEmptyState({
  colSpan,
  icon: Icon,
  isSearching,
  searchTitle,
  emptyTitle,
  emptyDescription,
  onClearSearch,
}: TableEmptyStateProps) {
  return (
    <tr>
      <td colSpan={colSpan} className="px-6 py-12 text-center">
        <div className="flex flex-col items-center justify-center">
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
            <Icon size={24} />
          </div>
          <p className="text-sm font-semibold text-slate-700">
            {isSearching ? searchTitle : emptyTitle}
          </p>
          <p className="mt-1 max-w-sm text-xs text-slate-400">
            {isSearching
              ? 'Try using another search keyword or clear the search query.'
              : emptyDescription}
          </p>
          {isSearching && (
            <button
              type="button"
              onClick={onClearSearch}
              className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-blue-700"
            >
              <RotateCcw size={13} />
              <span>Clear Search</span>
            </button>
          )}
        </div>
      </td>
    </tr>
  );
}

export default TableEmptyState;
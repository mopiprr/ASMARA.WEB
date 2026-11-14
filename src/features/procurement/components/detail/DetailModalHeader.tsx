import { Package, Pencil, X } from 'lucide-react';

interface DetailModalHeaderProps {
  ticketNumber: string;
  isProcessing: boolean;
  onClose: () => void;

  // Tombol "Edit Request" (hanya saat EMPLOYEE_REVISION untuk requester).
  // Ditaruh di header supaya tidak ikut ter-scroll bersama isi modal.
  canEdit: boolean;
  isEditing: boolean;
  onStartEditing: () => void;
}

function DetailModalHeader({
  ticketNumber,
  isProcessing,
  onClose,
  canEdit,
  isEditing,
  onStartEditing,
}: DetailModalHeaderProps) {
  return (
    <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
          <Package size={22} />
        </div>

        <div>
          <h2 className="text-lg font-bold text-slate-800">
            Procurement Details
          </h2>

          <p className="mt-1 flex items-center gap-2 text-xs text-slate-500">
            {ticketNumber}

            {isEditing && (
              <span className="rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-[11px] font-semibold text-amber-700">
                Editing
              </span>
            )}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {canEdit && !isEditing && (
          <button
            type="button"
            onClick={onStartEditing}
            disabled={isProcessing}
            className="inline-flex items-center gap-2 rounded-lg bg-blue-50 px-3 py-2 text-xs font-semibold text-blue-600 transition hover:bg-blue-100 disabled:opacity-50"
          >
            <Pencil size={14} />
            Edit Request
          </button>
        )}

        <button
          type="button"
          onClick={onClose}
          disabled={isProcessing}
          className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 disabled:opacity-50"
        >
          <X size={20} />
        </button>
      </div>
    </div>
  );
}

export default DetailModalHeader;
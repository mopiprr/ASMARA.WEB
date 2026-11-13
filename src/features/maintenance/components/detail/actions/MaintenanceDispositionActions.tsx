
import {
  ClipboardCheck,
  Trash2,
} from 'lucide-react';

interface MaintenanceDispositionActionsProps {
  canArchive: boolean;
  canDispose: boolean;
  isProcessing: boolean;
  onArchive: () => void;
  onDispose: () => void;
}

export default function MaintenanceDispositionActions({
  canArchive,
  canDispose,
  isProcessing,
  onArchive,
  onDispose,
}: MaintenanceDispositionActionsProps) {
  return (
    <div className="space-y-3 rounded-xl border border-amber-200 bg-amber-50/50 p-4">
      <div>
        <h4 className="text-sm font-semibold text-slate-800">
          Asset Disposition Decision
        </h4>
        <p className="mt-1 text-xs text-slate-500">
          Decide whether the unrepairable asset should be archived or disposed.
        </p>
      </div>

      <div className="flex flex-wrap justify-end gap-3">
        {canArchive && (
          <button
            type="button"
            onClick={onArchive}
            disabled={isProcessing}
            className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
          >
            <ClipboardCheck size={17} />
            Archive
          </button>
        )}

        {canDispose && (
          <button
            type="button"
            onClick={onDispose}
            disabled={isProcessing}
            className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
          >
            <Trash2 size={17} />
            Dispose
          </button>
        )}
      </div>
    </div>
  );
}

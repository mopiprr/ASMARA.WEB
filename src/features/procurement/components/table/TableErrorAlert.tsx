import { AlertCircle } from 'lucide-react';

interface TableErrorAlertProps {
  error: string;
  onRetry: () => void;
}

function TableErrorAlert({ error, onRetry }: TableErrorAlertProps) {
  if (!error) return null;

  return (
    <div className="m-5 flex items-center justify-between rounded-xl border border-rose-200 bg-rose-50 p-4 text-xs text-rose-800">
      <div className="flex items-center gap-2">
        <AlertCircle size={16} className="text-rose-600" />
        <span>{error}</span>
      </div>
      <button
        type="button"
        onClick={onRetry}
        className="rounded-lg bg-rose-600 px-3 py-1 font-semibold text-white transition hover:bg-rose-700"
      >
        Try Again
      </button>
    </div>
  );
}

export default TableErrorAlert;
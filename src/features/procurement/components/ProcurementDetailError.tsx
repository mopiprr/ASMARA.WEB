import { AlertCircle } from 'lucide-react';

interface ProcurementDetailErrorProps {
  message: string;
}

// Pesan saat detail tiket gagal dibuka.
function ProcurementDetailError({ message }: ProcurementDetailErrorProps) {
  if (!message) return null;

  return (
    <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4">
      <AlertCircle
        size={20}
        className="mt-0.5 shrink-0 text-red-500"
      />

      <div>
        <p className="text-sm font-semibold text-red-700">
          Failed to open procurement ticket
        </p>

        <p className="mt-1 text-xs text-red-600">
          {message}
        </p>
      </div>
    </div>
  );
}

export default ProcurementDetailError;
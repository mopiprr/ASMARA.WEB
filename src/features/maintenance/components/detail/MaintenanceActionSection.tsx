
import { AlertCircle } from 'lucide-react';
import type { ReactNode } from 'react';

interface MaintenanceActionSectionProps {
  error: string;
  actionError: string;
  children: ReactNode;
}

export default function MaintenanceActionSection({
  error,
  actionError,
  children,
}: MaintenanceActionSectionProps) {
  return (
    <>
      {(error || actionError) && (
        <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4">
          <AlertCircle
            size={18}
            className="mt-0.5 shrink-0 text-red-500"
          />
          <p className="text-sm text-red-700">
            {error || actionError}
          </p>
        </div>
      )}

      {children}
    </>
  );
}

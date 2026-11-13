import { AlertCircle, CheckCircle2, FileText } from 'lucide-react';

interface CreateRequestAlertsProps {
  errorMessage: string;
  successMessage: string;
  parentTicketId: string | null;
}

// Pesan error / sukses + info tiket maintenance induk (jika ada).
function CreateRequestAlerts({
  errorMessage,
  successMessage,
  parentTicketId,
}: CreateRequestAlertsProps) {
  return (
    <>
      {/* ERROR MESSAGE (API OR VALIDATION) */}
      {errorMessage && (
        <div className="mb-6 flex gap-3 rounded-xl border border-red-200 bg-red-50 p-4 animate-in fade-in duration-150">
          <AlertCircle
            size={19}
            className="mt-0.5 shrink-0 text-red-500"
          />

          <div>
            <p className="text-sm font-semibold text-red-700">
              Notice
            </p>

            <p className="mt-1 text-xs text-red-600">
              {errorMessage}
            </p>
          </div>
        </div>
      )}

      {/* SUCCESS MESSAGE */}
      {successMessage && (
        <div className="mb-6 flex gap-3 rounded-xl border border-green-200 bg-green-50 p-4 animate-in fade-in duration-150">
          <CheckCircle2
            size={19}
            className="mt-0.5 shrink-0 text-green-600"
          />

          <div>
            <p className="text-sm font-semibold text-green-700">
              Request Submitted
            </p>

            <p className="mt-1 text-xs text-green-600">
              {successMessage}
            </p>
          </div>
        </div>
      )}

      {/* MAINTENANCE PARENT INFO */}
      {parentTicketId && (
        <div className="mb-6 flex gap-3 rounded-xl border border-blue-100 bg-blue-50 p-4">
          <FileText
            size={19}
            className="mt-0.5 shrink-0 text-blue-600"
          />

          <div>
            <p className="text-sm font-semibold text-blue-800">
              Linked Maintenance Ticket
            </p>

            <p className="mt-1 break-all text-xs text-blue-600">
              This procurement request is linked to maintenance
              ticket: {parentTicketId}
            </p>
          </div>
        </div>
      )}
    </>
  );
}

export default CreateRequestAlerts;
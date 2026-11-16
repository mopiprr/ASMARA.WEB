import type { ReactNode } from 'react';

import type { MaintenanceTicket } from '../../types/maintenance.types';

import { formatDateTime } from '../../utils/maintenance.utils';

interface TicketInfoSectionProps {
  ticket: MaintenanceTicket;
}

function Field({ label, children, wide = false }: { label: string; children: ReactNode; wide?: boolean }) {
  return (
    <div className={wide ? 'sm:col-span-2' : ''}>
      <p className="text-xs text-slate-400">{label}</p>
      <div className="mt-1 text-sm font-semibold text-slate-800">{children}</div>
    </div>
  );
}

// Informasi tiket (sama dengan "Request Information" di Procurement).
function TicketInfoSection({ ticket }: TicketInfoSectionProps) {
  return (
    <section>
      <h3 className="mb-4 text-sm font-bold text-slate-800">
        Request Information
      </h3>

      <div className="grid grid-cols-1 gap-4 rounded-xl border border-slate-200 p-4 sm:grid-cols-2">
        <Field label="Request Subject" wide>
          {ticket.subject}
        </Field>

        <Field label="Requester">
          {ticket.employeeName || '-'}
          {ticket.requesterDepartment && (
            <span className="ml-1 text-xs font-normal text-slate-500">
              ({ticket.requesterDepartment})
            </span>
          )}
        </Field>

        <Field label="Current Step">
          <span className="text-blue-600">{ticket.currentStep || '-'}</span>
        </Field>

        <Field label="Created At">
          {formatDateTime(ticket.createdAt)}
        </Field>

        <Field label="Assigned Handler">
          {ticket.assignedTo || '-'}
        </Field>

        <Field label="Description" wide>
          <p className="whitespace-pre-wrap font-normal text-slate-700">
            {ticket.description || '-'}
          </p>
        </Field>
      </div>
    </section>
  );
}

export default TicketInfoSection;
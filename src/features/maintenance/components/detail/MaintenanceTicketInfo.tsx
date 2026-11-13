
import type { MaintenanceTicket } from '../../types/maintenance.types';
import { formatDate } from '../../utils/maintenance-detail.utils';

interface MaintenanceTicketInfoProps {
  ticket: MaintenanceTicket;
}

function MaintenanceTicketInfo({
  ticket,
}: MaintenanceTicketInfoProps) {
  return (
    <>
      {/* TICKET INFORMATION */}
      <div>
        <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
          Ticket Number
        </p>
        <p className="mt-1 font-semibold text-blue-600">
          {ticket.ticketNumber}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <div>
          <p className="text-xs text-slate-400">Subject</p>
          <p className="mt-1 text-sm font-medium text-slate-800">
            {ticket.subject}
          </p>
        </div>

        <div>
          <p className="text-xs text-slate-400">Requester</p>
          <p className="mt-1 text-sm font-medium text-slate-800">
            {ticket.employeeName || '-'}
          </p>
        </div>

        <div>
          <p className="text-xs text-slate-400">Assigned Handler</p>
          <p className="mt-1 text-sm font-medium text-slate-800">
            {ticket.assignedTo || '-'}
          </p>
        </div>

        <div>
          <p className="text-xs text-slate-400">Created Date</p>
          <p className="mt-1 text-sm font-medium text-slate-800">
            {formatDate(ticket.createdAt)}
          </p>
        </div>
      </div>

      <div className="rounded-xl bg-slate-50 p-4">
        <p className="text-xs text-slate-400">Current Step</p>
        <p className="mt-1 text-sm font-semibold text-slate-800">
          {ticket.currentStep}
        </p>
      </div>

      <div>
        <p className="text-xs text-slate-400">Description</p>
        <p className="mt-1 whitespace-pre-wrap text-sm text-slate-700">
          {ticket.description || '-'}
        </p>
      </div>

      {/* ASSET INFORMATION */}
      <div className="rounded-xl border border-slate-200 p-4">
        <h3 className="text-sm font-semibold text-slate-800">
          Asset Information
        </h3>

        {ticket.maintenanceDetail ? (
          <div className="mt-3 space-y-2 text-sm">
            <p>
              <span className="text-slate-400">Asset Tag: </span>
              <span className="font-medium text-slate-700">
                {ticket.maintenanceDetail.assetTag || '-'}
              </span>
            </p>

            <p>
              <span className="text-slate-400">
                Problem Description:{' '}
              </span>
              <span className="text-slate-700">
                {ticket.maintenanceDetail.description || '-'}
              </span>
            </p>

            <p>
              <span className="text-slate-400">Handler Note: </span>
              <span className="text-slate-700">
                {ticket.maintenanceDetail.handlerNote || '-'}
              </span>
            </p>
          </div>
        ) : (
          <p className="mt-3 text-sm text-slate-400">
            No maintenance detail available.
          </p>
        )}
      </div>
    </>
  );
}

export default MaintenanceTicketInfo;

import type { MaintenanceTicket } from '../../types/maintenance.types';
import { formatDate } from '../../utils/maintenance-detail.utils';
import MaintenanceStatusBadge from '../MaintenanceStatusBadge';

interface MaintenanceTicketInfoProps {
  ticket: MaintenanceTicket;
}

const REPAIR_RESULT_LABELS: Record<number, string> = {
  1: 'Repaired',
  2: 'Unrepairable',
  3: 'Need Spare Part',
};

function MaintenanceTicketInfo({ ticket }: MaintenanceTicketInfoProps) {
  const detail = ticket.maintenanceDetail;

  return (
    <div className="space-y-6">
      {/* REQUEST INFORMATION */}
      <div className="space-y-5 rounded-xl border border-slate-200 p-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h3 className="text-sm font-semibold text-slate-800">
            Request Information
          </h3>
          <MaintenanceStatusBadge step={ticket.currentStep} />
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
            <p className="text-xs text-slate-400">Created At</p>
            <p className="mt-1 text-sm font-medium text-slate-800">
              {formatDate(ticket.createdAt)}
            </p>
          </div>
        </div>

        <div>
          <p className="text-xs text-slate-400">Description</p>
          <p className="mt-1 whitespace-pre-wrap text-sm text-slate-700">
            {ticket.description || '-'}
          </p>
        </div>
      </div>

      {/* ASSET INFORMATION */}
      <div className="space-y-4 rounded-xl border border-slate-200 p-5">
        <h3 className="text-sm font-semibold text-slate-800">
          Asset Information
        </h3>

        {detail ? (
          <>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <div>
                <p className="text-xs text-slate-400">Asset Tag</p>
                <p className="mt-1 font-mono text-sm font-medium text-slate-800">
                  {detail.assetTag || '-'}
                </p>
              </div>

              <div>
                <p className="text-xs text-slate-400">Repair Result</p>
                <p className="mt-1 text-sm font-medium text-slate-800">
                  {detail.repairResult !== null &&
                  detail.repairResult !== undefined
                    ? REPAIR_RESULT_LABELS[detail.repairResult] || '-'
                    : '-'}
                </p>
              </div>

              {detail.replacementAssetTag && (
                <div>
                  <p className="text-xs text-slate-400">Replacement Asset</p>
                  <p className="mt-1 font-mono text-sm font-medium text-slate-800">
                    {detail.replacementAssetTag}
                  </p>
                </div>
              )}
            </div>

            <div>
              <p className="text-xs text-slate-400">Problem Description</p>
              <p className="mt-1 whitespace-pre-wrap text-sm text-slate-700">
                {detail.description || '-'}
              </p>
            </div>

            {detail.handlerNote && (
              <div>
                <p className="text-xs text-slate-400">Handler Note</p>
                <p className="mt-1 whitespace-pre-wrap text-sm text-slate-700">
                  {detail.handlerNote}
                </p>
              </div>
            )}
          </>
        ) : (
          <p className="text-sm text-slate-400">
            No maintenance detail available.
          </p>
        )}
      </div>
    </div>
  );
}

export default MaintenanceTicketInfo;

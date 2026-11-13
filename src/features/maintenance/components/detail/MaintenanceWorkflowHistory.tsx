
import type { MaintenanceTicket } from '../../types/maintenance.types';
import { formatDate } from '../../utils/maintenance-detail.utils';

interface MaintenanceWorkflowHistoryProps {
  ticket: MaintenanceTicket;
}

function MaintenanceWorkflowHistory({
  ticket,
}: MaintenanceWorkflowHistoryProps) {
  return (
    <div>
      <h3 className="text-sm font-semibold text-slate-800">
        Workflow History
      </h3>

      <div className="mt-3 space-y-3">
        {ticket.history?.length ? (
          ticket.history.map((item, index) => (
            <div
              key={`${item.createdAt}-${index}`}
              className="rounded-xl border border-slate-100 p-4"
            >
              <p className="text-sm font-semibold text-slate-800">
                {item.actionLabel}
              </p>

              <p className="mt-1 text-xs text-slate-500">
                {item.fromStep} → {item.toStep}
              </p>

              <p className="mt-2 text-xs text-slate-500">
                {item.employeeName || 'System'} ·{' '}
                {formatDate(item.createdAt)}
              </p>

              {item.note && (
                <p className="mt-2 whitespace-pre-wrap text-sm text-slate-600">
                  {item.note}
                </p>
              )}
            </div>
          ))
        ) : (
          <p className="text-sm text-slate-400">
            No workflow history available.
          </p>
        )}
      </div>
    </div>
  );
}

export default MaintenanceWorkflowHistory;

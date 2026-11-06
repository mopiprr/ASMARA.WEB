import { useState } from 'react';

import { ChevronDown, History } from 'lucide-react';

import type { TicketHistoryItem } from '../../features/procurement/types/procurement.types';

interface TicketHistorySectionProps {
  history?: TicketHistoryItem[] | null;
  defaultExpanded?: boolean;
}

// Warna badge & titik timeline berdasarkan jenis aksi.
function getActionTone(action: string | null) {
  switch (action) {
    case 'Approve':
    case 'ReceiveGoods':
    case 'Repaired':
    case 'Close':
    case 'ChildCompleted':
    case 'PartAvailable':
    case 'ReplacementAvailable':
      return { badge: 'bg-emerald-50 text-emerald-700', dot: 'bg-emerald-500' };

    case 'Revise':
    case 'NeedPart':
    case 'PartUnavailable':
    case 'OrderPart':
    case 'ReplacementUnavailable':
      return { badge: 'bg-amber-50 text-amber-700', dot: 'bg-amber-500' };

    case 'Reject':
    case 'Cancel':
    case 'Unrepairable':
    case 'ChildRejected':
    case 'Dispose':
      return { badge: 'bg-red-50 text-red-600', dot: 'bg-red-500' };

    case 'Create':
    case 'Resubmit':
    case 'Send':
    case 'Receive':
    case 'AssignHandler':
    case 'Archive':
      return { badge: 'bg-blue-50 text-blue-600', dot: 'bg-blue-500' };

    default:
      return { badge: 'bg-slate-100 text-slate-600', dot: 'bg-slate-400' };
  }
}

// Peran pelaku dilihat dari step tempat ia bertindak (fromStep).
function getActorRole(fromStep: string) {
  switch (fromStep) {
    case 'CREATED':
    case 'EMPLOYEE_REVISION':
    case 'REQUESTER_SEND_ITEM':
    case 'REQUESTER_RECEIVE_ITEM':
    case 'REQUESTER_CLOSE':
      return 'Requester';

    case 'DEPARTMENT_APPROVAL':
      return 'Department Manager';

    case 'FINANCE_APPROVAL':
      return 'Finance';

    case 'PURCHASING':
      return 'Purchasing';

    case 'IT_SUPPORT_REVIEW':
      return 'IT Support';

    case 'HANDLER_RECEIVE_ITEM':
    case 'REPAIR_IN_PROGRESS':
    case 'HANDLER_RECEIVE_PART':
    case 'HANDLER_ORDER_PART':
    case 'HANDLER_RETURN_ITEM':
      return 'Handler';

    case 'INVENTORY_PART_CHECK':
    case 'INVENTORY_DISPOSE':
    case 'INVENTORY_ARCHIVE':
    case 'INVENTORY_SEND_REPLACEMENT':
      return 'Inventory';

    case 'DIVISION_MANAGER_REVIEW':
      return 'Division Manager';

    case 'WAITING_FOR_PART':
    case 'WAITING_FOR_REPLACEMENT':
      return 'System';          // otomatis saat tiket child selesai / ditolak

    default:
      return null;
  }
}

function formatDateTime(value: string) {
  const date = new Date(value);
  const pad = (n: number) => n.toString().padStart(2, '0');

  return `${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${date.getFullYear()} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function TicketHistorySection({
  history,
  defaultExpanded = false,
}: TicketHistorySectionProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  const entries = history ?? [];
  const lastEntry = entries.length > 0 ? entries[entries.length - 1] : null;

  return (
    <section className="border-t border-slate-100 pt-6">
      {/* HEADER (klik untuk buka/tutup) */}
      <button
        type="button"
        onClick={() => setIsExpanded((previous) => !previous)}
        aria-expanded={isExpanded}
        aria-controls="ticket-history-list"
        className="flex w-full items-center justify-between gap-3 rounded-xl px-1 py-1 text-left transition hover:bg-slate-50"
      >
        <div className="flex min-w-0 items-center gap-2">
          <History size={17} className="shrink-0 text-slate-500" />

          <div className="min-w-0">
            <h3 className="text-sm font-bold text-slate-800">
              Ticket History ({entries.length})
            </h3>

            {!isExpanded && lastEntry && (
              <p className="mt-0.5 truncate text-xs text-slate-400">
                Last: {lastEntry.actionLabel} by {lastEntry.employeeName || '-'}
                {' · '}
                {formatDateTime(lastEntry.createdAt)}
              </p>
            )}
          </div>
        </div>

        <ChevronDown
          size={18}
          className={`shrink-0 text-slate-400 transition-transform duration-200 ${
            isExpanded ? 'rotate-180' : ''
          }`}
        />
      </button>

      {/* ISI */}
      {isExpanded && (
        <div id="ticket-history-list" className="mt-4">
          {entries.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-200 p-6 text-center text-sm text-slate-400">
              No history yet.
            </div>
          ) : (
            <ol className="relative ml-2 space-y-5 border-l border-slate-200 pl-6">
              {entries.map((entry, index) => {
                const tone = getActionTone(entry.action);

                return (
                  <li key={`${entry.createdAt}-${index}`} className="relative">
                    {/* titik timeline */}
                    <span
                      className={`absolute -left-[30px] top-1.5 h-2.5 w-2.5 rounded-full ring-4 ring-white ${tone.dot}`}
                    />

                    <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className={`rounded-md px-2 py-0.5 text-xs font-semibold ${tone.badge}`}
                        >
                          {entry.actionLabel}
                        </span>

                        <span className="text-sm font-semibold text-slate-800">
                          {entry.employeeName || '-'}
                          {getActorRole(entry.fromStep) && (
                            <span className="ml-1 font-normal text-slate-400">
                              ({getActorRole(entry.fromStep)})
                            </span>
                          )}
                        </span>
                      </div>

                      <span className="text-xs text-slate-400">
                        {formatDateTime(entry.createdAt)}
                      </span>
                    </div>

                    {entry.note && (
                      <p className="mt-2 whitespace-pre-wrap rounded-lg bg-slate-50 px-3 py-2 text-sm text-slate-700">
                        {entry.note}
                      </p>
                    )}
                  </li>
                );
              })}
            </ol>
          )}
        </div>
      )}
    </section>
  );
}

export default TicketHistorySection;
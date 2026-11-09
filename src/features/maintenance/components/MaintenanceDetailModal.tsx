import { useEffect, useState } from 'react';
import {
  AlertCircle,
  CheckCircle,
  LoaderCircle,
  Send,
  UserRoundCog,
  X,
  XCircle,
} from 'lucide-react';

import type {
  AssignMaintenanceHandlerPayload,
  MaintenanceHandlerOption,
  MaintenanceNotePayload,
  MaintenanceTicket,
} from '../types/maintenance.types';

interface MaintenanceDetailModalProps {
  ticket: MaintenanceTicket | null;
  isLoading: boolean;
  isProcessing: boolean;
  error: string;
  actionError: string;

  handlers: MaintenanceHandlerOption[];
  isLoadingHandlers: boolean;
  handlerError: string;

  onClose: () => void;
  onApprove: (payload: MaintenanceNotePayload) => Promise<void>;
  onReject: (payload: MaintenanceNotePayload) => Promise<void>;
  onAssignHandler: (
    payload: AssignMaintenanceHandlerPayload,
  ) => Promise<void>;
  onSendItem: (payload: MaintenanceNotePayload) => Promise<void>;
  onReceiveItem: (payload: MaintenanceNotePayload) => Promise<void>;

  onRefreshHandlers: () => void;
}

function formatDate(value: string | null) {
  if (!value) return '-';

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return '-';

  return date.toLocaleString('id-ID', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
}

function MaintenanceDetailModal({
  ticket,
  isLoading,
  isProcessing,
  error,
  actionError,
  handlers,
  isLoadingHandlers,
  handlerError,
  onClose,
  onApprove,
  onReject,
  onAssignHandler,
  onSendItem,
  onReceiveItem,
  onRefreshHandlers,
}: MaintenanceDetailModalProps) {
  const [note, setNote] = useState('');
  const [selectedHandlerId, setSelectedHandlerId] = useState('');

  useEffect(() => {
    setNote('');
    setSelectedHandlerId('');
  }, [ticket?.id]);

  if (!ticket && !isLoading) return null;

  const handleApprove = async () => {
    await onApprove({
      note: note.trim() || undefined,
    });
  };

  const handleReject = async () => {
    if (!note.trim()) return;

    await onReject({
      note: note.trim(),
    });
  };

  const handleAssignHandler = async () => {
    if (!selectedHandlerId) return;

    await onAssignHandler({
      technicianId: selectedHandlerId,
      instructionNote: note.trim() || undefined,
    });
  };

  const handleSendItem = async () => {
    await onSendItem({
      note: note.trim() || undefined,
    });
  };

  const handleReceiveItem = async () => {
    await onReceiveItem({
      note: note.trim() || undefined,
    });
  };

  const showDecisionActions =
    ticket?.canApprove || ticket?.canReject;

  const showAssignmentAction = ticket?.canAssignHandler;
  const showSendItemAction = ticket?.canSendItem;
  const showReceiveItemAction = ticket?.canReceiveItem;

  const hasActions =
    showDecisionActions ||
    showAssignmentAction ||
    showSendItemAction ||
    showReceiveItemAction;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/50 p-4">
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-xl">
        {/* HEADER */}
        <div className="flex items-center justify-between border-b border-slate-100 p-5">
          <div>
            <h2 className="text-lg font-bold text-slate-800">
              Maintenance Details
            </h2>

            <p className="mt-1 text-xs text-slate-500">
              Ticket information and workflow actions
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={isLoading || isProcessing}
            className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 disabled:opacity-50"
            aria-label="Close detail"
          >
            <X size={20} />
          </button>
        </div>

        {/* LOADING */}
        {isLoading ? (
          <div className="p-12 text-center">
            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />

            <p className="mt-3 text-sm text-slate-500">
              Loading maintenance detail...
            </p>
          </div>
        ) : ticket ? (
          <div className="space-y-6 p-6">
            {/* TICKET NUMBER */}
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                Ticket Number
              </p>

              <p className="mt-1 font-semibold text-blue-600">
                {ticket.ticketNumber}
              </p>
            </div>

            {/* BASIC INFORMATION */}
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
                <p className="text-xs text-slate-400">
                  Assigned Handler
                </p>
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

            {/* CURRENT STEP */}
            <div className="rounded-xl bg-slate-50 p-4">
              <p className="text-xs text-slate-400">Current Step</p>
              <p className="mt-1 text-sm font-semibold text-slate-800">
                {ticket.currentStep}
              </p>
            </div>

            {/* DESCRIPTION */}
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

            {/* WORKFLOW HISTORY */}
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

            {/* ERROR */}
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

            {/* ACTIONS */}
            {hasActions ? (
              <div className="space-y-4 border-t border-slate-100 pt-5">
                <div>
                  <h3 className="text-sm font-semibold text-slate-800">
                    Maintenance Actions
                  </h3>

                  <p className="mt-1 text-xs text-slate-500">
                    Available actions depend on your role and the current workflow step.
                  </p>
                </div>

                {/* ASSIGN HANDLER */}

{/* ASSIGN HANDLER */}
{showAssignmentAction && (
  <div className="space-y-3 rounded-xl border border-slate-200 p-4">
    <div className="flex items-center gap-2">
      <UserRoundCog size={18} className="text-blue-600" />

      <h4 className="text-sm font-semibold text-slate-800">
        Assign Maintenance Handler
      </h4>
    </div>

    <div>
      <div className="mb-2 flex items-center justify-between">
        <label
          htmlFor="maintenanceHandler"
          className="text-sm font-medium text-slate-700"
        >
          Select Handler
        </label>

        <button
          type="button"
          onClick={onRefreshHandlers}
          disabled={isLoadingHandlers || isProcessing}
          className="text-xs font-medium text-blue-600 hover:text-blue-700 disabled:opacity-50"
        >
          {isLoadingHandlers ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>

      <select
        id="maintenanceHandler"
        value={selectedHandlerId}
        onChange={(event) => setSelectedHandlerId(event.target.value)}
        disabled={
          isLoadingHandlers ||
          isProcessing ||
          handlers.length === 0
        }
        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-100"
      >
        <option value="">
          {isLoadingHandlers
            ? 'Loading maintenance handlers...'
            : handlers.length === 0
              ? 'No handlers available'
              : 'Select a maintenance handler'}
        </option>

        {handlers.map((handler) => (
          <option
            key={handler.employeeId}
            value={handler.employeeId}
          >
            {handler.fullName} ({handler.employeeNumber})
          </option>
        ))}
      </select>

      {handlerError && (
        <p className="mt-2 text-xs text-red-600">
          {handlerError}
        </p>
      )}

      {!isLoadingHandlers &&
        !handlerError &&
        handlers.length === 0 && (
          <p className="mt-2 text-xs text-slate-400">
            No active maintenance handlers available.
          </p>
        )}

      {handlers.length > 0 && (
        <p className="mt-2 text-xs text-slate-400">
          {handlers.length} maintenance handler(s) available.
        </p>
      )}
    </div>

    <button
      type="button"
      onClick={handleAssignHandler}
      disabled={
        isProcessing ||
        isLoadingHandlers ||
        !selectedHandlerId
      }
      className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
    >
      {isProcessing ? (
        <LoaderCircle size={17} className="animate-spin" />
      ) : (
        <UserRoundCog size={17} />
      )}

      Assign Handler
    </button>
  </div>
)}


                {/* SHARED ACTION NOTE */}
                <div>
                  <label
                    htmlFor="maintenanceActionNote"
                    className="mb-2 block text-sm font-medium text-slate-700"
                  >
                    Action Note
                    {ticket.canReject && (
                      <span className="ml-1 text-red-500">*</span>
                    )}
                  </label>

                  <textarea
                    id="maintenanceActionNote"
                    value={note}
                    onChange={(event) => setNote(event.target.value)}
                    rows={3}
                    placeholder="Write a note or additional information..."
                    disabled={isProcessing}
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-50"
                  />

                  {ticket.canReject && (
                    <p className="mt-1 text-xs text-slate-400">
                      A rejection reason is required.
                    </p>
                  )}
                </div>

                {/* DECISION ACTIONS */}
                {showDecisionActions && (
                  <div className="flex flex-wrap justify-end gap-3">
                    {ticket.canReject && (
                      <button
                        type="button"
                        onClick={handleReject}
                        disabled={isProcessing || !note.trim()}
                        className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {isProcessing ? (
                          <LoaderCircle
                            size={17}
                            className="animate-spin"
                          />
                        ) : (
                          <XCircle size={17} />
                        )}
                        Reject
                      </button>
                    )}

                    {ticket.canApprove && (
                      <button
                        type="button"
                        onClick={handleApprove}
                        disabled={isProcessing}
                        className="inline-flex items-center gap-2 rounded-xl bg-green-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {isProcessing ? (
                          <LoaderCircle
                            size={17}
                            className="animate-spin"
                          />
                        ) : (
                          <CheckCircle size={17} />
                        )}
                        Approve
                      </button>
                    )}
                  </div>
                )}

                {/* REQUESTER SEND ITEM */}
                {showSendItemAction && (
                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={handleSendItem}
                      disabled={isProcessing}
                      className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {isProcessing ? (
                        <LoaderCircle
                          size={17}
                          className="animate-spin"
                        />
                      ) : (
                        <Send size={17} />
                      )}
                      Send Item
                    </button>
                  </div>
                )}

                {/* HANDLER RECEIVE ITEM */}
                {showReceiveItemAction && (
                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={handleReceiveItem}
                      disabled={isProcessing}
                      className="inline-flex items-center gap-2 rounded-xl bg-green-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {isProcessing ? (
                        <LoaderCircle
                          size={17}
                          className="animate-spin"
                        />
                      ) : (
                        <CheckCircle size={17} />
                      )}
                      Receive Item
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex justify-end border-t border-slate-100 pt-4">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={isProcessing}
                  className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
                >
                  Close
                </button>
              </div>
            )}
          </div>
        ) : null}
      </div>
    </div>
  );
}

export default MaintenanceDetailModal;
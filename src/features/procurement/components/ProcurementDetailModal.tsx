import { useState } from 'react';

import {
  X,
  Package,
  CheckCircle2,
  RotateCcw,
  XCircle,
  AlertCircle,
  LoaderCircle,
  FileText,
} from 'lucide-react';

import type { ProcurementTicket } from '../types/procurement.types';
import type { ProcurementAction } from '../hooks/useProcurementActions';

import { formatIDR } from '../utils/procurement.utils';

interface ProcurementDetailModalProps {
  ticket: ProcurementTicket | null;
  isProcessing: boolean;
  actionError: string;

  canApprove: boolean;
  canRevise: boolean;
  canReject: boolean;
  canReceiveGoods: boolean;

  onClose: () => void;

  onAction: (
    action: ProcurementAction,
    note: string
  ) => Promise<boolean>;

  onReceiveGoods: (
    note: string
  ) => Promise<boolean>;
}

function ProcurementDetailModal({
  ticket,
  isProcessing,
  actionError,
  canApprove,
  canRevise,
  canReject,
  canReceiveGoods,
  onClose,
  onAction,
  onReceiveGoods,
}: ProcurementDetailModalProps) {
  const [note, setNote] = useState('');

  if (!ticket) return null;

  const currentStep = ticket.currentStep?.toUpperCase();

  const isApprovalStep =
    currentStep === 'DEPARTMENT_APPROVAL' ||
    currentStep === 'FINANCE_APPROVAL';

  const canShowApprovalActions =
    isApprovalStep &&
    (canApprove || canRevise || canReject);

  const canShowReceiveGoods =
    canReceiveGoods &&
    currentStep === 'PURCHASING';

  const items = ticket.procurementDetails ?? [];

  const estimatedTotal = items.reduce(
    (total, item) => total + item.totalPrice,
    0
  );

  const handleAction = async (action: ProcurementAction) => {
    if (isProcessing) return;

    if (action !== 'approve' && !note.trim()) {
      return;
    }

    const success = await onAction(action, note);

    if (success) {
      setNote('');
      onClose();
    }
  };

  const handleReceiveGoods = async () => {
    if (isProcessing || !canShowReceiveGoods) return;

    const success = await onReceiveGoods(note);

    if (success) {
      setNote('');
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm"
      onMouseDown={(event) => {
        if (
          event.target === event.currentTarget &&
          !isProcessing
        ) {
          onClose();
        }
      }}
    >
      <div className="flex max-h-[92vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">

        {/* HEADER */}
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <Package size={22} />
            </div>

            <div>
              <h2 className="text-lg font-bold text-slate-800">
                Procurement Details
              </h2>

              <p className="mt-1 text-xs text-slate-500">
                {ticket.ticketNumber}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={isProcessing}
            className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 disabled:opacity-50"
          >
            <X size={20} />
          </button>
        </div>

        {/* BODY */}
        <div className="min-h-0 flex-1 space-y-6 overflow-y-auto px-6 py-6">

          {/* REQUEST INFORMATION */}
          <section>
            <h3 className="mb-4 text-sm font-bold text-slate-800">
              Request Information
            </h3>

            <div className="grid grid-cols-1 gap-4 rounded-xl border border-slate-200 p-4 sm:grid-cols-2">

              <div>
                <p className="text-xs text-slate-400">
                  Request Subject
                </p>

                <p className="mt-1 text-sm font-semibold text-slate-800">
                  {ticket.subject}
                </p>
              </div>

              <div>
                <p className="text-xs text-slate-400">
                  Requester
                </p>

                <p className="mt-1 text-sm font-semibold text-slate-800">
                  {ticket.employeeName || '-'}
                </p>
              </div>

              <div>
                <p className="text-xs text-slate-400">
                  Current Step
                </p>

                <p className="mt-1 text-sm font-semibold text-blue-600">
                  {ticket.currentStep || '-'}
                </p>
              </div>

              <div>
                <p className="text-xs text-slate-400">
                  Created At
                </p>

                <p className="mt-1 text-sm font-semibold text-slate-800">
                  {new Date(ticket.createdAt).toLocaleString('id-ID')}
                </p>
              </div>

              <div className="sm:col-span-2">
                <p className="text-xs text-slate-400">
                  Description
                </p>

                <p className="mt-1 whitespace-pre-wrap text-sm text-slate-700">
                  {ticket.description || '-'}
                </p>
              </div>

            </div>
          </section>

          {/* PROCUREMENT ITEMS */}
          <section>
            <div className="mb-4 flex items-center gap-2">
              <FileText size={17} className="text-slate-500" />

              <h3 className="text-sm font-bold text-slate-800">
                Procurement Items ({items.length})
              </h3>
            </div>

            {items.length === 0 ? (
              <div className="rounded-xl border border-dashed border-slate-200 p-6 text-center text-sm text-slate-400">
                No procurement items found.
              </div>
            ) : (
              <div className="overflow-x-auto rounded-xl border border-slate-200">
                <table className="w-full min-w-[600px] text-left text-sm">
                  <thead className="bg-slate-50 text-xs text-slate-500">
                    <tr>
                      <th className="px-4 py-3">Item</th>
                      <th className="px-4 py-3">Category</th>
                      <th className="px-4 py-3 text-center">
                        Quantity
                      </th>
                      <th className="px-4 py-3 text-right">
                        Price
                      </th>
                      <th className="px-4 py-3 text-right">
                        Subtotal
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-100">
                    {items.map((item, index) => (
                      <tr key={`${item.itemId}-${index}`}>
                        <td className="px-4 py-3 font-medium text-slate-800">
                          {item.itemName}
                        </td>

                        <td className="px-4 py-3 text-slate-600">
                          {item.categoryName}
                        </td>

                        <td className="px-4 py-3 text-center text-slate-600">
                          {item.quantity}
                        </td>

                        <td className="px-4 py-3 text-right text-slate-600">
                          {formatIDR(item.price)}
                        </td>

                        <td className="px-4 py-3 text-right font-semibold text-slate-800">
                          {formatIDR(item.totalPrice)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <div className="mt-4 flex items-center justify-between rounded-xl bg-slate-50 px-5 py-4">
              <p className="text-sm font-medium text-slate-500">
                Total Estimated Value
              </p>

              <p className="text-lg font-bold text-slate-800">
                {formatIDR(estimatedTotal)}
              </p>
            </div>
          </section>

          {/* APPROVAL ACTION */}
          {canShowApprovalActions && (
            <section className="border-t border-slate-100 pt-6">
              <h3 className="mb-2 text-sm font-bold text-slate-800">
                Approval Action
              </h3>

              <p className="mb-4 text-xs text-slate-400">
                Review this request and select an action.
              </p>

              <label
                htmlFor="procurement-approval-note"
                className="mb-2 block text-sm font-medium text-slate-700"
              >
                Note
                <span className="ml-1 text-xs font-normal text-slate-400">
                  (Required for Revise and Reject)
                </span>
              </label>

              <textarea
                id="procurement-approval-note"
                value={note}
                onChange={(event) => setNote(event.target.value)}
                maxLength={200}
                rows={3}
                disabled={isProcessing}
                placeholder="Write your approval note..."
                className="w-full resize-y rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-50"
              />

              <p className="mt-1 text-right text-xs text-slate-400">
                {note.length}/200 characters
              </p>
            </section>
          )}

          {/* PURCHASING ACTION */}
          {canShowReceiveGoods && (
            <section className="border-t border-slate-100 pt-6">
              <h3 className="mb-2 text-sm font-bold text-slate-800">
                Purchasing Action
              </h3>

              <p className="mb-4 text-xs text-slate-500">
                Confirm that all requested items have been purchased.
              </p>

              <label
                htmlFor="procurement-purchasing-note"
                className="mb-2 block text-sm font-medium text-slate-700"
              >
                Note
                <span className="ml-1 text-xs font-normal text-slate-400">
                  (Optional)
                </span>
              </label>

              <textarea
                id="procurement-purchasing-note"
                value={note}
                onChange={(event) => setNote(event.target.value)}
                maxLength={200}
                rows={3}
                disabled={isProcessing}
                placeholder="Write purchasing notes..."
                className="w-full resize-y rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 disabled:bg-slate-50"
              />

              <p className="mt-1 text-right text-xs text-slate-400">
                {note.length}/200 characters
              </p>
            </section>
          )}

          {/* ERROR */}
          {actionError && (
            <div className="flex gap-3 rounded-xl border border-red-200 bg-red-50 p-4">
              <AlertCircle
                size={19}
                className="mt-0.5 shrink-0 text-red-500"
              />

              <p className="text-sm text-red-700">
                {actionError}
              </p>
            </div>
          )}

        </div>

        {/* FOOTER */}
        <div className="flex flex-col-reverse justify-between gap-3 border-t border-slate-100 bg-white px-6 py-5 sm:flex-row sm:items-center">

          <button
            type="button"
            onClick={onClose}
            disabled={isProcessing}
            className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
          >
            Close
          </button>

          {/* APPROVAL BUTTONS */}
          {canShowApprovalActions && (
            <div className="flex flex-col gap-2 sm:flex-row">

              {canRevise && (
                <button
                  type="button"
                  onClick={() => void handleAction('revise')}
                  disabled={isProcessing || !note.trim()}
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-700 transition hover:bg-amber-100 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isProcessing ? (
                    <LoaderCircle size={16} className="animate-spin" />
                  ) : (
                    <RotateCcw size={16} />
                  )}
                  Revise
                </button>
              )}

              {canReject && (
                <button
                  type="button"
                  onClick={() => void handleAction('reject')}
                  disabled={isProcessing || !note.trim()}
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-600 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isProcessing ? (
                    <LoaderCircle size={16} className="animate-spin" />
                  ) : (
                    <XCircle size={16} />
                  )}
                  Reject
                </button>
              )}

              {canApprove && (
                <button
                  type="button"
                  onClick={() => void handleAction('approve')}
                  disabled={isProcessing}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isProcessing ? (
                    <LoaderCircle size={16} className="animate-spin" />
                  ) : (
                    <CheckCircle2 size={16} />
                  )}
                  Approve
                </button>
              )}

            </div>
          )}

          {/* PURCHASING BUTTON */}
          {canShowReceiveGoods && (
            <button
              type="button"
              onClick={() => void handleReceiveGoods()}
              disabled={isProcessing}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isProcessing ? (
                <>
                  <LoaderCircle size={16} className="animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <CheckCircle2 size={16} />
                  Mark as Purchased
                </>
              )}
            </button>
          )}

        </div>
      </div>
    </div>
  );
}

export default ProcurementDetailModal;
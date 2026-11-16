import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';

import {
  X,
  Package,
  Wrench,
  FileText,
  AlertCircle,
  LoaderCircle,
} from 'lucide-react';

import api from '../../../services/api';

import type { ProcurementTicket } from '../../procurement/types/procurement.types';

import { formatIDR } from '../../procurement/utils/procurement.utils';

import TicketHistorySection from '../../../components/common/TicketHistorySection';
import PurchaseProofSection from '../../procurement/components/PurchaseProofSection';

// ==========================================
// TYPES
// ==========================================

// Detail maintenance dari GET /api/tickets/{id} -> maintenanceDetail.
interface MaintenanceDetail {
  ticketId: string;
  assetId: number;
  assetTag: string | null;
  description: string | null;
  repairResult: number | null;
  handlerNote: string | null;
  partRequirement: string | null;
  replacementAssetId: number | null;
  replacementAssetTag: string | null;
  createdAt: string;
}

// Response GET /api/tickets/{id} (bisa maintenance atau procurement).
type TicketDetail = Omit<ProcurementTicket, 'maintenanceDetail'> & {
  maintenanceDetail: MaintenanceDetail | null;
};

interface TicketViewModalProps {
  ticketId: string | null;
  onClose: () => void;
}

// ==========================================
// HELPERS
// ==========================================

const repairResultLabels: Record<number, string> = {
  1: 'Repaired',
  2: 'Unrepairable',
  3: 'Need Part',
};

function formatDateTime(value: string | null) {
  if (!value) return '-';

  const date = new Date(value);
  const pad = (n: number) => n.toString().padStart(2, '0');

  return `${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${date.getFullYear()} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

// Satu kotak info (label kecil + nilai).
function InfoField({
  label,
  value,
  className = '',
  valueClassName = 'text-slate-800',
}: {
  label: string;
  value: ReactNode;
  className?: string;
  valueClassName?: string;
}) {
  return (
    <div className={className}>
      <p className="text-xs text-slate-400">{label}</p>

      <p className={`mt-1 whitespace-pre-wrap text-sm font-semibold ${valueClassName}`}>
        {value || '-'}
      </p>
    </div>
  );
}

// ==========================================
// COMPONENT (VIEW ONLY)
// ==========================================

function TicketViewModal({ ticketId, onClose }: TicketViewModalProps) {
  const [ticket, setTicket] = useState<TicketDetail | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!ticketId) return;

    const controller = new AbortController();

    async function fetchTicket() {
      try {
        setIsLoading(true);
        setError('');
        setTicket(null);

        const response = await api.get<TicketDetail>(
          `/tickets/${ticketId}`,
          { signal: controller.signal }
        );

        setTicket(response.data);
      } catch (err: unknown) {
        if (controller.signal.aborted) return;

        const apiError = err as {
          response?: {
            status?: number;
            data?: { message?: string; detail?: string; title?: string };
          };
          message?: string;
        };

        setError(
          apiError.response?.status === 404
            ? 'Ticket not found or you do not have access to it.'
            : apiError.response?.data?.detail ||
                apiError.response?.data?.message ||
                apiError.response?.data?.title ||
                apiError.message ||
                'Failed to load ticket details.'
        );
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    }

    void fetchTicket();

    return () => controller.abort();
  }, [ticketId]);

  if (!ticketId) return null;

  const isMaintenance = ticket?.ticketType === 1;
  const HeaderIcon = isMaintenance ? Wrench : Package;

  const items = ticket?.procurementDetails ?? [];
  const estimatedTotal = items.reduce(
    (total, item) => total + item.totalPrice,
    0
  );

  const maintenance = ticket?.maintenanceDetail ?? null;

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <div className="flex max-h-[92vh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">

        {/* HEADER */}
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
          <div className="flex items-center gap-3">
            <div
              className={`flex h-11 w-11 items-center justify-center rounded-xl ${
                isMaintenance
                  ? 'bg-violet-50 text-violet-600'
                  : 'bg-blue-50 text-blue-600'
              }`}
            >
              <HeaderIcon size={22} />
            </div>

            <div>
              <h2 className="text-lg font-bold text-slate-800">
                {ticket
                  ? isMaintenance
                    ? 'Maintenance Details'
                    : 'Procurement Details'
                  : 'Ticket Details'}
              </h2>

              <p className="mt-1 text-xs text-slate-500">
                {ticket?.ticketNumber ?? 'Loading...'}
                <span className="ml-2 rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold uppercase text-slate-500">
                  View Only
                </span>
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
          >
            <X size={20} />
          </button>
        </div>

        {/* BODY */}
        <div className="min-h-0 flex-1 space-y-6 overflow-y-auto px-6 py-6">

          {/* LOADING */}
          {isLoading && (
            <div className="py-16 text-center">
              <LoaderCircle
                size={28}
                className="mx-auto animate-spin text-blue-500"
              />

              <p className="mt-3 text-sm text-slate-500">
                Loading ticket details...
              </p>
            </div>
          )}

          {/* ERROR */}
          {!isLoading && error && (
            <div className="flex gap-3 rounded-xl border border-red-200 bg-red-50 p-4">
              <AlertCircle
                size={19}
                className="mt-0.5 shrink-0 text-red-500"
              />

              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {!isLoading && ticket && (
            <>
              {/* REQUEST INFORMATION */}
              <section>
                <h3 className="mb-4 text-sm font-bold text-slate-800">
                  Request Information
                </h3>

                <div className="grid grid-cols-1 gap-4 rounded-xl border border-slate-200 p-4 sm:grid-cols-2">
                  <InfoField
                    label="Subject"
                    value={ticket.subject}
                    className="sm:col-span-2"
                  />

                  <InfoField label="Requester" value={ticket.employeeName} />

                  <InfoField
                    label="Current Step"
                    value={ticket.currentStep}
                    valueClassName="text-blue-600"
                  />

                  <InfoField
                    label="Created At"
                    value={formatDateTime(ticket.createdAt)}
                  />

                  <InfoField
                    label="Closed At"
                    value={formatDateTime(ticket.closedAt)}
                  />

                  {isMaintenance && (
                    <InfoField label="Assigned To" value={ticket.assignedTo} />
                  )}

                  <div className="sm:col-span-2">
                    <p className="text-xs text-slate-400">Description</p>

                    <p className="mt-1 whitespace-pre-wrap text-sm text-slate-700">
                      {ticket.description || '-'}
                    </p>
                  </div>
                </div>
              </section>

              {/* MAINTENANCE DETAIL */}
              {isMaintenance && (
                <section>
                  <div className="mb-4 flex items-center gap-2">
                    <Wrench size={17} className="text-slate-500" />

                    <h3 className="text-sm font-bold text-slate-800">
                      Maintenance Information
                    </h3>
                  </div>

                  {maintenance ? (
                    <div className="grid grid-cols-1 gap-4 rounded-xl border border-slate-200 p-4 sm:grid-cols-2">
                      <InfoField
                        label="Asset Tag"
                        value={maintenance.assetTag}
                        valueClassName="text-blue-600"
                      />

                      <InfoField
                        label="Repair Result"
                        value={
                          maintenance.repairResult
                            ? repairResultLabels[maintenance.repairResult] ??
                              maintenance.repairResult
                            : null
                        }
                      />

                      <InfoField
                        label="Problem Description"
                        value={maintenance.description}
                        className="sm:col-span-2"
                      />

                      <InfoField
                        label="Handler Note"
                        value={maintenance.handlerNote}
                        className="sm:col-span-2"
                      />

                      <InfoField
                        label="Part Requirement"
                        value={maintenance.partRequirement}
                      />

                      <InfoField
                        label="Replacement Asset"
                        value={maintenance.replacementAssetTag}
                      />
                    </div>
                  ) : (
                    <div className="rounded-xl border border-dashed border-slate-200 p-6 text-center text-sm text-slate-400">
                      No maintenance detail found.
                    </div>
                  )}
                </section>
              )}

              {/* PROCUREMENT ITEMS */}
              {!isMaintenance && (
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
                            <th className="px-4 py-3 text-center">Quantity</th>
                            <th className="px-4 py-3 text-right">Price</th>
                            <th className="px-4 py-3 text-right">Subtotal</th>
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
              )}

              {/* BUKTI PEMBELIAN (procurement yang sudah Receive Goods) */}
              {!isMaintenance && ticket.purchaseProofFileName && (
                <PurchaseProofSection
                  ticketId={ticket.id}
                  fileName={ticket.purchaseProofFileName}
                />
              )}

              {/* HISTORY */}
              <TicketHistorySection history={ticket.history} />
            </>
          )}
        </div>

        {/* FOOTER (hanya tombol Close, tanpa aksi) */}
        <div className="flex justify-end border-t border-slate-100 bg-white px-6 py-5">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

export default TicketViewModal;
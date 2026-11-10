import { useEffect, useState } from 'react';

import {
  X,
  Package,
  CheckCircle2,
  RotateCcw,
  XCircle,
  AlertCircle,
  LoaderCircle,
  FileText,
  Pencil,
  Plus,
  Trash2,
  Send,
  Upload,
} from 'lucide-react';

import type {
  ProcurementTicket,
  ResubmitProcurementPayload,
} from '../types/procurement.types';

import type { ProcurementAction } from '../hooks/useProcurementActions';

import TicketHistorySection from '../../../components/common/TicketHistorySection';
import PurchaseProofSection from './PurchaseProofSection';

import { formatIDR } from '../utils/procurement.utils';

interface ProcurementDetailModalProps {
  ticket: ProcurementTicket | null;
  isProcessing: boolean;
  actionError: string;

  canApprove: boolean;
  canRevise: boolean;
  canReject: boolean;
  canReceiveGoods: boolean;
  canResubmit?: boolean;

  onClose: () => void;

  onAction: (
    action: ProcurementAction,
    note: string
  ) => Promise<boolean>;

  onReceiveGoods: (
    note: string,
    proofFile: File
  ) => Promise<boolean>;

  onResubmit: (
    payload: ResubmitProcurementPayload
  ) => Promise<boolean>;
}

interface EditableItem {
  itemId: string;
  itemCategoryId: string;
  itemName: string;
  quantity: string;
  price: string;
}

// Batas ukuran bukti pembelian
const MAX_PROOF_SIZE = 5 * 1024 * 1024; // 5 MB

function createEmptyItem(): EditableItem {
  return {
    itemId: '',
    itemCategoryId: '',
    itemName: '',
    quantity: '1',
    price: '0',
  };
}

function ProcurementDetailModal({
  ticket,
  isProcessing,
  actionError,
  canApprove,
  canRevise,
  canReject,
  canReceiveGoods,
  canResubmit,
  onClose,
  onAction,
  onReceiveGoods,
  onResubmit,
}: ProcurementDetailModalProps) {
  const [note, setNote] = useState('');

  // Bukti pembelian (Receive Goods)
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [proofPreviewUrl, setProofPreviewUrl] = useState<string | null>(null);
  const [proofError, setProofError] = useState('');

  const [isEditing, setIsEditing] = useState(false);
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [editableItems, setEditableItems] = useState<EditableItem[]>([]);

  useEffect(() => {
    if (!ticket) return;

    setSubject(ticket.subject);
    setDescription(ticket.description ?? '');
    setNote('');
    setIsEditing(false);

    setProofFile(null);
    setProofError('');

    setEditableItems(
      (ticket.procurementDetails ?? []).map((item) => ({
        itemId: item.itemId?.toString() ?? '',
        itemCategoryId: item.itemCategoryId.toString(),
        itemName: item.itemName,
        quantity: item.quantity.toString(),
        price: item.price.toString(),
      }))
    );
  }, [ticket]);

  useEffect(() => {
    if (!proofFile || !proofFile.type.startsWith('image/')) {
      setProofPreviewUrl(null);
      return;
    }

    const url = URL.createObjectURL(proofFile);
    setProofPreviewUrl(url);

    return () => URL.revokeObjectURL(url);
  }, [proofFile]);

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

  const canShowResubmit =
    (canResubmit ?? ticket.canResubmit ?? false) &&
    currentStep === 'EMPLOYEE_REVISION';

  const isResubmitting = canShowResubmit && isEditing;

  const canShowHistory =
    !canShowApprovalActions &&
    !canShowReceiveGoods &&
    !isResubmitting;

  const lastRevision = [...(ticket.history ?? [])]
    .reverse()
    .find((entry) => entry.action === 'Revise');

  const items = ticket.procurementDetails ?? [];

  const estimatedTotal = items.reduce(
    (total, item) => total + item.totalPrice,
    0
  );

  const editableTotal = editableItems.reduce(
    (total, item) => {
      const quantity = Number(item.quantity) || 0;
      const price = Number(item.price) || 0;

      return total + quantity * price;
    },
    0
  );

  const handleAction = async (action: ProcurementAction) => {
    if (isProcessing) return;

    if (action !== 'approve' && !note.trim()) return;

    const success = await onAction(action, note);

    if (success) {
      setNote('');
      onClose();
    }
  };

    const handleProofChange = (file: File | null) => {
    setProofError('');

    if (file && file.size > MAX_PROOF_SIZE) {
      setProofFile(null);
      setProofError('File size must not exceed 10 MB.');
      return;
    }

    setProofFile(file);
  };

  const handleReceiveGoods = async () => {
    if (isProcessing || !canShowReceiveGoods) return;

    if (!proofFile) {
      setProofError('Purchase proof is required.');
      return;
    }

    const success = await onReceiveGoods(note, proofFile);

    if (success) {
      setNote('');
      setProofFile(null);
      onClose();
    }
  };

  const updateItem = (
    index: number,
    field: keyof EditableItem,
    value: string
  ) => {
    setEditableItems((previous) =>
      previous.map((item, itemIndex) =>
        itemIndex === index
          ? { ...item, [field]: value }
          : item
      )
    );
  };

  const addItem = () => {
    setEditableItems((previous) => [
      ...previous,
      createEmptyItem(),
    ]);
  };

  const removeItem = (index: number) => {
    setEditableItems((previous) =>
      previous.filter((_, itemIndex) => itemIndex !== index)
    );
  };

  const handleResubmit = async () => {
    if (isProcessing) return;

    if (!subject.trim()) {
      return;
    }

    if (subject.trim().length > 100) {
      return;
    }

    if (description.length > 500) {
      return;
    }

    if (editableItems.length === 0) {
      return;
    }

    const invalidItem = editableItems.some((item) => {
      const quantity = Number(item.quantity);
      const price = Number(item.price);
      const categoryId = Number(item.itemCategoryId);

      if (!item.itemName.trim()) return true;
      if (!Number.isInteger(quantity) || quantity <= 0) return true;
      if (!Number.isFinite(price) || price < 0) return true;

      if (!item.itemId && (
        !Number.isInteger(categoryId) ||
        categoryId <= 0
      )) {
        return true;
      }

      if (item.itemId && (
        !Number.isInteger(Number(item.itemId)) ||
        Number(item.itemId) <= 0
      )) {
        return true;
      }

      return false;
    });

    if (invalidItem) return;

    const payload: ResubmitProcurementPayload = {
      subject: subject.trim(),
      description: description.trim(),
      note: note.trim(),
      items: editableItems.map((item) => ({
        itemId: item.itemId
          ? Number(item.itemId)
          : null,

        itemCategoryId: item.itemId
          ? Number(item.itemCategoryId)
          : Number(item.itemCategoryId),

        itemName: item.itemName.trim(),
        quantity: Number(item.quantity),
        price: Number(item.price),
      })),
    };

    const success = await onResubmit(payload);

    if (success) {
      setNote('');
      setIsEditing(false);
      onClose();
    }
  };

  const inputClass =
    'w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-50';

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
      <div className="flex max-h-[92vh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">

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
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-800">
                Request Information
              </h3>

              {canShowResubmit && !isEditing && (
                <button
                  type="button"
                  onClick={() => {
                    setIsEditing(true);
                    setNote('');
                  }}
                  disabled={isProcessing}
                  className="inline-flex items-center gap-2 rounded-lg bg-blue-50 px-3 py-2 text-xs font-semibold text-blue-600 transition hover:bg-blue-100"
                >
                  <Pencil size={14} />
                  Edit Request
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 gap-4 rounded-xl border border-slate-200 p-4 sm:grid-cols-2">

              <div className="sm:col-span-2">
                <label className="mb-1 block text-xs text-slate-400">
                  Request Subject
                </label>

                {isEditing ? (
                  <input
                    value={subject}
                    onChange={(event) =>
                      setSubject(event.target.value)
                    }
                    maxLength={100}
                    disabled={isProcessing}
                    className={inputClass}
                    placeholder="Enter request subject"
                  />
                ) : (
                  <p className="text-sm font-semibold text-slate-800">
                    {ticket.subject}
                  </p>
                )}

                {isEditing && (
                  <p className="mt-1 text-right text-xs text-slate-400">
                    {subject.length}/100
                  </p>
                )}
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
                <label className="mb-1 block text-xs text-slate-400">
                  Description
                </label>

                {isEditing ? (
                  <>
                    <textarea
                      value={description}
                      onChange={(event) =>
                        setDescription(event.target.value)
                      }
                      maxLength={500}
                      rows={4}
                      disabled={isProcessing}
                      className={inputClass}
                      placeholder="Enter request description"
                    />

                    <p className="mt-1 text-right text-xs text-slate-400">
                      {description.length}/500
                    </p>
                  </>
                ) : (
                  <p className="mt-1 whitespace-pre-wrap text-sm text-slate-700">
                    {ticket.description || '-'}
                  </p>
                )}
              </div>
            </div>
          </section>

          {/* PROCUREMENT ITEMS */}
          <section>
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText size={17} className="text-slate-500" />

                <h3 className="text-sm font-bold text-slate-800">
                  Procurement Items ({isEditing ? editableItems.length : items.length})
                </h3>
              </div>

              {isEditing && (
                <button
                  type="button"
                  onClick={addItem}
                  disabled={isProcessing}
                  className="inline-flex items-center gap-2 rounded-lg bg-blue-50 px-3 py-2 text-xs font-semibold text-blue-600 transition hover:bg-blue-100"
                >
                  <Plus size={14} />
                  Add Item
                </button>
              )}
            </div>

            {isEditing ? (
              <div className="space-y-4">
                {editableItems.length === 0 && (
                  <div className="rounded-xl border border-dashed border-slate-200 p-6 text-center text-sm text-slate-400">
                    No items. Click Add Item to add a procurement item.
                  </div>
                )}

                {editableItems.map((item, index) => (
                  <div
                    key={index}
                    className="rounded-xl border border-slate-200 p-4"
                  >
                    <div className="mb-3 flex items-center justify-between">
                      <p className="text-sm font-semibold text-slate-700">
                        Item #{index + 1}
                      </p>

                      <button
                        type="button"
                        onClick={() => removeItem(index)}
                        disabled={isProcessing}
                        className="rounded-lg p-2 text-red-500 transition hover:bg-red-50"
                        title="Remove item"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">

                      <div>
                        <label className="mb-1 block text-xs font-medium text-slate-500">
                          Item Name
                        </label>

                        <input
                          value={item.itemName}
                          onChange={(event) =>
                            updateItem(index, 'itemName', event.target.value)
                          }
                          disabled={isProcessing}
                          className={inputClass}
                          placeholder="Enter item name"
                        />
                      </div>

                      <div>
                        <label className="mb-1 block text-xs font-medium text-slate-500">
                          Item ID (Optional)
                        </label>

                        <input
                          type="number"
                          min="1"
                          value={item.itemId}
                          onChange={(event) =>
                            updateItem(index, 'itemId', event.target.value)
                          }
                          disabled={isProcessing}
                          className={inputClass}
                          placeholder="Empty for manual item"
                        />
                      </div>

                      <div>
                        <label className="mb-1 block text-xs font-medium text-slate-500">
                          Category ID
                        </label>

                        <input
                          type="number"
                          min="1"
                          value={item.itemCategoryId}
                          onChange={(event) =>
                            updateItem(index, 'itemCategoryId', event.target.value)
                          }
                          disabled={isProcessing}
                          className={inputClass}
                          placeholder="Enter category ID"
                        />
                      </div>

                      <div>
                        <label className="mb-1 block text-xs font-medium text-slate-500">
                          Quantity
                        </label>

                        <input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(event) =>
                            updateItem(index, 'quantity', event.target.value)
                          }
                          disabled={isProcessing}
                          className={inputClass}
                        />
                      </div>

                      <div className="sm:col-span-2">
                        <label className="mb-1 block text-xs font-medium text-slate-500">
                          Estimated Price (IDR)
                        </label>

                        <input
                          type="number"
                          min="0"
                          value={item.price}
                          onChange={(event) =>
                            updateItem(index, 'price', event.target.value)
                          }
                          disabled={isProcessing}
                          className={inputClass}
                        />
                      </div>
                    </div>

                    <div className="mt-3 flex justify-between border-t border-slate-100 pt-3 text-sm">
                      <span className="text-slate-500">
                        Subtotal
                      </span>

                      <span className="font-semibold text-slate-800">
                        {formatIDR(
                          (Number(item.quantity) || 0) *
                          (Number(item.price) || 0)
                        )}
                      </span>
                    </div>

                    {item.itemId && (
                      <p className="mt-2 text-xs text-blue-600">
                        Inventory item selected. The backend will validate its ID and category.
                      </p>
                    )}

                    {!item.itemId && (
                      <p className="mt-2 text-xs text-amber-600">
                        Manual item. A valid Category ID is required.
                      </p>
                    )}
                  </div>
                ))}
              </div>
            ) : items.length === 0 ? (
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
                {formatIDR(isEditing ? editableTotal : estimatedTotal)}
              </p>
            </div>
          </section>

          {/* RESUBMIT FORM */}
          {canShowResubmit && isEditing && (
            <section className="border-t border-slate-100 pt-6">
              <h3 className="mb-2 text-sm font-bold text-slate-800">
                Resubmit Request
              </h3>

              <p className="mb-4 text-xs text-slate-500">
                Periksa kembali data pengajuan sebelum mengirimkannya
                kembali untuk proses persetujuan.
              </p>

              {lastRevision?.note && (
                <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
                  <p className="text-xs font-semibold text-amber-700">
                    Revision requested by {lastRevision.employeeName || '-'}
                  </p>

                  <p className="mt-1 whitespace-pre-wrap text-sm text-amber-800">
                    {lastRevision.note}
                  </p>
                </div>
              )}

              <label
                htmlFor="procurement-resubmit-note"
                className="mb-2 block text-sm font-medium text-slate-700"
              >
                Revision Note
                <span className="ml-1 text-xs font-normal text-slate-400">
                  (Optional)
                </span>
              </label>

              <textarea
                id="procurement-resubmit-note"
                value={note}
                onChange={(event) => setNote(event.target.value)}
                maxLength={200}
                rows={3}
                disabled={isProcessing}
                placeholder="Explain what you have corrected..."
                className={inputClass}
              />

              <p className="mt-1 text-right text-xs text-slate-400">
                {note.length}/200 characters
              </p>
            </section>
          )}

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
                className={inputClass}
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
                className={inputClass}
              />

              <p className="mt-1 text-right text-xs text-slate-400">
                {note.length}/200 characters
              </p>

              {/* ERROR RECEIVE GOODS */}
              {(proofError || actionError) && (
                <div className="mt-4 flex gap-3 rounded-xl border border-red-200 bg-red-50 p-3">
                  <AlertCircle size={17} className="mt-0.5 shrink-0 text-red-500" />

                  <p className="text-sm text-red-700">
                    {proofError || actionError}
                  </p>
                </div>
              )}

              {/* BUKTI PEMBELIAN (WAJIB) */}
              <label
                htmlFor="procurement-purchase-proof"
                className="mb-2 mt-4 block text-sm font-medium text-slate-700"
              >
                Purchase Proof
                <span className="ml-0.5 text-red-500">*</span>
                <span className="ml-1 text-xs font-normal text-slate-400">
                  (Receipt / invoice, max 5 MB)
                </span>
              </label>

              <label
                htmlFor="procurement-purchase-proof"
                className={`flex cursor-pointer items-center gap-3 rounded-xl border border-dashed px-4 py-4 transition hover:bg-slate-50 ${
                  proofError ? 'border-red-300' : 'border-slate-300'
                }`}
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                  <Upload size={18} />
                </div>

                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-slate-700">
                    {proofFile ? proofFile.name : 'Choose a file'}
                  </p>

                  <p className="text-xs text-slate-400">
                    {proofFile
                      ? `${(proofFile.size / 1024 / 1024).toFixed(2)} MB · click to change`
                      : 'Photo, PDF, or any other file'}
                  </p>
                </div>
              </label>

              <input
                id="procurement-purchase-proof"
                type="file"
                disabled={isProcessing}
                onChange={(event) =>
                  handleProofChange(event.target.files?.[0] ?? null)
                }
                className="hidden"
              />

              {proofPreviewUrl && (
                <img
                  src={proofPreviewUrl}
                  alt="Purchase proof preview"
                  className="mt-3 max-h-56 w-full rounded-lg border border-slate-200 bg-slate-50 object-contain"
                />
              )}
            </section>
          )}

          {/* BUKTI PEMBELIAN (setelah Receive Goods) */}
          {ticket.purchaseProofFileName && (
            <PurchaseProofSection
              ticketId={ticket.id}
              fileName={ticket.purchaseProofFileName}
            />
          )}

          {canShowHistory && (
            <TicketHistorySection history={ticket.history} />
          )}

          {/* ERROR */}
          {actionError && !canShowReceiveGoods && (
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
            onClick={() => {
              if (isEditing) {
                setIsEditing(false);
                setSubject(ticket.subject);
                setDescription(ticket.description ?? '');
                setEditableItems(
                  (ticket.procurementDetails ?? []).map((item) => ({
                    itemId: item.itemId?.toString() ?? '',
                    itemCategoryId: item.itemCategoryId.toString(),
                    itemName: item.itemName,
                    quantity: item.quantity.toString(),
                    price: item.price.toString(),
                  }))
                );
                setNote('');
              } else {
                onClose();
              }
            }}
            disabled={isProcessing}
            className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
          >
            {isEditing ? 'Cancel Editing' : 'Close'}
          </button>

          {/* RESUBMIT BUTTON */}
          {canShowResubmit && isEditing && (
            <button
              type="button"
              onClick={() => void handleResubmit()}
              disabled={
                isProcessing ||
                !subject.trim() ||
                subject.trim().length > 100 ||
                description.length > 500 ||
                editableItems.length === 0 ||
                editableItems.some((item) =>
                  !item.itemName.trim() ||
                  !item.itemCategoryId ||
                  Number(item.quantity) <= 0 ||
                  Number(item.price) < 0
                )
              }
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isProcessing ? (
                <LoaderCircle size={16} className="animate-spin" />
              ) : (
                <Send size={16} />
              )}
              Resubmit Request
            </button>
          )}

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
              disabled={isProcessing || !proofFile}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isProcessing ? (
                <LoaderCircle size={16} className="animate-spin" />
              ) : (
                <CheckCircle2 size={16} />
              )}
              Mark as Purchased
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default ProcurementDetailModal;
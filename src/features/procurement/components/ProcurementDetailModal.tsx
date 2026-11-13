import { useEffect, useState } from 'react';
import { AlertCircle } from 'lucide-react';

import type {
  ConfirmModalConfig,
  ProcurementTicket,
  ResubmitProcurementPayload,
} from '../types/procurement.types';

import type { ProcurementAction } from '../hooks/useProcurementActions';
import { useProcurementDetailForm } from '../hooks/useProcurementDetailForm';
import { useInventoryOptions } from '../hooks/useInventoryOptions';
import { usePurchaseProofUpload } from '../hooks/usePurchaseProofUpload';

import {
  buildResubmitPayload,
  getDetailVisibility,
  getItemCategoryIds,
  isResubmitInvalid,
} from '../utils/procurementDetail.utils';
import { getFormItemsTotal } from '../utils/procurementForm.utils';
import {
  getActionConfirm,
  getReceiveGoodsConfirm,
  getResubmitConfirm,
  type ConfirmContent,
} from '../utils/procurementConfirm.utils';

import { isFinanceUser } from '../../finance/utils/finance.utils';

import TicketHistorySection from '../../../components/common/TicketHistorySection';
import { ConfirmDialog } from '../../../components/common/ConfirmDialog';

import PurchaseProofSection from './PurchaseProofSection';
import DetailModalHeader from './detail/DetailModalHeader';
import RequestInfoSection from './detail/RequestInfoSection';
import ItemsSection from './detail/ItemsSection';
import ResubmitSection from './detail/ResubmitSection';
import ApprovalSection from './detail/ApprovalSection';
import PurchasingSection from './detail/PurchasingSection';
import DetailFooter from './detail/DetailFooter';

interface ProcurementDetailModalProps {
  // Permission tombol (canApprove, canRevise, ...) dibaca langsung dari ticket.
  ticket: ProcurementTicket | null;
  isProcessing: boolean;
  actionError: string;

  onClose: () => void;

  onAction: (action: ProcurementAction, note: string) => Promise<boolean>;

  onReceiveGoods: (note: string, proofFile: File) => Promise<boolean>;

  onResubmit: (payload: ResubmitProcurementPayload) => Promise<boolean>;
}

function ProcurementDetailModal({
  ticket,
  isProcessing,
  actionError,
  onClose,
  onAction,
  onReceiveGoods,
  onResubmit,
}: ProcurementDetailModalProps) {
  const form = useProcurementDetailForm(ticket);
  const proof = usePurchaseProofUpload(ticket);
  const inventory = useInventoryOptions();

  const [confirmConfig, setConfirmConfig] = useState<ConfirmModalConfig | null>(
    null,
  );

  // Tutup dialog konfirmasi setiap kali tiket berganti.
  useEffect(() => {
    if (!ticket) return;

    setConfirmConfig(null);
  }, [ticket]);

  if (!ticket) return null;

  const {
    currentStep,
    canShowApprovalActions,
    canShowReceiveGoods,
    canShowResubmit,
    isResubmitting,
    canShowHistory,
  } = getDetailVisibility(ticket, form.isEditing);

  const { note, isEditing, subject, description, editableItems } = form;

  const lastRevision = [...(ticket.history ?? [])]
    .reverse()
    .find((entry) => entry.action === 'Revise');

  const items = ticket.procurementDetails ?? [];

  const estimatedTotal = items.reduce(
    (total, item) => total + item.totalPrice,
    0,
  );

  const editableTotal = getFormItemsTotal(editableItems);

  // ==========================================
  // EDIT ITEM (sama dengan form create)
  // ==========================================

  // Mulai edit -> muat kategori + item inventory untuk kategori yang sudah dipakai.
  const handleStartEditing = () => {
    form.startEditing();

    void inventory.loadCategories();

    getItemCategoryIds(editableItems).forEach((categoryId) => {
      void inventory.fetchInventoryItems(categoryId);
    });
  };

  const handleCategoryChange = (index: number, categoryId: string) => {
    form.changeCategory(index, categoryId);

    if (categoryId) {
      void inventory.fetchInventoryItems(categoryId);
    }
  };

  // ==========================================
  // ACTION HANDLERS
  // ==========================================

  const handleAction = async (action: ProcurementAction) => {
    if (isProcessing) return;

    if (action !== 'approve' && !note.trim()) return;

    const success = await onAction(action, note);

    if (success) {
      form.setNote('');
      onClose();
    }
  };

  const handleReceiveGoods = async () => {
    if (isProcessing || !canShowReceiveGoods) return;

    if (!proof.proofFile) {
      proof.setProofError('Purchase proof is required.');
      return;
    }

    const success = await onReceiveGoods(note, proof.proofFile);

    if (success) {
      form.setNote('');
      proof.setProofFile(null);
      onClose();
    }
  };

  const handleResubmit = async () => {
    if (isProcessing) return;

    if (isResubmitInvalid(subject, description, editableItems)) return;

    const success = await onResubmit(
      buildResubmitPayload(subject, description, note, editableItems),
    );

    if (success) {
      form.setNote('');
      form.setIsEditing(false);
      onClose();
    }
  };

  // ==========================================
  // CONFIRMATION DIALOG
  // ==========================================

  const openConfirm = (
    content: ConfirmContent,
    handler: () => Promise<void>,
  ) => {
    setConfirmConfig({
      isOpen: true,
      ...content,
      cancelText: 'Cancel',
      onConfirm: async () => {
        try {
          await handler();
        } finally {
          setConfirmConfig(null);
        }
      },
    });
  };

  const promptAction = (action: ProcurementAction) => {
    if (isProcessing) return;
    if (action !== 'approve' && !note.trim()) return;

    openConfirm(
      getActionConfirm(action, ticket.ticketNumber, estimatedTotal),
      () => handleAction(action),
    );
  };

  const promptReceiveGoods = () => {
    if (isProcessing || !canShowReceiveGoods) return;

    openConfirm(getReceiveGoodsConfirm(ticket.ticketNumber), handleReceiveGoods);
  };

  const promptResubmit = () => {
    if (isProcessing) return;

    openConfirm(
      getResubmitConfirm(ticket.ticketNumber, editableTotal),
      handleResubmit,
    );
  };

  // ==========================================
  // RENDER
  // ==========================================

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !isProcessing) {
          onClose();
        }
      }}
    >
      <div className="flex max-h-[92vh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
        <DetailModalHeader
          ticketNumber={ticket.ticketNumber}
          isProcessing={isProcessing}
          onClose={onClose}
        />

        {/* BODY */}
        <div className="min-h-0 flex-1 space-y-6 overflow-y-auto px-6 py-6">
          <RequestInfoSection
            ticket={ticket}
            canEdit={canShowResubmit}
            isEditing={isEditing}
            isProcessing={isProcessing}
            onStartEditing={handleStartEditing}
            subject={subject}
            description={description}
            onSubjectChange={form.setSubject}
            onDescriptionChange={form.setDescription}
          />

          <ItemsSection
            items={items}
            editableItems={editableItems}
            isEditing={isEditing}
            isProcessing={isProcessing}
            total={isEditing ? editableTotal : estimatedTotal}
            showBudget={currentStep === 'FINANCE_APPROVAL' || isFinanceUser()}
            departmentName={ticket.requesterDepartment || undefined}
            categories={inventory.categories}
            categoryItems={inventory.inventoryItemsByCategory}
            isLoadingItems={inventory.loadingItems}
            itemErrors={inventory.itemErrors}
            categoryError={inventory.categoryError}
            onAddItem={form.addItem}
            onCategoryChange={handleCategoryChange}
            onItemChange={form.changeInventoryItem}
            onToggleManualItem={form.toggleManualItem}
            onFieldChange={form.updateItem}
            onRemoveItem={form.removeItem}
          />

          {isResubmitting && (
            <ResubmitSection
              lastRevision={lastRevision}
              note={note}
              isProcessing={isProcessing}
              onNoteChange={form.setNote}
            />
          )}

          {canShowApprovalActions && (
            <ApprovalSection
              note={note}
              isProcessing={isProcessing}
              onNoteChange={form.setNote}
            />
          )}

          {canShowReceiveGoods && (
            <PurchasingSection
              note={note}
              isProcessing={isProcessing}
              onNoteChange={form.setNote}
              proofFile={proof.proofFile}
              proofPreviewUrl={proof.proofPreviewUrl}
              proofError={proof.proofError}
              onProofChange={proof.handleProofChange}
              actionError={actionError}
            />
          )}

          {/* BUKTI PEMBELIAN (setelah Receive Goods) */}
          {ticket.purchaseProofFileName && (
            <PurchaseProofSection
              ticketId={ticket.id}
              fileName={ticket.purchaseProofFileName}
            />
          )}

          {canShowHistory && <TicketHistorySection history={ticket.history} />}

          {/* ERROR */}
          {actionError && !canShowReceiveGoods && (
            <div className="flex gap-3 rounded-xl border border-red-200 bg-red-50 p-4">
              <AlertCircle size={19} className="mt-0.5 shrink-0 text-red-500" />

              <p className="text-sm text-red-700">{actionError}</p>
            </div>
          )}
        </div>

        <DetailFooter
          isProcessing={isProcessing}
          isEditing={isEditing}
          onCloseOrCancel={isEditing ? form.cancelEditing : onClose}
          showResubmit={isResubmitting}
          isResubmitDisabled={isResubmitInvalid(
            subject,
            description,
            editableItems,
          )}
          onResubmit={promptResubmit}
          showApproval={canShowApprovalActions}
          canApprove={ticket.canApprove}
          canRevise={ticket.canRevise}
          canReject={ticket.canReject}
          hasNote={Boolean(note.trim())}
          onAction={promptAction}
          showReceiveGoods={canShowReceiveGoods}
          hasProofFile={Boolean(proof.proofFile)}
          onReceiveGoods={promptReceiveGoods}
        />
      </div>

      {/* CONFIRMATION DIALOG */}
      {confirmConfig && (
        <ConfirmDialog
          isOpen={confirmConfig.isOpen}
          title={confirmConfig.title}
          message={confirmConfig.message}
          description={confirmConfig.description}
          type={confirmConfig.type}
          confirmText={confirmConfig.confirmText}
          cancelText={confirmConfig.cancelText}
          isLoading={isProcessing}
          onConfirm={confirmConfig.onConfirm}
          onCancel={() => {
            if (!isProcessing) {
              setConfirmConfig(null);
            }
          }}
        />
      )}
    </div>
  );
}

export default ProcurementDetailModal;
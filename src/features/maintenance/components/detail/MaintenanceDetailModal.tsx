import { useEffect, useState } from 'react';
import {
  AlertCircle,
  Archive,
  CheckCircle,
  PackageCheck,
  Send,
  ShoppingCart,
  Trash2,
  UserCheck,
  Wrench,
  XCircle,
} from 'lucide-react';

import type {
  ConfirmModalConfig,
  MaintenanceAction,
  MaintenanceActionMode,
  MaintenanceHandlerOption,
  MaintenanceTicket,
  ReplacementAssetOption,
  SparePartCategoryOption,
  SparePartOption,
} from '../../types/maintenance.types';

import { maintenanceApi } from '../../services/maintenanceApi';
import { useMaintenanceDetailForm } from '../../hooks/useMaintenanceDetailForm';
import { useLazyOptions } from '../../hooks/useLazyOptions';
import { useInventoryOptions } from '../../../../hooks/useInventoryOptions';

import {
  evaluatePartRequirementAvailability,
  getActionMode,
  isRepairPartComplete,
  parseRequiredParts,
  toProcurementChildItems,
  toRepairPartPayload,
} from '../../utils/maintenanceDetail.utils';
import { REPAIR_RESULT_LABELS } from '../../utils/maintenance.utils';
import { getMaintenanceConfirm, type ConfirmContent } from '../../utils/maintenanceConfirm.utils';
import { hasIncompleteItems } from '../../../../utils/itemForm.utils';

import TicketHistorySection from '../../../../components/common/TicketHistorySection';
import { ConfirmDialog } from '../../../../components/common/ConfirmDialog';

import DetailHeader from './DetailHeader';
import DetailFooter, { type FooterButton } from './DetailFooter';
import TicketInfoSection from './TicketInfoSection';
import AssetInfoSection from './AssetInfoSection';

import ActionSection from './sections/ActionSection';
import ActionNote from './sections/ActionNote';
import AssignHandlerSection from './sections/AssignHandlerSection';
import RepairResultSection from './sections/RepairResultSection';
import PartCheckSection from './sections/PartCheckSection';
import ChildProcurementForm from './sections/ChildProcurementForm';
import RequiredPartsList from './sections/RequiredPartsList';
import AssetSelect from './sections/AssetSelect';
import ReplacementDecision from './sections/ReplacementDecision';

interface MaintenanceDetailModalProps {
  // Permission tombol (canApprove, canAssignHandler, ...) dibaca langsung dari ticket.
  ticket: MaintenanceTicket | null;
  isPendingView?: boolean;
  isProcessing: boolean;
  actionError: string;

  onClose: () => void;

  // Menjalankan request API (loading, refresh, pesan error diurus di halaman).
  onRunAction: (request: () => Promise<void>, logMessage: string) => Promise<boolean>;
}

// Judul + penjelasan section aksi untuk tiap step.
const SECTION_TEXT: Record<MaintenanceActionMode, { title: string; description: string }> = {
  approval: {
    title: 'Approval',
    description: 'Approve to continue the request, or reject it with a reason.',
  },
  assign: {
    title: 'Assign Handler',
    description: 'Choose the maintenance handler who will repair this asset.',
  },
  'send-item': {
    title: 'Send Item',
    description: 'Confirm that the item has been handed over to the next person.',
  },
  'receive-item': {
    title: 'Receive Item',
    description: 'Confirm that you have received the item.',
  },
  'repair-result': {
    title: 'Repair Result',
    description: 'Report the result of the repair. Choose "Need Part" if spare parts are required.',
  },
  'part-check': {
    title: 'Spare Part Check',
    description: 'Compare the requested parts with warehouse stock.',
  },
  'receive-part': {
    title: 'Receive Spare Part',
    description: 'Confirm that you have received the spare parts from Inventory.',
  },
  'order-part': {
    title: 'Order Spare Part',
    description: 'Parts are not in stock. Create a procurement request to buy them.',
  },
  disposition: {
    title: 'Asset Disposition',
    description: 'The asset cannot be repaired. Decide whether to archive or dispose it.',
  },
  replacement: {
    title: 'Replacement Asset',
    description: 'Check whether a replacement asset is available in the warehouse.',
  },
  'send-replacement': {
    title: 'Send Replacement',
    description: 'Choose the replacement asset that will be sent to the requester.',
  },
  close: {
    title: 'Close Request',
    description: 'Check the item you received, then close this request.',
  },
};

function MaintenanceDetailModal({
  ticket,
  isPendingView = true,
  isProcessing,
  actionError,
  onClose,
  onRunAction,
}: MaintenanceDetailModalProps) {
  const form = useMaintenanceDetailForm(ticket);
  const inventory = useInventoryOptions();

  const [confirmConfig, setConfirmConfig] = useState<ConfirmModalConfig | null>(null);

  const mode = ticket ? getActionMode(ticket, isPendingView) : null;
  const ticketId = ticket?.id ?? '';

  // ==========================================
  // OPTIONS (hanya dipanggil saat step-nya membutuhkan)
  // ==========================================

  const handlers = useLazyOptions<MaintenanceHandlerOption>(
    maintenanceApi.getHandlers,
    mode === 'assign',
    'Failed to load maintenance handlers.',
  );

  // Step replacement: asset baru dimuat setelah Inventory memilih "Available".
  const needReplacementAssets =
    mode === 'send-replacement' ||
    (mode === 'replacement' && form.replacementAvailability === true);

  const replacementAssets = useLazyOptions<ReplacementAssetOption>(
    ticketId ? () => maintenanceApi.getReplacementAssets(ticketId) : null,
    needReplacementAssets,
    'Failed to load replacement assets.',
    ticketId,
  );

  const spareParts = useLazyOptions<SparePartOption>(
    maintenanceApi.getSpareParts,
    mode === 'repair-result' || mode === 'part-check',
    'Failed to load spare parts.',
  );

  const sparePartCategories = useLazyOptions<SparePartCategoryOption>(
    maintenanceApi.getSparePartCategories,
    mode === 'repair-result',
    'Failed to load spare part categories.',
  );

  // Kategori Procurement: hanya untuk order part / beli pengganti.
  const needProcurementCategories =
    mode === 'order-part' ||
    (mode === 'replacement' && form.replacementAvailability === false);

  const { loadCategories } = inventory;

  useEffect(() => {
    if (needProcurementCategories) {
      void loadCategories();
    }
  }, [needProcurementCategories, loadCategories]);

  // ==========================================
  // PART CHECK
  // ==========================================

  const requiredParts = parseRequiredParts(ticket?.maintenanceDetail?.partRequirement);

  const canConfirmAvailable = evaluatePartRequirementAvailability(
    requiredParts,
    spareParts.options,
  );

  const { partAvailability, setPartAvailability } = form;

  // "Available" tidak boleh tetap terpilih jika stok ternyata kurang.
  useEffect(() => {
    if (partAvailability === true && !canConfirmAvailable) {
      setPartAvailability(null);
    }
  }, [partAvailability, canConfirmAvailable, setPartAvailability]);

  // Tutup dialog konfirmasi setiap kali tiket berganti.
  useEffect(() => {
    setConfirmConfig(null);
  }, [ticket?.id]);

  if (!ticket) return null;

  const { note } = form;
  const trimmedNote = note.trim() || null;

  // ==========================================
  // CONFIRMATION DIALOG
  // ==========================================

  const openConfirm = (content: ConfirmContent, request: () => Promise<void>, log: string) => {
    if (isProcessing) return;

    setConfirmConfig({
      isOpen: true,
      ...content,
      cancelText: content.cancelText ?? 'Cancel',
      onConfirm: async () => {
        try {
          const success = await onRunAction(request, log);

          if (success) {
            onClose();
          }
        } finally {
          setConfirmConfig(null);
        }
      },
    });
  };

  const confirm = (
    action: MaintenanceAction,
    request: () => Promise<void>,
    extra: Parameters<typeof getMaintenanceConfirm>[2] = {},
  ) =>
    openConfirm(
      getMaintenanceConfirm(action, ticket.ticketNumber, extra),
      request,
      `Failed to ${action} maintenance:`,
    );

  // ==========================================
  // VALIDASI TOMBOL (validasi detail tetap di backend)
  // ==========================================

  const selectedHandler = handlers.options.find(
    (handler) => handler.employeeId === form.selectedHandlerId,
  );

  const isNeedPart = form.repairResult === 3;
  const isRepairReady =
    form.repairResult !== '' &&
    (!isNeedPart || (form.repairParts.length > 0 && form.repairParts.every(isRepairPartComplete)));

  const isOrderReady =
    form.orderSubject.trim() !== '' &&
    form.orderItems.items.length > 0 &&
    !hasIncompleteItems(form.orderItems.items);

  const selectedReplacementAsset = replacementAssets.options.find(
    (asset) => asset.assetId === form.replacementAssetId,
  );

  const isReplacementReady =
    form.replacementAvailability === true
      ? Boolean(selectedReplacementAsset)
      : form.replacementAvailability === false &&
        form.replacementSubject.trim() !== '' &&
        form.replacementItems.items.length > 0 &&
        !hasIncompleteItems(form.replacementItems.items);

  // ==========================================
  // TOMBOL FOOTER PER STEP
  // ==========================================

  const buildButtons = (): FooterButton[] => {
    switch (mode) {
      case 'approval':
        return [
          ...(ticket.canReject
            ? [
                {
                  key: 'reject',
                  label: 'Reject',
                  icon: XCircle,
                  variant: 'danger' as const,
                  disabled: !trimmedNote,
                  title: !trimmedNote ? 'A note is required to reject.' : undefined,
                  onClick: () =>
                    confirm('reject', () => maintenanceApi.reject(ticket.id, note.trim())),
                },
              ]
            : []),
          ...(ticket.canApprove
            ? [
                {
                  key: 'approve',
                  label: 'Approve',
                  icon: CheckCircle,
                  variant: 'success' as const,
                  onClick: () =>
                    confirm('approve', () =>
                      maintenanceApi.executeAction(ticket.id, 'Approve', trimmedNote),
                    ),
                },
              ]
            : []),
        ];

      case 'assign':
        return [
          {
            key: 'assign',
            label: 'Assign Handler',
            icon: UserCheck,
            variant: 'primary',
            disabled: !selectedHandler,
            title: !selectedHandler ? 'Please choose a handler.' : undefined,
            onClick: () =>
              confirm(
                'assign',
                () =>
                  maintenanceApi.assignHandler(ticket.id, {
                    technicianId: form.selectedHandlerId,
                    instructionNote: note.trim() || undefined,
                  }),
                { handlerName: selectedHandler?.fullName },
              ),
          },
        ];

      case 'send-item':
        return [
          {
            key: 'send-item',
            label: 'Send Item',
            icon: Send,
            variant: 'primary',
            onClick: () =>
              confirm('send-item', () =>
                maintenanceApi.executeAction(ticket.id, 'Send', trimmedNote),
              ),
          },
        ];

      case 'receive-item':
        return [
          {
            key: 'receive-item',
            label: 'Receive Item',
            icon: PackageCheck,
            variant: 'success',
            onClick: () =>
              confirm('receive-item', () => maintenanceApi.receive(ticket.id, trimmedNote)),
          },
        ];

      case 'repair-result':
        return [
          {
            key: 'repair-result',
            label: 'Submit Result',
            icon: Wrench,
            variant: 'primary',
            disabled: !isRepairReady,
            title: !isRepairReady
              ? isNeedPart
                ? 'Please complete every spare part row.'
                : 'Please choose the repair result.'
              : undefined,
            onClick: () => {
              if (form.repairResult === '') return;

              const result = form.repairResult;
              const parts = isNeedPart ? toRepairPartPayload(form.repairParts) : [];

              confirm(
                'repair-result',
                () =>
                  maintenanceApi.submitRepairResult(ticket.id, {
                    result,
                    handlerNote: note.trim() || undefined,
                    partRequirement: isNeedPart ? JSON.stringify(parts) : null,
                    parts,
                  }),
                { repairResultLabel: REPAIR_RESULT_LABELS[result] },
              );
            },
          },
        ];

      case 'part-check':
        return [
          {
            key: 'part-check',
            label: 'Submit Check',
            icon: PackageCheck,
            variant: 'primary',
            disabled:
              spareParts.isLoading ||
              Boolean(spareParts.error) ||
              form.partAvailability === null,
            title: spareParts.isLoading
              ? 'Loading spare parts stock...'
              : spareParts.error
                ? 'Cannot submit while spare parts failed to load.'
                : form.partAvailability === null
                  ? 'Please choose Available or Not Available.'
                  : undefined,
            onClick: () => {
              const available = form.partAvailability;
              if (available === null) return;
              if (available && !canConfirmAvailable) return;

              confirm(
                'part-check',
                () =>
                  maintenanceApi.checkPart(ticket.id, {
                    available,
                    note: note.trim() || undefined,
                  }),
                { available },
              );
            },
          },
        ];

      case 'receive-part':
        return [
          {
            key: 'receive-part',
            label: 'Receive Part',
            icon: PackageCheck,
            variant: 'success',
            onClick: () =>
              confirm('receive-part', () => maintenanceApi.receive(ticket.id, trimmedNote)),
          },
        ];

      case 'order-part':
        return [
          {
            key: 'order-part',
            label: 'Create Procurement',
            icon: ShoppingCart,
            variant: 'primary',
            disabled: !isOrderReady,
            title: !isOrderReady ? 'Please fill in the subject and complete every item.' : undefined,
            onClick: () =>
              confirm('order-part', () =>
                maintenanceApi.orderPart(ticket.id, {
                  subject: form.orderSubject.trim(),
                  description: form.orderDescription.trim() || null,
                  items: toProcurementChildItems(form.orderItems.items),
                  note: note.trim() || undefined,
                }),
              ),
          },
        ];

      case 'disposition':
        return [
          ...(ticket.canArchive
            ? [
                {
                  key: 'archive',
                  label: 'Archive',
                  icon: Archive,
                  variant: 'warning' as const,
                  onClick: () =>
                    confirm('archive', () =>
                      maintenanceApi.executeAction(ticket.id, 'Archive', trimmedNote),
                    ),
                },
              ]
            : []),
          ...(ticket.canDispose
            ? [
                {
                  key: 'dispose',
                  label: 'Dispose',
                  icon: Trash2,
                  variant: 'danger' as const,
                  onClick: () =>
                    confirm('dispose', () =>
                      maintenanceApi.executeAction(ticket.id, 'Dispose', trimmedNote),
                    ),
                },
              ]
            : []),
        ];

      case 'replacement':
        return [
          {
            key: 'replacement',
            label: form.replacementAvailability === false ? 'Create Procurement' : 'Submit Replacement',
            icon: form.replacementAvailability === false ? ShoppingCart : PackageCheck,
            variant: 'primary',
            disabled: !isReplacementReady,
            title: !isReplacementReady
              ? form.replacementAvailability === null
                ? 'Please choose Available or Not Available.'
                : form.replacementAvailability
                  ? 'Please choose a replacement asset.'
                  : 'Please fill in the subject and complete every item.'
              : undefined,
            onClick: () => {
              const available = form.replacementAvailability;
              if (available === null) return;

              const payload = available
                ? {
                    available: true,
                    replacementAssetId: Number(form.replacementAssetId),
                    note: note.trim() || undefined,
                  }
                : {
                    available: false,
                    subject: form.replacementSubject.trim(),
                    description: form.replacementDescription.trim() || undefined,
                    items: toProcurementChildItems(form.replacementItems.items, 1),
                    note: note.trim() || undefined,
                  };

              confirm('replacement', () => maintenanceApi.processReplacement(ticket.id, payload), {
                available,
                assetTag: selectedReplacementAsset?.assetTag,
              });
            },
          },
        ];

      case 'send-replacement':
        return [
          {
            key: 'send-replacement',
            label: 'Send Replacement',
            icon: Send,
            variant: 'primary',
            disabled: !selectedReplacementAsset,
            title: !selectedReplacementAsset ? 'Please choose a replacement asset.' : undefined,
            onClick: () =>
              confirm(
                'send-replacement',
                () =>
                  maintenanceApi.sendReplacement(ticket.id, {
                    replacementAssetId: Number(form.replacementAssetId),
                    note: note.trim() || undefined,
                  }),
                { assetTag: selectedReplacementAsset?.assetTag },
              ),
          },
        ];

      case 'close':
        return [
          {
            key: 'close',
            label: 'Close Request',
            icon: CheckCircle,
            variant: 'success',
            onClick: () =>
              confirm('close', () => maintenanceApi.executeAction(ticket.id, 'Close', trimmedNote)),
          },
        ];

      default:
        return [];
    }
  };

  // ==========================================
  // ISI SECTION AKSI PER STEP
  // ==========================================

  const renderModeContent = () => {
    switch (mode) {
      case 'assign':
        return (
          <AssignHandlerSection
            handlers={handlers.options}
            isLoading={handlers.isLoading}
            error={handlers.error}
            onReload={() => void handlers.reload()}
            selectedHandlerId={form.selectedHandlerId}
            onSelect={form.setSelectedHandlerId}
            isProcessing={isProcessing}
          />
        );

      case 'repair-result':
        return (
          <RepairResultSection
            repairResult={form.repairResult}
            onResultChange={form.setRepairResult}
            parts={form.repairParts}
            spareParts={spareParts.options}
            categories={sparePartCategories.options}
            isLoadingOptions={spareParts.isLoading || sparePartCategories.isLoading}
            optionsError={spareParts.error || sparePartCategories.error}
            onRetryOptions={() => {
              void spareParts.reload();
              void sparePartCategories.reload();
            }}
            isProcessing={isProcessing}
            onAddPart={form.repairPartsActions.add}
            onRemovePart={form.repairPartsActions.remove}
            onToggleCustom={form.repairPartsActions.toggleCustom}
            onSelectInventoryPart={(index, idStr) =>
              form.repairPartsActions.selectInventoryPart(index, idStr, spareParts.options)
            }
            onUpdateField={form.repairPartsActions.updateField}
          />
        );

      case 'part-check':
        return (
          <PartCheckSection
            requiredParts={requiredParts}
            spareParts={spareParts.options}
            isLoading={spareParts.isLoading}
            error={spareParts.error}
            onRetry={() => void spareParts.reload()}
            canConfirmAvailable={canConfirmAvailable}
            partAvailability={form.partAvailability}
            onChange={form.setPartAvailability}
            isProcessing={isProcessing}
          />
        );

      case 'receive-part':
      case 'order-part':
        return (
          <>
            <RequiredPartsList parts={requiredParts} />

            {mode === 'order-part' && (
              <ChildProcurementForm
                ticketNumber={ticket.ticketNumber}
                subject={form.orderSubject}
                onSubjectChange={form.setOrderSubject}
                description={form.orderDescription}
                onDescriptionChange={form.setOrderDescription}
                list={form.orderItems}
                inventory={inventory}
                isProcessing={isProcessing}
              />
            )}
          </>
        );

      case 'replacement':
        return (
          <>
            <ReplacementDecision
              value={form.replacementAvailability}
              onChange={form.changeReplacementAvailability}
              isProcessing={isProcessing}
            />

            {form.replacementAvailability === true && (
              <AssetSelect
                label="Replacement Asset"
                assets={replacementAssets.options}
                isLoading={replacementAssets.isLoading}
                error={replacementAssets.error}
                value={form.replacementAssetId}
                onChange={form.setReplacementAssetId}
                isProcessing={isProcessing}
              />
            )}

            {form.replacementAvailability === false && (
              <ChildProcurementForm
                ticketNumber={ticket.ticketNumber}
                subject={form.replacementSubject}
                onSubjectChange={form.setReplacementSubject}
                description={form.replacementDescription}
                onDescriptionChange={form.setReplacementDescription}
                list={form.replacementItems}
                inventory={inventory}
                quantityLocked
                isProcessing={isProcessing}
              />
            )}
          </>
        );

      case 'send-replacement':
        return (
          <AssetSelect
            label="Replacement Asset"
            assets={replacementAssets.options}
            isLoading={replacementAssets.isLoading}
            error={replacementAssets.error}
            value={form.replacementAssetId}
            onChange={form.setReplacementAssetId}
            isProcessing={isProcessing}
          />
        );

      default:
        return null;
    }
  };

  const isRejectMode = mode === 'approval' && ticket.canReject;

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
        <DetailHeader ticketNumber={ticket.ticketNumber} isBusy={isProcessing} onClose={onClose} />

        {/* BODY */}
        <div className="min-h-0 flex-1 space-y-6 overflow-y-auto px-6 py-6">
          <TicketInfoSection ticket={ticket} />

          <AssetInfoSection detail={ticket.maintenanceDetail} />

          {mode && (
            <ActionSection {...SECTION_TEXT[mode]}>
              {renderModeContent()}

              <ActionNote
                label={mode === 'assign' ? 'Instruction Note' : 'Note'}
                required={isRejectMode}
                placeholder={
                  isRejectMode
                    ? 'Add a note (required when rejecting)...'
                    : 'Add a note (optional)...'
                }
                value={note}
                disabled={isProcessing}
                onChange={form.setNote}
              />
            </ActionSection>
          )}

          {/* History hanya saat dibuka dari My Requests (view-only), disembunyikan di Pending Tasks. */}
          {!isPendingView && <TicketHistorySection history={ticket.history} />}

          {/* ERROR */}
          {actionError && (
            <div className="flex gap-3 rounded-xl border border-red-200 bg-red-50 p-4">
              <AlertCircle size={19} className="mt-0.5 shrink-0 text-red-500" />

              <p className="whitespace-pre-line text-sm text-red-700">{actionError}</p>
            </div>
          )}
        </div>

        <DetailFooter isProcessing={isProcessing} onClose={onClose} buttons={buildButtons()} />
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

export default MaintenanceDetailModal;
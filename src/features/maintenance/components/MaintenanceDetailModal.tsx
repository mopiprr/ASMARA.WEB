import { useEffect, useMemo, useState } from 'react';
import { LoaderCircle, Send, Wrench } from 'lucide-react';

import ConfirmDialog from '../../../components/common/ConfirmDialog';
import NoteField from '../../../components/common/NoteField';
import TicketDetailModalHeader from '../../../components/common/TicketDetailModalHeader';
import TicketHistorySection from '../../../components/common/TicketHistorySection';
import { useInventoryOptions } from '../../procurement/hooks/useInventoryOptions';

import { useMaintenanceProcurementForm } from '../hooks/useMaintenanceProcurementForm';
import { useRepairResultForm } from '../hooks/useRepairResultForm';
import { useReplacementAssets } from '../hooks/useReplacementAssets';
import { useSparePartOptions } from '../hooks/useSparePartOptions';
import type {
  AssignMaintenanceHandlerPayload,
  MaintenanceHandlerOption,
  MaintenanceNotePayload,
  MaintenancePartCheckPayload,
  MaintenanceReplacementPayload,
  MaintenanceTicket,
  OrderMaintenancePartPayload,
  SendMaintenanceReplacementPayload,
  SubmitRepairResultPayload,
} from '../types/maintenance.types';
import { parseRequiredParts } from '../utils/maintenance-detail.utils';
import {
  getMaintenanceApproveConfirm,
  getMaintenanceArchiveConfirm,
  getMaintenanceAssignConfirm,
  getMaintenanceCheckPartConfirm,
  getMaintenanceCloseTicketConfirm,
  getMaintenanceDisposeConfirm,
  getMaintenanceOrderPartConfirm,
  getMaintenanceProcessReplacementConfirm,
  getMaintenanceReceiveItemConfirm,
  getMaintenanceReceivePartConfirm,
  getMaintenanceRejectConfirm,
  getMaintenanceRepairResultConfirm,
  getMaintenanceSendItemConfirm,
  getMaintenanceSendPartConfirm,
  getMaintenanceSendReplacementConfirm,
  type MaintenanceConfirmContent,
} from '../utils/maintenanceConfirm.utils';
import { getMaintenanceDetailVisibility } from '../utils/maintenancePermissions';

import { evaluatePartRequirementAvailability } from './InventoryPartComparisonTable';
import MaintenanceActionSection from './detail/MaintenanceActionSection';
import MaintenanceTicketInfo from './detail/MaintenanceTicketInfo';
import AssignMaintenanceHandler from './detail/actions/AssignMaintenanceHandler';
import CheckSparePartAvailability from './detail/actions/CheckSparePartAvailability';
import CreateSparePartProcurement from './detail/actions/CreateSparePartProcurement';
import InventoryReplacementDecision from './detail/actions/InventoryReplacementDecision';
import MaintenanceDecisionActions from './detail/actions/MaintenanceDecisionActions';
import MaintenanceDispositionActions from './detail/actions/MaintenanceDispositionActions';
import MaintenanceTransferActions from './detail/actions/MaintenanceTransferActions';
import SendMaintenanceReplacement from './detail/actions/SendMaintenanceReplacement';
import SubmitRepairResult from './detail/actions/SubmitRepairResult';

interface MaintenanceDetailModalProps {
  ticket: MaintenanceTicket | null;
  showHistory?: boolean;
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
  onAssignHandler: (payload: AssignMaintenanceHandlerPayload) => Promise<void>;
  onSendItem: (payload: MaintenanceNotePayload) => Promise<void>;
  onReceiveItem: (payload: MaintenanceNotePayload) => Promise<void>;
  onCloseTicket: (payload: MaintenanceNotePayload) => Promise<void>;
  onArchive: (payload: MaintenanceNotePayload) => Promise<void>;
  onDispose: (payload: MaintenanceNotePayload) => Promise<void>;
  onSubmitRepairResult: (payload: SubmitRepairResultPayload) => Promise<void>;
  onCheckPart: (payload: MaintenancePartCheckPayload) => Promise<void>;
  onOrderPart: (payload: OrderMaintenancePartPayload) => Promise<void>;
  onSendPart: (payload: MaintenanceNotePayload) => Promise<void>;
  onReceivePart: (payload: MaintenanceNotePayload) => Promise<void>;
  onProcessReplacement: (
    payload: MaintenanceReplacementPayload,
  ) => Promise<void>;
  onSendReplacement: (
    payload: SendMaintenanceReplacementPayload,
  ) => Promise<void>;
  onRefreshHandlers: () => void;
}

function MaintenanceDetailModal({
  ticket,
  showHistory = true,
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
  onCloseTicket,
  onArchive,
  onDispose,
  onSubmitRepairResult,
  onCheckPart,
  onOrderPart,
  onSendPart,
  onReceivePart,
  onProcessReplacement,
  onSendReplacement,
  onRefreshHandlers,
}: MaintenanceDetailModalProps) {
  const [note, setNote] = useState('');
  const [selectedHandlerId, setSelectedHandlerId] = useState('');
  const [partAvailability, setPartAvailability] = useState<boolean | null>(
    null,
  );
  const [replacementAvailability, setReplacementAvailability] = useState<
    boolean | null
  >(null);
  const [selectedReplacementAssetId, setSelectedReplacementAssetId] = useState<
    number | ''
  >('');
  const [selectedSendReplacementAssetId, setSelectedSendReplacementAssetId] =
    useState<number | ''>('');
  const [confirmConfig, setConfirmConfig] = useState<
    (MaintenanceConfirmContent & { onConfirm: () => Promise<void> }) | null
  >(null);

  const openConfirm = (
    content: MaintenanceConfirmContent,
    action: () => Promise<void>,
  ) => {
    setConfirmConfig({
      ...content,
      onConfirm: async () => {
        try {
          await action();
        } finally {
          setConfirmConfig(null);
        }
      },
    });
  };

  const visibility = getMaintenanceDetailVisibility(ticket);
  const {
    showDecisionActions,
    showAssignmentAction,
    showDispositionActions,
    showSendItemAction,
    showReceiveItemAction,
    showCloseTicketAction,
    showSubmitRepairResultAction,
    showCheckPartAction,
    showOrderPartAction,
    showSendPartAction,
    showReceivePartAction,
    showReplacementDecisionAction,
    showSendReplacementAction,
    hasActions,
  } = visibility;

  const {
    categories,
    isLoadingCategories,
    categoryError,
    inventoryItemsByCategory,
    loadingItems,
    itemErrors,
    loadCategories,
    fetchInventoryItems,
  } = useInventoryOptions();

  const {
    spareParts,
    categories: sparePartCategories,
    isLoading: isLoadingSparePartOptions,
    error: sparePartOptionsError,
    refetch: refetchSparePartOptions,
  } = useSparePartOptions(
    showSubmitRepairResultAction || showCheckPartAction,
    showSubmitRepairResultAction,
  );

  const repairForm = useRepairResultForm(spareParts);
  const orderPartForm = useMaintenanceProcurementForm({
    inventoryItemsByCategory,
    fetchInventoryItems,
  });
  const replacementForm = useMaintenanceProcurementForm({
    inventoryItemsByCategory,
    fetchInventoryItems,
    fixedQuantity: 1,
  });

  const {
    replacementAssets,
    isLoadingReplacementAssets,
    replacementAssetError,
  } = useReplacementAssets(
    ticket?.id,
    showReplacementDecisionAction || showSendReplacementAction,
  );

  const requiredParts = useMemo(
    () => parseRequiredParts(ticket?.maintenanceDetail?.partRequirement),
    [ticket?.maintenanceDetail?.partRequirement],
  );

  const canConfirmAvailable = useMemo(
    () => evaluatePartRequirementAvailability(requiredParts, spareParts),
    [requiredParts, spareParts],
  );

  useEffect(() => {
    if (!canConfirmAvailable && partAvailability === true) {
      setPartAvailability(false);
    }
  }, [canConfirmAvailable, partAvailability]);

  useEffect(() => {
    if (showOrderPartAction || showReplacementDecisionAction) {
      void loadCategories();
    }
  }, [loadCategories, showOrderPartAction, showReplacementDecisionAction]);

  useEffect(() => {
    setNote('');
    setSelectedHandlerId('');
    setPartAvailability(null);
    setReplacementAvailability(null);
    setSelectedReplacementAssetId('');
    setSelectedSendReplacementAssetId('');
    setConfirmConfig(null);
    repairForm.reset();
    orderPartForm.reset();
    replacementForm.reset();
  }, [
    ticket?.id,
    repairForm.reset,
    orderPartForm.reset,
    replacementForm.reset,
  ]);

  const canSubmitOrderPart =
    Boolean(ticket) &&
    orderPartForm.subject.trim() !== '' &&
    orderPartForm.items.length > 0 &&
    orderPartForm.validItems.length === orderPartForm.items.length;

  const canSubmitReplacement =
    replacementAvailability !== null &&
    (replacementAvailability
      ? selectedReplacementAssetId !== '' &&
        replacementAssets.some(
          (asset) => asset.assetId === selectedReplacementAssetId,
        ) &&
        !isLoadingReplacementAssets
      : replacementForm.subject.trim() !== '' &&
        replacementForm.items.length > 0 &&
        replacementForm.validItems.length === replacementForm.items.length);

  // ==========================================
  // CONFIRMATION-WRAPPED ACTION HANDLERS
  // ==========================================

  const handleSubmitRepairResult = () => {
    if (!ticket || !repairForm.repairResult) return;
    const payload = repairForm.buildPayload(note);
    if (!payload) return;

    openConfirm(
      getMaintenanceRepairResultConfirm(
        ticket.ticketNumber,
        repairForm.repairResult,
      ),
      () => onSubmitRepairResult(payload),
    );
  };

  const handleCheckPart = () => {
    if (!ticket || partAvailability === null) return;
    if (partAvailability === true && !canConfirmAvailable) return;

    openConfirm(
      getMaintenanceCheckPartConfirm(ticket.ticketNumber, partAvailability),
      () =>
        onCheckPart({
          available: partAvailability,
          note: note.trim() || undefined,
        }),
    );
  };

  const handleOrderPart = () => {
    if (!ticket || !canSubmitOrderPart) return;

    openConfirm(
      getMaintenanceOrderPartConfirm(
        ticket.ticketNumber,
        orderPartForm.totalPrice,
      ),
      () =>
        onOrderPart({
          subject: orderPartForm.subject.trim(),
          description: orderPartForm.description.trim() || null,
          items: orderPartForm.buildPayloadItems(),
          note: note.trim() || undefined,
        }),
    );
  };

  const handleProcessReplacement = () => {
    if (!ticket || !canSubmitReplacement || replacementAvailability === null) {
      return;
    }

    openConfirm(
      getMaintenanceProcessReplacementConfirm(
        ticket.ticketNumber,
        replacementAvailability,
        replacementForm.totalPrice,
      ),
      () => {
        if (replacementAvailability === true) {
          return onProcessReplacement({
            available: true,
            replacementAssetId: Number(selectedReplacementAssetId),
            note: note.trim() || undefined,
          });
        }

        return onProcessReplacement({
          available: false,
          subject: replacementForm.subject.trim(),
          description: replacementForm.description.trim() || undefined,
          items: replacementForm.buildPayloadItems(),
          note: note.trim() || undefined,
        });
      },
    );
  };

  const handleSendReplacement = () => {
    if (!ticket || selectedSendReplacementAssetId === '') return;

    openConfirm(
      getMaintenanceSendReplacementConfirm(ticket.ticketNumber),
      () =>
        onSendReplacement({
          replacementAssetId: Number(selectedSendReplacementAssetId),
          note: note.trim() || undefined,
        }),
    );
  };

  const handleAssignHandler = () => {
    if (!ticket || !selectedHandlerId) return;
    const selectedHandler = handlers.find(
      (handler) => handler.employeeId === selectedHandlerId,
    );

    openConfirm(
      getMaintenanceAssignConfirm(
        ticket.ticketNumber,
        selectedHandler?.fullName,
      ),
      () =>
        onAssignHandler({
          technicianId: selectedHandlerId,
          instructionNote: note.trim() || undefined,
        }),
    );
  };

  const confirmNoteAction = (
    buildContent: (ticketNumber: string) => MaintenanceConfirmContent,
    action: (payload: MaintenanceNotePayload) => Promise<void>,
  ) => {
    if (!ticket) return;
    openConfirm(buildContent(ticket.ticketNumber), () =>
      action({ note: note.trim() || undefined }),
    );
  };

  if (!ticket && !isLoading) return null;

  return (
    <>
      <div
        onClick={() => {
          if (!isLoading && !isProcessing) onClose();
        }}
        className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm"
      >
        <div
          onClick={(event) => event.stopPropagation()}
          className="flex max-h-[92vh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl"
        >
          <TicketDetailModalHeader
            icon={<Wrench size={20} />}
            iconContainerClassName="bg-violet-50 text-violet-600"
            title="Maintenance Details"
            ticketNumber={ticket?.ticketNumber}
            subtitle={
              !ticket ? 'Ticket information and workflow actions' : undefined
            }
            onClose={onClose}
            closeDisabled={isLoading || isProcessing}
          />

          <div className="flex-1 overflow-y-auto">
            {isLoading ? (
              <div className="p-12 text-center">
                <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
                <p className="mt-3 text-sm text-slate-500">
                  Loading maintenance detail...
                </p>
              </div>
            ) : ticket ? (
              <div className="space-y-6 p-6">
                <MaintenanceTicketInfo ticket={ticket} />

                {showHistory && (
                  <TicketHistorySection history={ticket.history} />
                )}

                <MaintenanceActionSection
                  error={error}
                  actionError={actionError}
                >
                  {hasActions ? (
                    <div className="space-y-4 border-t border-slate-100 pt-5">
                      <div>
                        <h3 className="text-sm font-semibold text-slate-800">
                          Maintenance Actions
                        </h3>
                        <p className="mt-1 text-xs text-slate-500">
                          Available actions depend on your role and the current
                          workflow step.
                        </p>
                      </div>

                      {showAssignmentAction && (
                        <AssignMaintenanceHandler
                          handlers={handlers}
                          selectedHandlerId={selectedHandlerId}
                          setSelectedHandlerId={setSelectedHandlerId}
                          isLoadingHandlers={isLoadingHandlers}
                          isProcessing={isProcessing}
                          handlerError={handlerError}
                          onRefreshHandlers={onRefreshHandlers}
                          onAssignHandler={handleAssignHandler}
                        />
                      )}

                      <NoteField
                        id="maintenanceActionNote"
                        label="Action Note"
                        value={note}
                        onChange={setNote}
                        disabled={isProcessing}
                        required={ticket.canReject}
                        rows={3}
                        placeholder="Write a note or additional information..."
                        helperText={
                          ticket.canReject
                            ? 'A rejection reason is required.'
                            : undefined
                        }
                      />

                      {showDecisionActions && (
                        <MaintenanceDecisionActions
                          canReject={ticket.canReject}
                          canApprove={ticket.canApprove}
                          isProcessing={isProcessing}
                          note={note}
                          onReject={() => {
                            if (!note.trim()) return;
                            openConfirm(
                              getMaintenanceRejectConfirm(ticket.ticketNumber),
                              () => onReject({ note: note.trim() }),
                            );
                          }}
                          onApprove={() =>
                            confirmNoteAction(
                              getMaintenanceApproveConfirm,
                              onApprove,
                            )
                          }
                        />
                      )}

                      {showDispositionActions && (
                        <MaintenanceDispositionActions
                          canArchive={ticket.canArchive}
                          canDispose={ticket.canDispose}
                          isProcessing={isProcessing}
                          onArchive={() =>
                            confirmNoteAction(
                              getMaintenanceArchiveConfirm,
                              onArchive,
                            )
                          }
                          onDispose={() =>
                            confirmNoteAction(
                              getMaintenanceDisposeConfirm,
                              onDispose,
                            )
                          }
                        />
                      )}

                      {showSubmitRepairResultAction && (
                        <SubmitRepairResult
                          repairResult={repairForm.repairResult}
                          setRepairResult={repairForm.setRepairResult}
                          repairParts={repairForm.repairParts}
                          spareParts={spareParts}
                          categories={sparePartCategories}
                          isLoadingSpareParts={isLoadingSparePartOptions}
                          sparePartsError={sparePartOptionsError}
                          onRetrySpareParts={() =>
                            void refetchSparePartOptions()
                          }
                          isProcessing={isProcessing}
                          canSubmitRepair={repairForm.canSubmitRepair}
                          onAddRepairPart={repairForm.handleAddRepairPart}
                          onRemoveRepairPart={repairForm.handleRemoveRepairPart}
                          onToggleCustomPart={repairForm.handleToggleCustomPart}
                          onSelectInventoryPart={
                            repairForm.handleSelectInventoryPart
                          }
                          onUpdateRepairPartField={
                            repairForm.handleUpdateRepairPartField
                          }
                          onSubmitRepairResult={handleSubmitRepairResult}
                        />
                      )}

                      {showCheckPartAction && (
                        <CheckSparePartAvailability
                          requiredParts={requiredParts}
                          spareParts={spareParts}
                          isLoadingSpareParts={isLoadingSparePartOptions}
                          sparePartsError={sparePartOptionsError}
                          onRetrySpareParts={() =>
                            void refetchSparePartOptions()
                          }
                          canConfirmAvailable={canConfirmAvailable}
                          partAvailability={partAvailability}
                          isProcessing={isProcessing}
                          onSetPartAvailability={setPartAvailability}
                          onCheckPart={handleCheckPart}
                        />
                      )}

                      {showOrderPartAction && (
                        <CreateSparePartProcurement
                          ticketNumber={ticket.ticketNumber}
                          requiredParts={requiredParts}
                          orderPartSubject={orderPartForm.subject}
                          setOrderPartSubject={orderPartForm.setSubject}
                          orderPartDescription={orderPartForm.description}
                          setOrderPartDescription={orderPartForm.setDescription}
                          orderPartItems={orderPartForm.items}
                          orderPartManualItems={orderPartForm.manualItems}
                          categories={categories}
                          isLoadingCategories={isLoadingCategories}
                          categoryError={categoryError}
                          inventoryItemsByCategory={inventoryItemsByCategory}
                          loadingItems={loadingItems}
                          itemErrors={itemErrors}
                          isProcessing={isProcessing}
                          canSubmitOrderPart={canSubmitOrderPart}
                          totalOrderPartPrice={orderPartForm.totalPrice}
                          onCategoryChange={orderPartForm.handleCategoryChange}
                          onItemChange={orderPartForm.handleItemChange}
                          onToggleManualItem={
                            orderPartForm.handleToggleManualItem
                          }
                          onManualNameChange={
                            orderPartForm.handleManualNameChange
                          }
                          onFieldChange={orderPartForm.handleFieldChange}
                          onAddItem={orderPartForm.handleAddItem}
                          onRemoveItem={orderPartForm.handleRemoveItem}
                          onSubmit={handleOrderPart}
                        />
                      )}

                      {showSendPartAction && (
                        <div className="flex justify-end">
                          <button
                            type="button"
                            onClick={() =>
                              confirmNoteAction(
                                getMaintenanceSendPartConfirm,
                                onSendPart,
                              )
                            }
                            disabled={isProcessing}
                            className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
                          >
                            {isProcessing ? (
                              <LoaderCircle
                                size={17}
                                className="animate-spin"
                              />
                            ) : (
                              <Send size={17} />
                            )}
                            Send Spare Parts
                          </button>
                        </div>
                      )}

                      {showReplacementDecisionAction && (
                        <InventoryReplacementDecision
                          replacementAvailability={replacementAvailability}
                          selectedReplacementAssetId={
                            selectedReplacementAssetId
                          }
                          replacementAssets={replacementAssets}
                          isLoadingReplacementAssets={
                            isLoadingReplacementAssets
                          }
                          replacementAssetError={replacementAssetError}
                          replacementSubject={replacementForm.subject}
                          setReplacementSubject={replacementForm.setSubject}
                          replacementDescription={replacementForm.description}
                          setReplacementDescription={
                            replacementForm.setDescription
                          }
                          replacementItems={replacementForm.items}
                          replacementManualItems={replacementForm.manualItems}
                          categories={categories}
                          isLoadingCategories={isLoadingCategories}
                          categoryError={categoryError}
                          inventoryItemsByCategory={inventoryItemsByCategory}
                          loadingItems={loadingItems}
                          itemErrors={itemErrors}
                          isProcessing={isProcessing}
                          canSubmitReplacement={canSubmitReplacement}
                          totalReplacementEstimatedPrice={
                            replacementForm.totalPrice
                          }
                          onAvailabilityChange={(value) => {
                            setReplacementAvailability(value);
                            setSelectedReplacementAssetId('');
                          }}
                          onReplacementAssetChange={
                            setSelectedReplacementAssetId
                          }
                          onCategoryChange={
                            replacementForm.handleCategoryChange
                          }
                          onToggleManualItem={
                            replacementForm.handleToggleManualItem
                          }
                          onManualNameChange={
                            replacementForm.handleManualNameChange
                          }
                          onItemChange={replacementForm.handleItemChange}
                          onPriceChange={(index, price) =>
                            replacementForm.handleFieldChange(
                              index,
                              'price',
                              price,
                            )
                          }
                          onRemoveItem={replacementForm.handleRemoveItem}
                          onAddItem={replacementForm.handleAddItem}
                          onProcessReplacement={handleProcessReplacement}
                        />
                      )}

                      {showSendReplacementAction && (
                        <SendMaintenanceReplacement
                          assets={replacementAssets}
                          selectedAssetId={selectedSendReplacementAssetId}
                          isProcessing={isProcessing}
                          onAssetChange={setSelectedSendReplacementAssetId}
                          onSendReplacement={handleSendReplacement}
                        />
                      )}

                      {showReceivePartAction && (
                        <MaintenanceTransferActions
                          type="receive-parts"
                          isProcessing={isProcessing}
                          onClick={() =>
                            confirmNoteAction(
                              getMaintenanceReceivePartConfirm,
                              onReceivePart,
                            )
                          }
                        />
                      )}

                      {showSendItemAction && (
                        <MaintenanceTransferActions
                          type="send-item"
                          isProcessing={isProcessing}
                          onClick={() =>
                            confirmNoteAction(
                              getMaintenanceSendItemConfirm,
                              onSendItem,
                            )
                          }
                        />
                      )}

                      {showReceiveItemAction && (
                        <MaintenanceTransferActions
                          type="receive-item"
                          isProcessing={isProcessing}
                          onClick={() =>
                            confirmNoteAction(
                              getMaintenanceReceiveItemConfirm,
                              onReceiveItem,
                            )
                          }
                        />
                      )}

                      {showCloseTicketAction && (
                        <MaintenanceTransferActions
                          type="close-ticket"
                          isProcessing={isProcessing}
                          onClick={() =>
                            confirmNoteAction(
                              getMaintenanceCloseTicketConfirm,
                              onCloseTicket,
                            )
                          }
                        />
                      )}
                    </div>
                  ) : null}
                </MaintenanceActionSection>
              </div>
            ) : null}
          </div>

          <div className="flex shrink-0 items-center justify-end border-t border-slate-100 bg-white px-6 py-4">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading || isProcessing}
              className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
            >
              Close
            </button>
          </div>
        </div>
      </div>

      {confirmConfig && (
        <ConfirmDialog
          isOpen
          title={confirmConfig.title}
          message={confirmConfig.message}
          description={confirmConfig.description}
          type={confirmConfig.type}
          confirmText={confirmConfig.confirmText}
          cancelText={confirmConfig.cancelText}
          isLoading={isProcessing}
          onConfirm={() => void confirmConfig.onConfirm()}
          onCancel={() => {
            if (!isProcessing) setConfirmConfig(null);
          }}
        />
      )}
    </>
  );
}

export default MaintenanceDetailModal;

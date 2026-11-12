
import { useEffect, useMemo, useState } from 'react';

import {
  AlertCircle,
  CheckCircle,
  ClipboardCheck,
  LoaderCircle,
  Plus,
  Send,
  Trash2,
  UserRoundCog,
  X,
  XCircle,
} from 'lucide-react';

import type {
  AssignMaintenanceHandlerPayload,
  MaintenanceAssetOption,
  MaintenanceHandlerOption,
  MaintenanceNotePayload,
  MaintenancePartCheckPayload,
  MaintenanceProcurementItemPayload,
  MaintenanceReplacementPayload,
  MaintenanceTicket,
  OrderMaintenancePartPayload,
  RepairResult,
  SendMaintenanceReplacementPayload,
  SubmitRepairResultPayload,
} from '../types/maintenance.types';

import { useInventoryOptions } from '../../procurement/hooks/useInventoryOptions';

interface MaintenanceDetailModalProps {
  ticket: MaintenanceTicket | null;
  isLoading: boolean;
  isProcessing: boolean;
  error: string;
  actionError: string;

  handlers: MaintenanceHandlerOption[];
  assets: MaintenanceAssetOption[];
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
  onCloseTicket: (payload: MaintenanceNotePayload) => Promise<void>;

  onArchive: (payload: MaintenanceNotePayload) => Promise<void>;
  onDispose: (payload: MaintenanceNotePayload) => Promise<void>;

  onSubmitRepairResult: (
    payload: SubmitRepairResultPayload,
  ) => Promise<void>;

  onCheckPart: (
    payload: MaintenancePartCheckPayload,
  ) => Promise<void>;

  onOrderPart: (
    payload: OrderMaintenancePartPayload,
  ) => Promise<void>;

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

interface RequiredPart {
  itemName: string;
  note: string;
}

interface MaintenanceDetailPartRequirement {
  partRequirement?: string | null;
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

function formatIDR(value: number) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(value);
}

function parseRequiredParts(value?: string | null): RequiredPart[] {
  if (!value) return [];

  try {
    const parsed: unknown = JSON.parse(value);

    if (!Array.isArray(parsed)) return [];

    return parsed
      .filter(
        (part): part is Record<string, unknown> =>
          typeof part === 'object' &&
          part !== null &&
          typeof (part as Record<string, unknown>).itemName === 'string',
      )
      .map((part) => ({
        itemName: String(part.itemName),
        note: typeof part.note === 'string' ? part.note : '',
      }));
  } catch {
    return [];
  }
}

function MaintenanceDetailModal({
  ticket,
  isLoading,
  isProcessing,
  error,
  actionError,
  handlers,
  assets,
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

  // REPAIR RESULT
  const [repairResult, setRepairResult] = useState<RepairResult | ''>('');

  const [repairParts, setRepairParts] = useState<RequiredPart[]>([
    { itemName: '', note: '' },
  ]);

  // INVENTORY PART INSPECTION
  const [partAvailability, setPartAvailability] = useState<boolean | null>(
    null,
  );

  // HANDLER PROCUREMENT FORM
  const [orderPartSubject, setOrderPartSubject] = useState('');
  const [orderPartDescription, setOrderPartDescription] = useState('');

  const [orderPartItems, setOrderPartItems] = useState<
    MaintenanceProcurementItemPayload[]
  >([
    {
      itemCategoryId: 0,
      itemName: '',
      quantity: 1,
      price: 0,
      itemId: null,
    },
  ]);

  const [orderPartManualItems, setOrderPartManualItems] = useState<boolean[]>([
    false,
  ]);

  // REPLACEMENT DECISION
  const [replacementAvailability, setReplacementAvailability] = useState<
    boolean | null
  >(null);

  const [selectedReplacementAssetId, setSelectedReplacementAssetId] =
    useState<number | ''>('');

  const [selectedSendReplacementAssetId, setSelectedSendReplacementAssetId] =
    useState<number | ''>('');

  // REPLACEMENT PROCUREMENT FORM
  const [replacementSubject, setReplacementSubject] = useState('');
  const [replacementDescription, setReplacementDescription] = useState('');

  const [replacementItems, setReplacementItems] = useState<
    MaintenanceProcurementItemPayload[]
  >([
    {
      itemCategoryId: 0,
      itemName: '',
      quantity: 1,
      price: 0,
      itemId: null,
    },
  ]);

  const [replacementManualItems, setReplacementManualItems] = useState<
    boolean[]
  >([false]);

  const maintenancePartRequirement =
    ticket?.maintenanceDetail as
      | MaintenanceDetailPartRequirement
      | null
      | undefined;

  const requiredParts = useMemo(
    () =>
      parseRequiredParts(
        maintenancePartRequirement?.partRequirement,
      ),
    [maintenancePartRequirement?.partRequirement],
  );

  useEffect(() => {
    void loadCategories();
  }, [loadCategories]);

  // RESET FORM WHEN TICKET CHANGES
  useEffect(() => {
    setNote('');
    setSelectedHandlerId('');
    setRepairResult('');
    setPartAvailability(null);

    setRepairParts([{ itemName: '', note: '' }]);

    setOrderPartSubject('');
    setOrderPartDescription('');

    setOrderPartItems([
      {
        itemCategoryId: 0,
        itemName: '',
        quantity: 1,
        price: 0,
        itemId: null,
      },
    ]);

    setOrderPartManualItems([false]);

    setReplacementAvailability(null);
    setSelectedReplacementAssetId('');
    setSelectedSendReplacementAssetId('');

    setReplacementSubject('');
    setReplacementDescription('');

    setReplacementItems([
      {
        itemCategoryId: 0,
        itemName: '',
        quantity: 1,
        price: 0,
        itemId: null,
      },
    ]);

    setReplacementManualItems([false]);
  }, [ticket?.id]);

  // REPAIR RESULT
  const handleAddRepairPart = () => {
    setRepairParts((current) => [
      ...current,
      { itemName: '', note: '' },
    ]);
  };

  const handleUpdateRepairPart = (
    index: number,
    field: keyof RequiredPart,
    value: string,
  ) => {
    setRepairParts((current) =>
      current.map((part, partIndex) =>
        partIndex === index
          ? { ...part, [field]: value }
          : part,
      ),
    );
  };

  const handleRemoveRepairPart = (index: number) => {
    setRepairParts((current) =>
      current.filter((_, partIndex) => partIndex !== index),
    );
  };

  const validRepairParts = repairParts.filter(
    (part) => part.itemName.trim() !== '',
  );

  const canSubmitRepair =
    Boolean(repairResult) &&
    (repairResult !== 3 || validRepairParts.length > 0);

  const handleSubmitRepairResult = async () => {
    if (!repairResult || !canSubmitRepair) return;

    if (repairResult === 3) {
      const partRequirement = validRepairParts.map((part) => ({
        itemName: part.itemName.trim(),
        note: part.note.trim(),
      }));

      await onSubmitRepairResult({
        result: repairResult,
        handlerNote: note.trim() || undefined,
        partRequirement: JSON.stringify(partRequirement),
        parts: [],
      });

      return;
    }

    await onSubmitRepairResult({
      result: repairResult,
      handlerNote: note.trim() || undefined,
      partRequirement: null,
      parts: [],
    });
  };

  // INVENTORY CHECK PART
  const handleCheckPart = async () => {
    if (partAvailability === null) return;

    await onCheckPart({
      available: partAvailability,
      note: note.trim() || undefined,
    });
  };

  // HANDLER: PROCUREMENT ITEM FORM
  const handleOrderPartCategoryChange = (
    index: number,
    categoryId: string,
  ) => {
    const parsedCategoryId = categoryId ? Number(categoryId) : 0;

    setOrderPartItems((current) =>
      current.map((item, itemIndex) =>
        itemIndex === index
          ? {
              ...item,
              itemCategoryId: parsedCategoryId,
              itemId: null,
              itemName: '',
            }
          : item,
      ),
    );

    setOrderPartManualItems((current) =>
      current.map((value, itemIndex) =>
        itemIndex === index ? false : value,
      ),
    );

    if (categoryId) {
      void fetchInventoryItems(categoryId);
    }
  };

  const handleOrderPartItemChange = (
    index: number,
    itemId: string,
  ) => {
    const categoryId = String(
      orderPartItems[index]?.itemCategoryId ?? '',
    );

    const availableItems =
      inventoryItemsByCategory[categoryId] ?? [];

    const selectedItem = availableItems.find(
      (item) => String(item.id) === itemId,
    );

    setOrderPartItems((current) =>
      current.map((item, itemIndex) =>
        itemIndex === index
          ? {
              ...item,
              itemId: selectedItem ? Number(selectedItem.id) : null,
              itemName: selectedItem?.itemName ?? '',
            }
          : item,
      ),
    );
  };

  const handleToggleOrderPartManualItem = (index: number) => {
    setOrderPartManualItems((current) =>
      current.map((value, itemIndex) =>
        itemIndex === index ? !value : value,
      ),
    );

    setOrderPartItems((current) =>
      current.map((item, itemIndex) =>
        itemIndex === index
          ? { ...item, itemId: null, itemName: '' }
          : item,
      ),
    );
  };

  const handleOrderPartManualNameChange = (
    index: number,
    itemName: string,
  ) => {
    setOrderPartItems((current) =>
      current.map((item, itemIndex) =>
        itemIndex === index
          ? { ...item, itemName, itemId: null }
          : item,
      ),
    );
  };

  const handleOrderPartFieldChange = (
    index: number,
    field: 'quantity' | 'price',
    value: number,
  ) => {
    setOrderPartItems((current) =>
      current.map((item, itemIndex) =>
        itemIndex === index
          ? { ...item, [field]: value }
          : item,
      ),
    );
  };

  const handleAddOrderPartItem = () => {
    setOrderPartItems((current) => [
      ...current,
      {
        itemCategoryId: 0,
        itemName: '',
        quantity: 1,
        price: 0,
        itemId: null,
      },
    ]);

    setOrderPartManualItems((current) => [...current, false]);
  };

  const handleRemoveOrderPartItem = (index: number) => {
    setOrderPartItems((current) =>
      current.filter((_, itemIndex) => itemIndex !== index),
    );

    setOrderPartManualItems((current) =>
      current.filter((_, itemIndex) => itemIndex !== index),
    );
  };

  const validOrderPartItems = orderPartItems.filter(
    (item) =>
      item.itemCategoryId > 0 &&
      item.itemName.trim() !== '' &&
      Number.isInteger(item.quantity) &&
      item.quantity > 0 &&
      Number.isFinite(item.price) &&
      item.price >= 0,
  );

  const canSubmitOrderPart =
    Boolean(ticket) &&
    orderPartSubject.trim() !== '' &&
    orderPartItems.length > 0 &&
    validOrderPartItems.length === orderPartItems.length;

  const totalOrderPartPrice = validOrderPartItems.reduce(
    (total, item) => total + item.quantity * item.price,
    0,
  );

  const handleOrderPart = async () => {
    if (!canSubmitOrderPart || !ticket) return;

    await onOrderPart({
      subject: orderPartSubject.trim(),
      description: orderPartDescription.trim() || null,
      items: validOrderPartItems.map((item) => ({
        itemCategoryId: Number(item.itemCategoryId),
        itemName: item.itemName.trim(),
        quantity: Number(item.quantity),
        price: Number(item.price),
        itemId: item.itemId ? Number(item.itemId) : null,
      })),
      note: note.trim() || undefined,
    });
  };

  // INVENTORY SEND PART / HANDLER RECEIVE PART
  const handleSendPart = async () => {
    await onSendPart({
      note: note.trim() || undefined,
    });
  };

  const handleReceivePart = async () => {
    await onReceivePart({
      note: note.trim() || undefined,
    });
  };

  // REPLACEMENT FORM
  const handleReplacementCategoryChange = (
    index: number,
    categoryId: string,
  ) => {
    const parsedCategoryId = categoryId ? Number(categoryId) : 0;

    setReplacementItems((current) =>
      current.map((item, itemIndex) =>
        itemIndex === index
          ? {
              ...item,
              itemCategoryId: parsedCategoryId,
              itemId: null,
              itemName: '',
              quantity: 1,
            }
          : item,
      ),
    );

    setReplacementManualItems((current) =>
      current.map((value, itemIndex) =>
        itemIndex === index ? false : value,
      ),
    );

    if (categoryId) {
      void fetchInventoryItems(categoryId);
    }
  };

  const handleReplacementItemChange = (
    index: number,
    itemId: string,
  ) => {
    const categoryId = String(
      replacementItems[index]?.itemCategoryId ?? '',
    );

    const availableItems =
      inventoryItemsByCategory[categoryId] ?? [];

    const selectedItem = availableItems.find(
      (item) => String(item.id) === itemId,
    );

    setReplacementItems((current) =>
      current.map((item, itemIndex) =>
        itemIndex === index
          ? {
              ...item,
              itemId: selectedItem ? Number(selectedItem.id) : null,
              itemName: selectedItem?.itemName ?? '',
              quantity: 1,
            }
          : item,
      ),
    );
  };

  const handleToggleReplacementManualItem = (index: number) => {
    setReplacementManualItems((current) =>
      current.map((value, itemIndex) =>
        itemIndex === index ? !value : value,
      ),
    );

    setReplacementItems((current) =>
      current.map((item, itemIndex) =>
        itemIndex === index
          ? { ...item, itemId: null, itemName: '', quantity: 1 }
          : item,
      ),
    );
  };

  const handleReplacementManualNameChange = (
    index: number,
    itemName: string,
  ) => {
    setReplacementItems((current) =>
      current.map((item, itemIndex) =>
        itemIndex === index
          ? { ...item, itemName, itemId: null, quantity: 1 }
          : item,
      ),
    );
  };

  const handleReplacementPriceChange = (
    index: number,
    price: number,
  ) => {
    setReplacementItems((current) =>
      current.map((item, itemIndex) =>
        itemIndex === index
          ? { ...item, price, quantity: 1 }
          : item,
      ),
    );
  };

  const handleAddReplacementItem = () => {
    setReplacementItems((current) => [
      ...current,
      {
        itemCategoryId: 0,
        itemName: '',
        quantity: 1,
        price: 0,
        itemId: null,
      },
    ]);

    setReplacementManualItems((current) => [...current, false]);
  };

  const handleRemoveReplacementItem = (index: number) => {
    setReplacementItems((current) =>
      current.filter((_, itemIndex) => itemIndex !== index),
    );

    setReplacementManualItems((current) =>
      current.filter((_, itemIndex) => itemIndex !== index),
    );
  };

  const availableReplacementAssets = assets.filter(
    (asset) => asset.assetId !== ticket?.maintenanceDetail?.assetId,
  );

  const validReplacementItems = replacementItems.filter(
    (item) =>
      item.itemCategoryId > 0 &&
      item.itemName.trim() !== '' &&
      item.quantity === 1 &&
      Number.isFinite(item.price) &&
      item.price >= 0,
  );

  const totalReplacementEstimatedPrice = validReplacementItems.reduce(
    (total, item) => total + item.price,
    0,
  );

  const canSubmitReplacement =
    replacementAvailability !== null &&
    (replacementAvailability
      ? selectedReplacementAssetId !== ''
      : replacementSubject.trim() !== '' &&
        validReplacementItems.length === replacementItems.length &&
        replacementItems.length > 0);

  const handleProcessReplacement = async () => {
    if (!canSubmitReplacement) return;

    if (replacementAvailability === true) {
      await onProcessReplacement({
        available: true,
        replacementAssetId: Number(selectedReplacementAssetId),
        note: note.trim() || undefined,
      });

      return;
    }

    await onProcessReplacement({
      available: false,
      subject: replacementSubject.trim(),
      description: replacementDescription.trim() || undefined,
      items: validReplacementItems.map((item) => ({
        itemCategoryId: Number(item.itemCategoryId),
        itemName: item.itemName.trim(),
        quantity: 1,
        price: Number(item.price),
        itemId: item.itemId ? Number(item.itemId) : null,
      })),
      note: note.trim() || undefined,
    });
  };

  // SEND REPLACEMENT
  const availableSendReplacementAssets = assets.filter(
    (asset) => asset.isShared,
  );

  const handleSendReplacement = async () => {
    if (selectedSendReplacementAssetId === '') return;

    await onSendReplacement({
      replacementAssetId: Number(selectedSendReplacementAssetId),
      note: note.trim() || undefined,
    });
  };

  // GENERAL ACTIONS
  const handleApprove = async () => {
    await onApprove({ note: note.trim() || undefined });
  };

  const handleReject = async () => {
    if (!note.trim()) return;
    await onReject({ note: note.trim() });
  };

  const handleAssignHandler = async () => {
    if (!selectedHandlerId) return;

    await onAssignHandler({
      technicianId: selectedHandlerId,
      instructionNote: note.trim() || undefined,
    });
  };

  const handleSendItem = async () => {
    await onSendItem({ note: note.trim() || undefined });
  };

  const handleReceiveItem = async () => {
    await onReceiveItem({ note: note.trim() || undefined });
  };

  const handleCloseTicket = async () => {
    await onCloseTicket({ note: note.trim() || undefined });
  };

  const handleArchive = async () => {
    await onArchive({ note: note.trim() || undefined });
  };

  const handleDispose = async () => {
    await onDispose({ note: note.trim() || undefined });
  };

  // PERMISSIONS
  const currentStep = ticket?.currentStep?.toUpperCase();

  const isDivisionManagerReview =
    currentStep === 'DIVISION_MANAGER_REVIEW';

  const showDecisionActions = Boolean(
    ticket &&
      !isDivisionManagerReview &&
      (ticket.canApprove || ticket.canReject),
  );

  const showAssignmentAction = Boolean(ticket?.canAssignHandler);

  const showDispositionActions = Boolean(
    ticket &&
      isDivisionManagerReview &&
      (ticket.canArchive || ticket.canDispose),
  );

  const showSendItemAction = Boolean(
    ticket?.canSendItem &&
      currentStep !== 'INVENTORY_SEND_REPLACEMENT',
  );

  const showReceiveItemAction = Boolean(ticket?.canReceiveItem);

  const showCloseTicketAction = Boolean(
    ticket &&
      currentStep === 'REQUESTER_CLOSE' &&
      ticket.currentTaskEmployeeId === ticket.employeeId,
  );

  const showSubmitRepairResultAction = Boolean(
    ticket?.canSubmitRepairResult,
  );

  const showReceivePartAction = Boolean(ticket?.canReceivePart);
  const showCheckPartAction = Boolean(ticket?.canCheckPart);

  // NOTE:
  // canOrderPart dari backend harus diberikan kepada assigned Maintenance Handler,
  // bukan Inventory.
  const showOrderPartAction = Boolean(ticket?.canOrderPart);

  const showSendPartAction = Boolean(ticket?.canSendPart);

  const isInventoryReplacementStep =
    currentStep === 'INVENTORY_DISPOSE' ||
    currentStep === 'INVENTORY_ARCHIVE';

  const showReplacementDecisionAction = Boolean(
    ticket &&
      isInventoryReplacementStep &&
      ticket.canProcessReplacement,
  );

  const showSendReplacementAction = Boolean(
    ticket &&
      currentStep === 'INVENTORY_SEND_REPLACEMENT' &&
      ticket.canSendReplacement,
  );

  const hasActions =
    showDecisionActions ||
    showAssignmentAction ||
    showDispositionActions ||
    showSendItemAction ||
    showReceiveItemAction ||
    showCloseTicketAction ||
    showSubmitRepairResultAction ||
    showCheckPartAction ||
    showOrderPartAction ||
    showSendPartAction ||
    showReceivePartAction ||
    showReplacementDecisionAction ||
    showSendReplacementAction;

  if (!ticket && !isLoading) return null;

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

        {isLoading ? (
          <div className="p-12 text-center">
            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
            <p className="mt-3 text-sm text-slate-500">
              Loading maintenance detail...
            </p>
          </div>
        ) : ticket ? (
          <div className="space-y-6 p-6">
            {/* TICKET INFORMATION */}
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                Ticket Number
              </p>
              <p className="mt-1 font-semibold text-blue-600">
                {ticket.ticketNumber}
              </p>
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
                <p className="text-xs text-slate-400">Created Date</p>
                <p className="mt-1 text-sm font-medium text-slate-800">
                  {formatDate(ticket.createdAt)}
                </p>
              </div>
            </div>

            <div className="rounded-xl bg-slate-50 p-4">
              <p className="text-xs text-slate-400">Current Step</p>
              <p className="mt-1 text-sm font-semibold text-slate-800">
                {ticket.currentStep}
              </p>
            </div>

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
                        onChange={(event) =>
                          setSelectedHandlerId(event.target.value)
                        }
                        disabled={
                          isLoadingHandlers ||
                          isProcessing ||
                          handlers.length === 0
                        }
                        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none focus:border-blue-500 disabled:bg-slate-100"
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
                    </div>

                    <button
                      type="button"
                      onClick={handleAssignHandler}
                      disabled={
                        isProcessing ||
                        isLoadingHandlers ||
                        !selectedHandlerId
                      }
                      className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
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
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-700 outline-none focus:border-blue-500 disabled:bg-slate-50"
                  />

                  {ticket.canReject && (
                    <p className="mt-1 text-xs text-slate-400">
                      A rejection reason is required.
                    </p>
                  )}
                </div>

                {/* APPROVE / REJECT */}
                {showDecisionActions && (
                  <div className="flex flex-wrap justify-end gap-3">
                    {ticket.canReject && (
                      <button
                        type="button"
                        onClick={handleReject}
                        disabled={isProcessing || !note.trim()}
                        className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
                      >
                        {isProcessing ? (
                          <LoaderCircle size={17} className="animate-spin" />
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
                        className="inline-flex items-center gap-2 rounded-xl bg-green-600 px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
                      >
                        {isProcessing ? (
                          <LoaderCircle size={17} className="animate-spin" />
                        ) : (
                          <CheckCircle size={17} />
                        )}
                        Approve
                      </button>
                    )}
                  </div>
                )}

                {/* DIVISION MANAGER: ARCHIVE / DISPOSE */}
                {showDispositionActions && (
                  <div className="space-y-3 rounded-xl border border-amber-200 bg-amber-50/50 p-4">
                    <div>
                      <h4 className="text-sm font-semibold text-slate-800">
                        Asset Disposition Decision
                      </h4>
                      <p className="mt-1 text-xs text-slate-500">
                        Decide whether the unrepairable asset should be archived or disposed.
                      </p>
                    </div>

                    <div className="flex flex-wrap justify-end gap-3">
                      {ticket.canArchive && (
                        <button
                          type="button"
                          onClick={handleArchive}
                          disabled={isProcessing}
                          className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
                        >
                          <ClipboardCheck size={17} />
                          Archive
                        </button>
                      )}

                      {ticket.canDispose && (
                        <button
                          type="button"
                          onClick={handleDispose}
                          disabled={isProcessing}
                          className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
                        >
                          <Trash2 size={17} />
                          Dispose
                        </button>
                      )}
                    </div>
                  </div>
                )}

                {/* HANDLER: SUBMIT REPAIR RESULT */}
                {showSubmitRepairResultAction && (
                  <div className="space-y-4 rounded-xl border border-blue-200 bg-blue-50/50 p-4">
                    <div>
                      <h4 className="text-sm font-semibold text-slate-800">
                        Submit Repair Result
                      </h4>
                      <p className="mt-1 text-xs text-slate-500">
                        Select the result of the maintenance inspection or repair.
                      </p>
                    </div>

                    <div>
                      <label
                        htmlFor="repairResult"
                        className="mb-2 block text-sm font-medium text-slate-700"
                      >
                        Repair Decision
                      </label>

                      <select
                        id="repairResult"
                        value={repairResult}
                        onChange={(event) => {
                          const value = event.target.value;
                          setRepairResult(
                            value ? (Number(value) as RepairResult) : '',
                          );
                        }}
                        disabled={isProcessing}
                        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-blue-500 disabled:bg-slate-100"
                      >
                        <option value="">Select repair result</option>
                        <option value={1}>Repaired</option>
                        <option value={2}>Unrepairable</option>
                        <option value={3}>Need Part</option>
                      </select>
                    </div>

                    {repairResult === 3 && (
                      <div className="space-y-3 rounded-xl border border-slate-200 bg-white p-4">
                        <div className="flex items-center justify-between gap-2">
                          <div>
                            <h5 className="text-sm font-semibold text-slate-800">
                              Required Spare Parts
                            </h5>
                            <p className="mt-1 text-xs text-slate-500">
                              Enter the spare part name and specifications.
                            </p>
                          </div>

                          <button
                            type="button"
                            onClick={handleAddRepairPart}
                            disabled={isProcessing}
                            className="inline-flex items-center gap-1 rounded-lg bg-blue-600 px-3 py-2 text-xs font-semibold text-white disabled:opacity-50"
                          >
                            <Plus size={14} />
                            Add Part
                          </button>
                        </div>

                        {repairParts.map((part, index) => (
                          <div
                            key={index}
                            className="space-y-3 rounded-lg border border-slate-200 p-3"
                          >
                            <div className="flex items-center justify-between">
                              <p className="text-xs font-semibold text-slate-600">
                                Spare Part #{index + 1}
                              </p>

                              {repairParts.length > 1 && (
                                <button
                                  type="button"
                                  onClick={() => handleRemoveRepairPart(index)}
                                  disabled={isProcessing}
                                  className="inline-flex items-center gap-1 text-xs font-medium text-red-600"
                                >
                                  <Trash2 size={13} />
                                  Remove
                                </button>
                              )}
                            </div>

                            <div>
                              <label
                                htmlFor={`partName-${index}`}
                                className="mb-1 block text-xs font-medium text-slate-600"
                              >
                                Part Name
                              </label>

                              <input
                                id={`partName-${index}`}
                                type="text"
                                value={part.itemName}
                                onChange={(event) =>
                                  handleUpdateRepairPart(
                                    index,
                                    'itemName',
                                    event.target.value,
                                  )
                                }
                                placeholder="Example: RAM DDR4"
                                disabled={isProcessing}
                                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-500"
                              />
                            </div>

                            <div>
                              <label
                                htmlFor={`partNote-${index}`}
                                className="mb-1 block text-xs font-medium text-slate-600"
                              >
                                Part Note
                              </label>

                              <textarea
                                id={`partNote-${index}`}
                                value={part.note}
                                onChange={(event) =>
                                  handleUpdateRepairPart(
                                    index,
                                    'note',
                                    event.target.value,
                                  )
                                }
                                rows={2}
                                placeholder="Enter spare part specifications or additional notes..."
                                disabled={isProcessing}
                                className="w-full resize-none rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-500"
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="flex justify-end">
                      <button
                        type="button"
                        onClick={handleSubmitRepairResult}
                        disabled={isProcessing || !canSubmitRepair}
                        className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
                      >
                        {isProcessing ? (
                          <LoaderCircle size={17} className="animate-spin" />
                        ) : (
                          <CheckCircle size={17} />
                        )}
                        Submit Repair Result
                      </button>
                    </div>
                  </div>
                )}

                {/* INVENTORY: CHECK PART */}
                {showCheckPartAction && (
                  <div className="space-y-3 rounded-xl border border-amber-200 bg-amber-50/50 p-4">
                    <div>
                      <h4 className="text-sm font-semibold text-slate-800">
                        Spare Part Availability Check
                      </h4>
                      <p className="mt-1 text-xs text-slate-500">
                        Check the requested spare parts in Inventory before recording the availability decision.
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => setPartAvailability(true)}
                        disabled={isProcessing}
                        className={`rounded-xl border px-4 py-3 text-sm font-semibold ${
                          partAvailability === true
                            ? 'border-green-500 bg-green-100 text-green-700'
                            : 'border-slate-200 bg-white text-slate-600'
                        }`}
                      >
                        <CheckCircle size={17} className="mx-auto mb-1" />
                        Available
                      </button>

                      <button
                        type="button"
                        onClick={() => setPartAvailability(false)}
                        disabled={isProcessing}
                        className={`rounded-xl border px-4 py-3 text-sm font-semibold ${
                          partAvailability === false
                            ? 'border-red-500 bg-red-100 text-red-700'
                            : 'border-slate-200 bg-white text-slate-600'
                        }`}
                      >
                        <XCircle size={17} className="mx-auto mb-1" />
                        Not Available
                      </button>
                    </div>

                    <div className="flex justify-end">
                      <button
                        type="button"
                        onClick={handleCheckPart}
                        disabled={isProcessing || partAvailability === null}
                        className="inline-flex items-center gap-2 rounded-xl bg-amber-600 px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
                      >
                        {isProcessing ? (
                          <LoaderCircle size={17} className="animate-spin" />
                        ) : (
                          <ClipboardCheck size={17} />
                        )}
                        Submit Availability
                      </button>
                    </div>
                  </div>
                )}

                {/* HANDLER: CREATE SPARE PART PROCUREMENT */}
                {showOrderPartAction && (
                  <div className="space-y-4 rounded-xl border border-orange-200 bg-orange-50/50 p-4">
                    <div>
                      <h4 className="text-sm font-semibold text-slate-800">
                        Create Spare Part Procurement
                      </h4>
                      <p className="mt-1 text-xs text-slate-500">
                        Create a standard Procurement request for the spare parts required by this maintenance ticket.
                      </p>
                    </div>

                    {requiredParts.length > 0 && (
                      <div className="rounded-lg border border-orange-100 bg-white p-3">
                        <p className="mb-2 text-xs font-semibold text-slate-600">
                          Handler Spare Part Requirements
                        </p>

                        <div className="space-y-2">
                          {requiredParts.map((part, index) => (
                            <div key={`${part.itemName}-${index}`}>
                              <p className="text-sm font-medium text-slate-800">
                                {index + 1}. {part.itemName}
                              </p>
                              {part.note && (
                                <p className="mt-1 whitespace-pre-wrap text-xs text-slate-500">
                                  {part.note}
                                </p>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div>
                      <label
                        htmlFor="orderPartSubject"
                        className="mb-1 block text-xs font-medium text-slate-600"
                      >
                        Subject
                      </label>

                      <input
                        id="orderPartSubject"
                        type="text"
                        value={orderPartSubject}
                        onChange={(event) =>
                          setOrderPartSubject(event.target.value)
                        }
                        placeholder={`Spare Part Procurement - ${ticket.ticketNumber}`}
                        disabled={isProcessing}
                        className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-orange-500"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="orderPartDescription"
                        className="mb-1 block text-xs font-medium text-slate-600"
                      >
                        Description
                      </label>

                      <textarea
                        id="orderPartDescription"
                        value={orderPartDescription}
                        onChange={(event) =>
                          setOrderPartDescription(event.target.value)
                        }
                        rows={2}
                        placeholder={`Procurement for maintenance ticket ${ticket.ticketNumber}.`}
                        disabled={isProcessing}
                        className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-orange-500"
                      />
                    </div>

                    {orderPartItems.map((item, index) => {
                      const categoryId = String(item.itemCategoryId || '');
                      const availableItems =
                        inventoryItemsByCategory[categoryId] ?? [];
                      const isLoadingItems =
                        loadingItems[categoryId] ?? false;
                      const itemError = itemErrors[categoryId] ?? '';
                      const isManual = orderPartManualItems[index] ?? false;

                      return (
                        <div
                          key={index}
                          className="space-y-3 rounded-lg border border-slate-200 bg-white p-3"
                        >
                          <div className="flex items-center justify-between">
                            <p className="text-xs font-semibold text-slate-600">
                              Procurement Item #{index + 1}
                            </p>

                            {orderPartItems.length > 1 && (
                              <button
                                type="button"
                                onClick={() => handleRemoveOrderPartItem(index)}
                                disabled={isProcessing}
                                className="inline-flex items-center gap-1 text-xs font-medium text-red-600"
                              >
                                <Trash2 size={13} />
                                Remove
                              </button>
                            )}
                          </div>

                          <div>
                            <label
                              htmlFor={`orderPartCategory-${index}`}
                              className="mb-1 block text-xs font-medium text-slate-600"
                            >
                              Category
                            </label>

                            <select
                              id={`orderPartCategory-${index}`}
                              value={categoryId}
                              onChange={(event) =>
                                handleOrderPartCategoryChange(
                                  index,
                                  event.target.value,
                                )
                              }
                              disabled={isProcessing || isLoadingCategories}
                              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-orange-500"
                            >
                              <option value="">
                                {isLoadingCategories
                                  ? 'Loading categories...'
                                  : 'Select category'}
                              </option>

                              {categories.map((category) => (
                                <option
                                  key={category.id}
                                  value={String(category.id)}
                                >
                                  {category.categoryName}
                                </option>
                              ))}
                            </select>

                            {categoryError && (
                              <p className="mt-1 text-xs text-red-600">
                                {categoryError}
                              </p>
                            )}
                          </div>

                          <div className="flex justify-end">
                            <button
                              type="button"
                              onClick={() =>
                                handleToggleOrderPartManualItem(index)
                              }
                              disabled={isProcessing || !item.itemCategoryId}
                              className="text-xs font-semibold text-orange-600 disabled:opacity-50"
                            >
                              {isManual
                                ? 'Switch to Inventory Item'
                                : 'Enter Item Manually'}
                            </button>
                          </div>

                          <div>
                            <label
                              htmlFor={`orderPartItem-${index}`}
                              className="mb-1 block text-xs font-medium text-slate-600"
                            >
                              Item
                            </label>

                            {isManual ? (
                              <input
                                id={`orderPartItem-${index}`}
                                type="text"
                                value={item.itemName}
                                onChange={(event) =>
                                  handleOrderPartManualNameChange(
                                    index,
                                    event.target.value,
                                  )
                                }
                                placeholder="Enter item name manually"
                                disabled={isProcessing || !item.itemCategoryId}
                                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-orange-500"
                              />
                            ) : (
                              <select
                                id={`orderPartItem-${index}`}
                                value={item.itemId ? String(item.itemId) : ''}
                                onChange={(event) =>
                                  handleOrderPartItemChange(
                                    index,
                                    event.target.value,
                                  )
                                }
                                disabled={
                                  isProcessing ||
                                  !item.itemCategoryId ||
                                  isLoadingItems
                                }
                                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-orange-500"
                              >
                                <option value="">
                                  {!item.itemCategoryId
                                    ? 'Select category first'
                                    : isLoadingItems
                                      ? 'Loading items...'
                                      : availableItems.length === 0
                                        ? 'No items available'
                                        : 'Select inventory item'}
                                </option>

                                {availableItems.map((inventoryItem) => (
                                  <option
                                    key={inventoryItem.id}
                                    value={String(inventoryItem.id)}
                                  >
                                    {inventoryItem.itemName}
                                  </option>
                                ))}
                              </select>
                            )}

                            {itemError && (
                              <p className="mt-1 text-xs text-red-600">
                                {itemError}
                              </p>
                            )}
                          </div>

                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label
                                htmlFor={`orderPartQuantity-${index}`}
                                className="mb-1 block text-xs font-medium text-slate-600"
                              >
                                Quantity
                              </label>

                              <input
                                id={`orderPartQuantity-${index}`}
                                type="number"
                                min="1"
                                step="1"
                                value={item.quantity}
                                onChange={(event) =>
                                  handleOrderPartFieldChange(
                                    index,
                                    'quantity',
                                    event.target.value === ''
                                      ? 0
                                      : Math.max(0, Number(event.target.value)),
                                  )
                                }
                                disabled={isProcessing}
                                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-orange-500"
                              />
                            </div>

                            <div>
                              <label
                                htmlFor={`orderPartPrice-${index}`}
                                className="mb-1 block text-xs font-medium text-slate-600"
                              >
                                Estimated Price
                              </label>

                              <input
                                id={`orderPartPrice-${index}`}
                                type="number"
                                min="0"
                                step="1"
                                value={item.price}
                                onChange={(event) =>
                                  handleOrderPartFieldChange(
                                    index,
                                    'price',
                                    event.target.value === ''
                                      ? 0
                                      : Math.max(0, Number(event.target.value)),
                                  )
                                }
                                disabled={isProcessing}
                                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-orange-500"
                              />
                            </div>
                          </div>

                          <div className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2">
                            <span className="text-xs text-slate-500">
                              Estimated Subtotal
                            </span>
                            <span className="text-sm font-semibold text-slate-800">
                              {formatIDR(item.quantity * item.price)}
                            </span>
                          </div>
                        </div>
                      );
                    })}

                    <button
                      type="button"
                      onClick={handleAddOrderPartItem}
                      disabled={isProcessing}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-orange-600"
                    >
                      <Plus size={14} />
                      Add Procurement Item
                    </button>

                    <div className="flex items-center justify-between border-t border-orange-200 pt-3">
                      <span className="text-sm font-semibold text-slate-700">
                        Total Estimated Price
                      </span>
                      <span className="text-base font-bold text-orange-700">
                        {formatIDR(totalOrderPartPrice)}
                      </span>
                    </div>

                    <div className="flex justify-end">
                      <button
                        type="button"
                        onClick={handleOrderPart}
                        disabled={isProcessing || !canSubmitOrderPart}
                        className="inline-flex items-center gap-2 rounded-xl bg-orange-600 px-5 py-2.5 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {isProcessing ? (
                          <LoaderCircle size={17} className="animate-spin" />
                        ) : (
                          <Plus size={17} />
                        )}
                        Create Procurement Request
                      </button>
                    </div>
                  </div>
                )}

                {/* INVENTORY: SEND SPARE PARTS */}
                {showSendPartAction && (
                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={handleSendPart}
                      disabled={isProcessing}
                      className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
                    >
                      {isProcessing ? (
                        <LoaderCircle size={17} className="animate-spin" />
                      ) : (
                        <Send size={17} />
                      )}
                      Send Spare Parts
                    </button>
                  </div>
                )}

                {/* INVENTORY: REPLACEMENT DECISION */}
                {showReplacementDecisionAction && (
                  <div className="space-y-4 rounded-xl border border-purple-200 bg-purple-50/50 p-4">
                    <div>
                      <h4 className="text-sm font-semibold text-slate-800">
                        Replacement Asset Decision
                      </h4>
                      <p className="mt-1 text-xs text-slate-500">
                        Check whether a replacement asset is available in Inventory.
                      </p>
                    </div>

                    <div>
                      <label
                        htmlFor="replacementAvailability"
                        className="mb-2 block text-sm font-medium text-slate-700"
                      >
                        Inventory Decision
                      </label>

                      <select
                        id="replacementAvailability"
                        value={
                          replacementAvailability === null
                            ? ''
                            : replacementAvailability
                              ? 'available'
                              : 'unavailable'
                        }
                        onChange={(event) => {
                          const value = event.target.value;

                          setReplacementAvailability(
                            value === '' ? null : value === 'available',
                          );

                          setSelectedReplacementAssetId('');
                        }}
                        disabled={isProcessing}
                        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-purple-500"
                      >
                        <option value="">Select inventory decision</option>
                        <option value="available">Replacement Available</option>
                        <option value="unavailable">Not Available</option>
                      </select>
                    </div>

                    {replacementAvailability === true && (
                      <div>
                        <label
                          htmlFor="replacementAsset"
                          className="mb-2 block text-sm font-medium text-slate-700"
                        >
                          Select Replacement Asset
                        </label>

                        <select
                          id="replacementAsset"
                          value={selectedReplacementAssetId}
                          onChange={(event) =>
                            setSelectedReplacementAssetId(
                              event.target.value
                                ? Number(event.target.value)
                                : '',
                            )
                          }
                          disabled={
                            isProcessing ||
                            availableReplacementAssets.length === 0
                          }
                          className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-purple-500"
                        >
                          <option value="">Select available asset</option>
                          {availableReplacementAssets.map((asset) => (
                            <option
                              key={asset.assetId}
                              value={asset.assetId}
                            >
                              {asset.assetTag} - {asset.itemName}
                            </option>
                          ))}
                        </select>

                        {availableReplacementAssets.length === 0 && (
                          <p className="mt-2 text-xs text-red-600">
                            No replacement assets are available.
                          </p>
                        )}
                      </div>
                    )}

                    {replacementAvailability === false && (
                      <div className="space-y-3 rounded-xl border border-slate-200 bg-white p-4">
                        <h5 className="text-sm font-semibold text-slate-800">
                          Create Replacement Procurement
                        </h5>

                        <div>
                          <label
                            htmlFor="replacementSubject"
                            className="mb-1 block text-xs font-medium text-slate-600"
                          >
                            Subject
                          </label>
                          <input
                            id="replacementSubject"
                            type="text"
                            value={replacementSubject}
                            onChange={(event) =>
                              setReplacementSubject(event.target.value)
                            }
                            placeholder="Replacement Asset Procurement"
                            disabled={isProcessing}
                            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-purple-500"
                          />
                        </div>

                        <div>
                          <label
                            htmlFor="replacementDescription"
                            className="mb-1 block text-xs font-medium text-slate-600"
                          >
                            Description
                          </label>
                          <textarea
                            id="replacementDescription"
                            value={replacementDescription}
                            onChange={(event) =>
                              setReplacementDescription(event.target.value)
                            }
                            rows={2}
                            placeholder="Procurement description..."
                            disabled={isProcessing}
                            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-purple-500"
                          />
                        </div>

                        {replacementItems.map((item, index) => {
                          const categoryId = String(
                            item.itemCategoryId || '',
                          );

                          const availableItems =
                            inventoryItemsByCategory[categoryId] ?? [];

                          const isLoadingItems =
                            loadingItems[categoryId] ?? false;

                          const itemError = itemErrors[categoryId] ?? '';
                          const isManual =
                            replacementManualItems[index] ?? false;

                          return (
                            <div
                              key={index}
                              className="space-y-3 rounded-lg border border-slate-200 p-3"
                            >
                              <div className="flex items-center justify-between">
                                <p className="text-xs font-semibold text-slate-600">
                                  Procurement Item #{index + 1}
                                </p>

                                {replacementItems.length > 1 && (
                                  <button
                                    type="button"
                                    onClick={() =>
                                      handleRemoveReplacementItem(index)
                                    }
                                    disabled={isProcessing}
                                    className="inline-flex items-center gap-1 text-xs font-medium text-red-600"
                                  >
                                    <Trash2 size={13} />
                                    Remove Item
                                  </button>
                                )}
                              </div>

                              <div>
                                <label
                                  htmlFor={`replacementCategory-${index}`}
                                  className="mb-1 block text-xs font-medium text-slate-600"
                                >
                                  Category
                                </label>

                                <select
                                  id={`replacementCategory-${index}`}
                                  value={categoryId}
                                  onChange={(event) =>
                                    handleReplacementCategoryChange(
                                      index,
                                      event.target.value,
                                    )
                                  }
                                  disabled={
                                    isProcessing || isLoadingCategories
                                  }
                                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-purple-500"
                                >
                                  <option value="">
                                    {isLoadingCategories
                                      ? 'Loading categories...'
                                      : 'Select category'}
                                  </option>

                                  {categories.map((category) => (
                                    <option
                                      key={category.id}
                                      value={String(category.id)}
                                    >
                                      {category.categoryName}
                                    </option>
                                  ))}
                                </select>

                                {categoryError && (
                                  <p className="mt-1 text-xs text-red-600">
                                    {categoryError}
                                  </p>
                                )}
                              </div>

                              <div className="flex justify-end">
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleToggleReplacementManualItem(index)
                                  }
                                  disabled={
                                    isProcessing || !item.itemCategoryId
                                  }
                                  className="text-xs font-semibold text-purple-600"
                                >
                                  {isManual
                                    ? 'Switch to Inventory Item'
                                    : 'Enter Item Manually'}
                                </button>
                              </div>

                              <div>
                                <label
                                  htmlFor={`replacementItem-${index}`}
                                  className="mb-1 block text-xs font-medium text-slate-600"
                                >
                                  Item
                                </label>

                                {isManual ? (
                                  <input
                                    id={`replacementItem-${index}`}
                                    type="text"
                                    value={item.itemName}
                                    onChange={(event) =>
                                      handleReplacementManualNameChange(
                                        index,
                                        event.target.value,
                                      )
                                    }
                                    placeholder="Enter item name manually"
                                    disabled={
                                      isProcessing || !item.itemCategoryId
                                    }
                                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-purple-500"
                                  />
                                ) : (
                                  <select
                                    id={`replacementItem-${index}`}
                                    value={
                                      item.itemId ? String(item.itemId) : ''
                                    }
                                    onChange={(event) =>
                                      handleReplacementItemChange(
                                        index,
                                        event.target.value,
                                      )
                                    }
                                    disabled={
                                      isProcessing ||
                                      !item.itemCategoryId ||
                                      isLoadingItems
                                    }
                                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-purple-500"
                                  >
                                    <option value="">
                                      {!item.itemCategoryId
                                        ? 'Select category first'
                                        : isLoadingItems
                                          ? 'Loading items...'
                                          : availableItems.length === 0
                                            ? 'No items available'
                                            : 'Select inventory item'}
                                    </option>

                                    {availableItems.map((inventoryItem) => (
                                      <option
                                        key={inventoryItem.id}
                                        value={String(inventoryItem.id)}
                                      >
                                        {inventoryItem.itemName}
                                      </option>
                                    ))}
                                  </select>
                                )}

                                {itemError && (
                                  <p className="mt-1 text-xs text-red-600">
                                    {itemError}
                                  </p>
                                )}
                              </div>

                              <div className="grid grid-cols-2 gap-3">
                                <div>
                                  <label
                                    htmlFor={`replacementQuantity-${index}`}
                                    className="mb-1 block text-xs font-medium text-slate-600"
                                  >
                                    Quantity
                                  </label>
                                  <input
                                    id={`replacementQuantity-${index}`}
                                    type="number"
                                    value={1}
                                    readOnly
                                    disabled={isProcessing}
                                    className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm"
                                  />
                                  <p className="mt-1 text-[11px] text-slate-400">
                                    Maximum quantity is 1.
                                  </p>
                                </div>

                                <div>
                                  <label
                                    htmlFor={`replacementPrice-${index}`}
                                    className="mb-1 block text-xs font-medium text-slate-600"
                                  >
                                    Estimated Price
                                  </label>
                                  <input
                                    id={`replacementPrice-${index}`}
                                    type="number"
                                    min="0"
                                    step="1"
                                    value={item.price}
                                    onChange={(event) =>
                                      handleReplacementPriceChange(
                                        index,
                                        event.target.value === ''
                                          ? 0
                                          : Math.max(
                                              0,
                                              Number(event.target.value),
                                            ),
                                      )
                                    }
                                    disabled={isProcessing}
                                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-purple-500"
                                  />
                                </div>
                              </div>

                              <div className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2">
                                <span className="text-xs text-slate-500">
                                  Estimated Subtotal
                                </span>
                                <span className="text-sm font-semibold text-slate-800">
                                  {formatIDR(item.price)}
                                </span>
                              </div>
                            </div>
                          );
                        })}

                        <button
                          type="button"
                          onClick={handleAddReplacementItem}
                          disabled={isProcessing}
                          className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600"
                        >
                          <Plus size={14} />
                          Add Procurement Item
                        </button>

                        <div className="flex items-center justify-between border-t border-slate-200 pt-3">
                          <span className="text-sm font-semibold text-slate-700">
                            Total Estimated Price
                          </span>
                          <span className="text-base font-bold text-purple-700">
                            {formatIDR(totalReplacementEstimatedPrice)}
                          </span>
                        </div>
                      </div>
                    )}

                    <div className="flex justify-end">
                      <button
                        type="button"
                        onClick={handleProcessReplacement}
                        disabled={isProcessing || !canSubmitReplacement}
                        className="inline-flex items-center gap-2 rounded-xl bg-purple-600 px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
                      >
                        {isProcessing ? (
                          <LoaderCircle size={17} className="animate-spin" />
                        ) : (
                          <ClipboardCheck size={17} />
                        )}
                        Submit Replacement Decision
                      </button>
                    </div>
                  </div>
                )}

                {/* INVENTORY: SEND REPLACEMENT */}
                {showSendReplacementAction && (
                  <div className="space-y-3 rounded-xl border border-green-200 bg-green-50/50 p-4">
                    <div>
                      <h4 className="text-sm font-semibold text-slate-800">
                        Send Replacement Asset
                      </h4>
                      <p className="mt-1 text-xs text-slate-500">
                        Select an available asset from Inventory to replace the requester's damaged asset.
                      </p>
                    </div>

                    <div>
                      <label
                        htmlFor="sendReplacementAsset"
                        className="mb-2 block text-sm font-medium text-slate-700"
                      >
                        Select Available Asset
                      </label>

                      <select
                        id="sendReplacementAsset"
                        value={selectedSendReplacementAssetId}
                        onChange={(event) =>
                          setSelectedSendReplacementAssetId(
                            event.target.value
                              ? Number(event.target.value)
                              : '',
                          )
                        }
                        disabled={
                          isProcessing ||
                          availableSendReplacementAssets.length === 0
                        }
                        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-green-500"
                      >
                        <option value="">
                          {availableSendReplacementAssets.length === 0
                            ? 'No available assets in Inventory'
                            : 'Select an available asset'}
                        </option>

                        {availableSendReplacementAssets.map((asset) => (
                          <option
                            key={asset.assetId}
                            value={asset.assetId}
                          >
                            {asset.assetTag} - {asset.itemName}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="flex justify-end">
                      <button
                        type="button"
                        onClick={handleSendReplacement}
                        disabled={
                          isProcessing ||
                          selectedSendReplacementAssetId === ''
                        }
                        className="inline-flex items-center gap-2 rounded-xl bg-green-600 px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
                      >
                        {isProcessing ? (
                          <LoaderCircle size={17} className="animate-spin" />
                        ) : (
                          <Send size={17} />
                        )}
                        Send Replacement to Requester
                      </button>
                    </div>
                  </div>
                )}

                {/* HANDLER: RECEIVE SPARE PARTS */}
                {showReceivePartAction && (
                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={handleReceivePart}
                      disabled={isProcessing}
                      className="inline-flex items-center gap-2 rounded-xl bg-green-600 px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
                    >
                      {isProcessing ? (
                        <LoaderCircle size={17} className="animate-spin" />
                      ) : (
                        <CheckCircle size={17} />
                      )}
                      Receive Spare Parts
                    </button>
                  </div>
                )}

                {/* REQUESTER: SEND ITEM */}
                {showSendItemAction && (
                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={handleSendItem}
                      disabled={isProcessing}
                      className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
                    >
                      {isProcessing ? (
                        <LoaderCircle size={17} className="animate-spin" />
                      ) : (
                        <Send size={17} />
                      )}
                      Send Item
                    </button>
                  </div>
                )}

                {/* HANDLER: RECEIVE ITEM */}
                {showReceiveItemAction && (
                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={handleReceiveItem}
                      disabled={isProcessing}
                      className="inline-flex items-center gap-2 rounded-xl bg-green-600 px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
                    >
                      {isProcessing ? (
                        <LoaderCircle size={17} className="animate-spin" />
                      ) : (
                        <CheckCircle size={17} />
                      )}
                      Receive Item
                    </button>
                  </div>
                )}

                {/* REQUESTER: CLOSE TICKET */}
                {showCloseTicketAction && (
                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={handleCloseTicket}
                      disabled={isProcessing}
                      className="inline-flex items-center gap-2 rounded-xl bg-green-600 px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
                    >
                      {isProcessing ? (
                        <LoaderCircle size={17} className="animate-spin" />
                      ) : (
                        <CheckCircle size={17} />
                      )}
                      Close Ticket
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
                  className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-600 disabled:opacity-50"
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

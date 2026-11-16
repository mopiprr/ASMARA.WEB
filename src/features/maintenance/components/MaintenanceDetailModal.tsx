
import { useEffect, useMemo, useState } from 'react';

import {
  LoaderCircle,
  Send,
  Wrench,
} from 'lucide-react';

import api from '../../../services/api';

import type {
  AssignMaintenanceHandlerPayload,
  MaintenanceHandlerOption,
  MaintenanceNotePayload,
  MaintenancePartCheckPayload,
  MaintenanceProcurementItemPayload,
  MaintenanceReplacementPayload,
  MaintenanceTicket,
  OrderMaintenancePartPayload,
  RepairPartFormItem,
  RepairResult,
  SendMaintenanceReplacementPayload,
  SubmitRepairResultPayload,
} from '../types/maintenance.types';

import { useInventoryOptions } from '../../procurement/hooks/useInventoryOptions';

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

import ConfirmDialog from '../../../components/common/ConfirmDialog';
import NoteField from '../../../components/common/NoteField';
import TicketDetailModalHeader from '../../../components/common/TicketDetailModalHeader';
import TicketHistorySection from '../../../components/common/TicketHistorySection';

import MaintenanceTicketInfo from './detail/MaintenanceTicketInfo';
import MaintenanceActionSection from './detail/MaintenanceActionSection';

import AssignMaintenanceHandler from './detail/actions/AssignMaintenanceHandler';
import SubmitRepairResult from './detail/actions/SubmitRepairResult';
import CheckSparePartAvailability from './detail/actions/CheckSparePartAvailability';
import CreateSparePartProcurement from './detail/actions/CreateSparePartProcurement';
import MaintenanceDecisionActions from './detail/actions/MaintenanceDecisionActions';
import MaintenanceDispositionActions from './detail/actions/MaintenanceDispositionActions';
import InventoryReplacementDecision from './detail/actions/InventoryReplacementDecision';
import SendMaintenanceReplacement from './detail/actions/SendMaintenanceReplacement';
import MaintenanceTransferActions from './detail/actions/MaintenanceTransferActions';

interface ReplacementAssetOption {
  assetId: number;
  assetTag: string;
  itemName: string;
  categoryName: string;
}

import { useSparePartOptions } from '../hooks/useSparePartOptions';
import { evaluatePartRequirementAvailability } from './InventoryPartComparisonTable';

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

interface MaintenanceDetailPartRequirement {
  partRequirement?: string | null;
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

  const currentStep = ticket?.currentStep?.toUpperCase();

  const showSubmitRepairResultAction = Boolean(
    ticket?.canSubmitRepairResult,
  );
  const showCheckPartAction = Boolean(ticket?.canCheckPart);
  const showOrderPartAction = Boolean(ticket?.canOrderPart);

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

  // REPAIR RESULT
  const [repairResult, setRepairResult] = useState<RepairResult | ''>('');

  const [repairParts, setRepairParts] = useState<RepairPartFormItem[]>([
    {
      isCustom: false,
      itemId: null,
      itemCategoryId: '',
      itemName: '',
      quantity: 1,
    },
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

  const [replacementAssets, setReplacementAssets] = useState<
    ReplacementAssetOption[]
  >([]);

  const [isLoadingReplacementAssets, setIsLoadingReplacementAssets] =
    useState(false);

  const [replacementAssetError, setReplacementAssetError] = useState('');

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

  // INVENTORY: RESET SELECTED ASSET WHEN AVAILABILITY CHANGES
  const handleReplacementAvailabilityChange = (
    value: boolean | null,
  ) => {
    setReplacementAvailability(value);
    setSelectedReplacementAssetId('');
  };

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

  // RESET FORM WHEN TICKET CHANGES
  useEffect(() => {
    setNote('');
    setSelectedHandlerId('');
    setRepairResult('');
    setPartAvailability(null);

    setRepairParts([
      {
        isCustom: false,
        itemId: null,
        itemCategoryId: '',
        itemName: '',
        quantity: 1,
      },
    ]);

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
    setReplacementAssets([]);
    setReplacementAssetError('');
    setIsLoadingReplacementAssets(false);

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
    setConfirmConfig(null);
  }, [ticket?.id]);

  // FETCH AVAILABLE REPLACEMENT ASSETS
  useEffect(() => {
    let isMounted = true;

    const fetchReplacementAssets = async () => {
      if (
        !ticket?.id ||
        (!showReplacementDecisionAction && !showSendReplacementAction)
      ) {
        setReplacementAssets([]);
        setReplacementAssetError('');
        setIsLoadingReplacementAssets(false);
        return;
      }

      try {
        setIsLoadingReplacementAssets(true);
        setReplacementAssetError('');

        const response = await api.get<ReplacementAssetOption[]>(
          '/assets/available-for-replacement',
          {
            params: {
              ticketId: ticket.id,
            },
          },
        );

        if (isMounted) {
          setReplacementAssets(response.data ?? []);
        }
      } catch (err: unknown) {
        if (!isMounted) return;

        setReplacementAssets([]);

        const fetchError = err as {
          response?: {
            data?: {
              detail?: string;
              message?: string;
            };
          };
          message?: string;
        };

        setReplacementAssetError(
          fetchError.response?.data?.detail ||
            fetchError.response?.data?.message ||
            fetchError.message ||
            'Failed to load replacement assets.',
        );
      } finally {
        if (isMounted) {
          setIsLoadingReplacementAssets(false);
        }
      }
    };

    void fetchReplacementAssets();

    return () => {
      isMounted = false;
    };
  }, [ticket?.id, showReplacementDecisionAction, showSendReplacementAction]);

  // REPAIR RESULT
  const handleAddRepairPart = () => {
    setRepairParts((current) => [
      ...current,
      {
        isCustom: false,
        itemId: null,
        itemCategoryId: '',
        itemName: '',
        quantity: 1,
      },
    ]);
  };

  const handleRemoveRepairPart = (index: number) => {
    setRepairParts((current) =>
      current.filter((_, partIndex) => partIndex !== index),
    );
  };

  const handleToggleCustomPart = (index: number) => {
    setRepairParts((current) =>
      current.map((part, partIndex) => {
        if (partIndex !== index) return part;
        const nextCustom = !part.isCustom;
        return {
          isCustom: nextCustom,
          itemId: null,
          itemCategoryId: '',
          itemName: '',
          quantity: part.quantity > 0 ? part.quantity : 1,
          stock: undefined,
          itemCode: undefined,
          categoryName: undefined,
        };
      }),
    );
  };

  const handleSelectInventoryPart = (index: number, selectedIdStr: string) => {
    const selectedId = Number(selectedIdStr);
    const foundPart = spareParts.find((sp) => sp.id === selectedId);

    setRepairParts((current) =>
      current.map((part, partIndex) => {
        if (partIndex !== index) return part;
        if (!foundPart) {
          return {
            ...part,
            itemId: null,
            itemCategoryId: '',
            itemName: '',
            stock: undefined,
            itemCode: undefined,
            categoryName: undefined,
          };
        }
        return {
          ...part,
          itemId: foundPart.id,
          itemCategoryId: foundPart.itemCategoryId,
          itemName: foundPart.itemName,
          stock: foundPart.stock,
          itemCode: foundPart.itemCode,
          categoryName: foundPart.categoryName,
        };
      }),
    );
  };

  const handleUpdateRepairPartField = <K extends keyof RepairPartFormItem>(
    index: number,
    field: K,
    value: RepairPartFormItem[K],
  ) => {
    setRepairParts((current) =>
      current.map((part, partIndex) =>
        partIndex === index ? { ...part, [field]: value } : part,
      ),
    );
  };

  const validRepairParts = repairParts.filter((part) => {
    if (part.isCustom) {
      return (
        Boolean(part.itemCategoryId) &&
        part.itemName.trim().length > 0 &&
        part.itemName.trim().length <= 50 &&
        part.quantity > 0
      );
    }
    return part.itemId !== null && part.quantity > 0;
  });

  const canSubmitRepair =
    Boolean(repairResult) &&
    (repairResult !== 3 ||
      (repairParts.length > 0 &&
        validRepairParts.length === repairParts.length));

  const handleSubmitRepairResult = () => {
    if (!ticket || !repairResult || !canSubmitRepair) return;

    openConfirm(
      getMaintenanceRepairResultConfirm(ticket.ticketNumber, repairResult),
      async () => {
        if (repairResult === 3) {
          const payloadParts = validRepairParts.map((part) => ({
            itemId: part.isCustom ? null : part.itemId,
            itemCategoryId: Number(part.itemCategoryId),
            itemName: part.itemName.trim(),
            quantity: Number(part.quantity) || 1,
          }));

          await onSubmitRepairResult({
            result: repairResult,
            handlerNote: note.trim() || undefined,
            partRequirement: JSON.stringify(payloadParts),
            parts: payloadParts,
          });

          return;
        }

        await onSubmitRepairResult({
          result: repairResult,
          handlerNote: note.trim() || undefined,
          partRequirement: null,
          parts: [],
        });
      },
    );
  };

  // INVENTORY CHECK PART
  const handleCheckPart = () => {
    if (!ticket || partAvailability === null) return;
    if (partAvailability === true && !canConfirmAvailable) return;

    openConfirm(
      getMaintenanceCheckPartConfirm(ticket.ticketNumber, partAvailability),
      async () => {
        await onCheckPart({
          available: partAvailability,
          note: note.trim() || undefined,
        });
      },
    );
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

  const handleOrderPart = () => {
    if (!canSubmitOrderPart || !ticket) return;

    openConfirm(
      getMaintenanceOrderPartConfirm(ticket.ticketNumber, totalOrderPartPrice),
      async () => {
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
      },
    );
  };

  // INVENTORY SEND PART / HANDLER RECEIVE PART
  const handleSendPart = () => {
    if (!ticket) return;

    openConfirm(getMaintenanceSendPartConfirm(ticket.ticketNumber), async () => {
      await onSendPart({
        note: note.trim() || undefined,
      });
    });
  };

  const handleReceivePart = () => {
    if (!ticket) return;

    openConfirm(
      getMaintenanceReceivePartConfirm(ticket.ticketNumber),
      async () => {
        await onReceivePart({
          note: note.trim() || undefined,
        });
      },
    );
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
      ? selectedReplacementAssetId !== '' &&
        replacementAssets.some(
          (asset) => asset.assetId === selectedReplacementAssetId,
        ) &&
        !isLoadingReplacementAssets
      : replacementSubject.trim() !== '' &&
        validReplacementItems.length === replacementItems.length &&
        replacementItems.length > 0);

  const handleProcessReplacement = () => {
    if (!ticket || !canSubmitReplacement || replacementAvailability === null) {
      return;
    }

    openConfirm(
      getMaintenanceProcessReplacementConfirm(
        ticket.ticketNumber,
        replacementAvailability,
        totalReplacementEstimatedPrice,
      ),
      async () => {
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
      },
    );
  };

  // SEND REPLACEMENT
  const handleSendReplacement = () => {
    if (!ticket || selectedSendReplacementAssetId === '') return;

    openConfirm(
      getMaintenanceSendReplacementConfirm(ticket.ticketNumber),
      async () => {
        await onSendReplacement({
          replacementAssetId: Number(selectedSendReplacementAssetId),
          note: note.trim() || undefined,
        });
      },
    );
  };

  // GENERAL ACTIONS
  const handleApprove = () => {
    if (!ticket) return;

    openConfirm(getMaintenanceApproveConfirm(ticket.ticketNumber), async () => {
      await onApprove({ note: note.trim() || undefined });
    });
  };

  const handleReject = () => {
    if (!ticket || !note.trim()) return;

    openConfirm(getMaintenanceRejectConfirm(ticket.ticketNumber), async () => {
      await onReject({ note: note.trim() });
    });
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
      async () => {
        await onAssignHandler({
          technicianId: selectedHandlerId,
          instructionNote: note.trim() || undefined,
        });
      },
    );
  };

  const handleSendItem = () => {
    if (!ticket) return;

    openConfirm(getMaintenanceSendItemConfirm(ticket.ticketNumber), async () => {
      await onSendItem({ note: note.trim() || undefined });
    });
  };

  const handleReceiveItem = () => {
    if (!ticket) return;

    openConfirm(
      getMaintenanceReceiveItemConfirm(ticket.ticketNumber),
      async () => {
        await onReceiveItem({ note: note.trim() || undefined });
      },
    );
  };

  const handleCloseTicket = () => {
    if (!ticket) return;

    openConfirm(
      getMaintenanceCloseTicketConfirm(ticket.ticketNumber),
      async () => {
        await onCloseTicket({ note: note.trim() || undefined });
      },
    );
  };

  const handleArchive = () => {
    if (!ticket) return;

    openConfirm(getMaintenanceArchiveConfirm(ticket.ticketNumber), async () => {
      await onArchive({ note: note.trim() || undefined });
    });
  };

  const handleDispose = () => {
    if (!ticket) return;

    openConfirm(getMaintenanceDisposeConfirm(ticket.ticketNumber), async () => {
      await onDispose({ note: note.trim() || undefined });
    });
  };

  // PERMISSIONS
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

  const showReceivePartAction = Boolean(ticket?.canReceivePart);

  const showSendPartAction = Boolean(ticket?.canSendPart);

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
          {/* HEADER */}
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
                {/* TICKET INFORMATION */}
                <MaintenanceTicketInfo ticket={ticket} />

                {/* WORKFLOW HISTORY */}
                {showHistory && (
                  <TicketHistorySection history={ticket.history} />
                )}

            {/* ERROR & MAINTENANCE ACTIONS */}
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
                      Available actions depend on your role and the current workflow step.
                    </p>
                  </div>

                  {/* ASSIGN HANDLER */}
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

                  {/* SHARED ACTION NOTE */}
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

                  {/* APPROVE / REJECT */}
                  {showDecisionActions && (
                    <MaintenanceDecisionActions
                      canReject={ticket.canReject}
                      canApprove={ticket.canApprove}
                      isProcessing={isProcessing}
                      note={note}
                      onReject={handleReject}
                      onApprove={handleApprove}
                    />
                  )}

                  {/* DIVISION MANAGER: ARCHIVE / DISPOSE */}
                  {showDispositionActions && (
                    <MaintenanceDispositionActions
                      canArchive={ticket.canArchive}
                      canDispose={ticket.canDispose}
                      isProcessing={isProcessing}
                      onArchive={handleArchive}
                      onDispose={handleDispose}
                    />
                  )}

                  {/* HANDLER: SUBMIT REPAIR RESULT */}
                  {showSubmitRepairResultAction && (
                    <SubmitRepairResult
                      repairResult={repairResult}
                      setRepairResult={setRepairResult}
                      repairParts={repairParts}
                      spareParts={spareParts}
                      categories={sparePartCategories}
                      isLoadingSpareParts={isLoadingSparePartOptions}
                      sparePartsError={sparePartOptionsError}
                      onRetrySpareParts={() => void refetchSparePartOptions()}
                      isProcessing={isProcessing}
                      canSubmitRepair={canSubmitRepair}
                      onAddRepairPart={handleAddRepairPart}
                      onRemoveRepairPart={handleRemoveRepairPart}
                      onToggleCustomPart={handleToggleCustomPart}
                      onSelectInventoryPart={handleSelectInventoryPart}
                      onUpdateRepairPartField={handleUpdateRepairPartField}
                      onSubmitRepairResult={handleSubmitRepairResult}
                    />
                  )}

                  {/* INVENTORY: CHECK PART */}
                  {showCheckPartAction && (
                    <CheckSparePartAvailability
                      requiredParts={requiredParts}
                      spareParts={spareParts}
                      isLoadingSpareParts={isLoadingSparePartOptions}
                      sparePartsError={sparePartOptionsError}
                      onRetrySpareParts={() => void refetchSparePartOptions()}
                      canConfirmAvailable={canConfirmAvailable}
                      partAvailability={partAvailability}
                      isProcessing={isProcessing}
                      onSetPartAvailability={setPartAvailability}
                      onCheckPart={handleCheckPart}
                    />
                  )}

                  {/* HANDLER: CREATE SPARE PART PROCUREMENT */}
                  {showOrderPartAction && (
                    <CreateSparePartProcurement
                      ticketNumber={ticket.ticketNumber}
                      requiredParts={requiredParts}
                      orderPartSubject={orderPartSubject}
                      setOrderPartSubject={setOrderPartSubject}
                      orderPartDescription={orderPartDescription}
                      setOrderPartDescription={setOrderPartDescription}
                      orderPartItems={orderPartItems}
                      orderPartManualItems={orderPartManualItems}
                      categories={categories}
                      isLoadingCategories={isLoadingCategories}
                      categoryError={categoryError}
                      inventoryItemsByCategory={inventoryItemsByCategory}
                      loadingItems={loadingItems}
                      itemErrors={itemErrors}
                      isProcessing={isProcessing}
                      canSubmitOrderPart={canSubmitOrderPart}
                      totalOrderPartPrice={totalOrderPartPrice}
                      onCategoryChange={handleOrderPartCategoryChange}
                      onItemChange={handleOrderPartItemChange}
                      onToggleManualItem={handleToggleOrderPartManualItem}
                      onManualNameChange={handleOrderPartManualNameChange}
                      onFieldChange={handleOrderPartFieldChange}
                      onAddItem={handleAddOrderPartItem}
                      onRemoveItem={handleRemoveOrderPartItem}
                      onSubmit={handleOrderPart}
                    />
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
                    <InventoryReplacementDecision
                      replacementAvailability={replacementAvailability}
                      selectedReplacementAssetId={selectedReplacementAssetId}
                      replacementAssets={replacementAssets}
                      isLoadingReplacementAssets={isLoadingReplacementAssets}
                      replacementAssetError={replacementAssetError}
                      replacementSubject={replacementSubject}
                      setReplacementSubject={setReplacementSubject}
                      replacementDescription={replacementDescription}
                      setReplacementDescription={setReplacementDescription}
                      replacementItems={replacementItems}
                      replacementManualItems={replacementManualItems}
                      categories={categories}
                      isLoadingCategories={isLoadingCategories}
                      categoryError={categoryError}
                      inventoryItemsByCategory={inventoryItemsByCategory}
                      loadingItems={loadingItems}
                      itemErrors={itemErrors}
                      isProcessing={isProcessing}
                      canSubmitReplacement={canSubmitReplacement}
                      totalReplacementEstimatedPrice={totalReplacementEstimatedPrice}
                      onAvailabilityChange={handleReplacementAvailabilityChange}
                      onReplacementAssetChange={setSelectedReplacementAssetId}
                      onCategoryChange={handleReplacementCategoryChange}
                      onToggleManualItem={handleToggleReplacementManualItem}
                      onManualNameChange={handleReplacementManualNameChange}
                      onItemChange={handleReplacementItemChange}
                      onPriceChange={handleReplacementPriceChange}
                      onRemoveItem={handleRemoveReplacementItem}
                      onAddItem={handleAddReplacementItem}
                      onProcessReplacement={handleProcessReplacement}
                    />
                  )}

                  {/* INVENTORY: SEND REPLACEMENT */}
                  {showSendReplacementAction && (
                    <SendMaintenanceReplacement
                      assets={replacementAssets}
                      selectedAssetId={selectedSendReplacementAssetId}
                      isProcessing={isProcessing}
                      onAssetChange={setSelectedSendReplacementAssetId}
                      onSendReplacement={handleSendReplacement}
                    />
                  )}

                  {/* HANDLER: RECEIVE SPARE PARTS */}
                  {showReceivePartAction && (
                    <MaintenanceTransferActions
                      type="receive-parts"
                      isProcessing={isProcessing}
                      onClick={handleReceivePart}
                    />
                  )}

                  {/* REQUESTER: SEND ITEM */}
                  {showSendItemAction && (
                    <MaintenanceTransferActions
                      type="send-item"
                      isProcessing={isProcessing}
                      onClick={handleSendItem}
                    />
                  )}

                  {/* HANDLER: RECEIVE ITEM */}
                  {showReceiveItemAction && (
                    <MaintenanceTransferActions
                      type="receive-item"
                      isProcessing={isProcessing}
                      onClick={handleReceiveItem}
                    />
                  )}

                  {/* REQUESTER: CLOSE TICKET */}
                  {showCloseTicketAction && (
                    <MaintenanceTransferActions
                      type="close-ticket"
                      isProcessing={isProcessing}
                      onClick={handleCloseTicket}
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

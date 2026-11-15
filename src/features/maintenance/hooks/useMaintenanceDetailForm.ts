import { useEffect, useState } from 'react';

import { createEmptyItem } from '../../procurement/utils/procurement.utils';
import { createEmptyRepairPart } from '../utils/maintenanceDetail.utils';

import type { ProcurementItem } from '../../procurement/types/procurement.types';
import type {
  MaintenanceTicket,
  RepairPartFormItem,
  RepairResult,
  SparePartOption,
} from '../types/maintenance.types';

// Daftar item Procurement child (order part / pengganti), bentuk sama dengan form create Procurement.
function useChildItems() {
  const [items, setItems] = useState<ProcurementItem[]>([createEmptyItem()]);

  const update = (index: number, patch: Partial<ProcurementItem>) =>
    setItems((previous) =>
      previous.map((item, itemIndex) => (itemIndex === index ? { ...item, ...patch } : item)),
    );

  return {
    items,
    reset: () => setItems([createEmptyItem()]),
    add: () => setItems((previous) => [...previous, createEmptyItem()]),
    remove: (index: number) =>
      setItems((previous) => previous.filter((_, itemIndex) => itemIndex !== index)),
    changeCategory: (index: number, categoryId: string) =>
      update(index, { categoryId, itemId: '', itemName: '', isManual: false }),
    changeItem: (index: number, itemId: string, itemName: string) => update(index, { itemId, itemName }),
    toggleManual: (index: number) =>
      setItems((previous) =>
        previous.map((item, itemIndex) =>
          itemIndex === index ? { ...item, isManual: !item.isManual, itemId: '', itemName: '' } : item,
        ),
      ),
    changeField: (index: number, field: keyof ProcurementItem, value: string) =>
      update(index, { [field]: value } as Partial<ProcurementItem>),
  };
}

// Semua input di modal detail Maintenance. Dikosongkan setiap kali tiket berganti.
export function useMaintenanceDetailForm(ticket: MaintenanceTicket | null) {
  const [note, setNote] = useState('');

  // IT Support
  const [selectedHandlerId, setSelectedHandlerId] = useState('');

  // Handler: hasil perbaikan
  const [repairResult, setRepairResult] = useState<RepairResult | ''>('');
  const [repairParts, setRepairParts] = useState<RepairPartFormItem[]>([createEmptyRepairPart()]);

  // Inventory: cek part
  const [partAvailability, setPartAvailability] = useState<boolean | null>(null);

  // Handler: beli part
  const [orderSubject, setOrderSubject] = useState('');
  const [orderDescription, setOrderDescription] = useState('');
  const orderItems = useChildItems();

  // Inventory: pengganti
  const [replacementAvailability, setReplacementAvailability] = useState<boolean | null>(null);
  const [replacementAssetId, setReplacementAssetId] = useState<number | ''>('');
  const [replacementSubject, setReplacementSubject] = useState('');
  const [replacementDescription, setReplacementDescription] = useState('');
  const replacementItems = useChildItems();

  useEffect(() => {
    setNote('');
    setSelectedHandlerId('');
    setRepairResult('');
    setRepairParts([createEmptyRepairPart()]);
    setPartAvailability(null);
    setOrderSubject('');
    setOrderDescription('');
    orderItems.reset();
    setReplacementAvailability(null);
    setReplacementAssetId('');
    setReplacementSubject('');
    setReplacementDescription('');
    replacementItems.reset();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ticket?.id]);

  // ==========================================
  // REPAIR PARTS (Need Part)
  // ==========================================

  const repairPartsActions = {
    add: () => setRepairParts((current) => [...current, createEmptyRepairPart()]),

    remove: (index: number) =>
      setRepairParts((current) => current.filter((_, partIndex) => partIndex !== index)),

    toggleCustom: (index: number) =>
      setRepairParts((current) =>
        current.map((part, partIndex) =>
          partIndex !== index
            ? part
            : {
                ...createEmptyRepairPart(),
                isCustom: !part.isCustom,
                quantity: part.quantity > 0 ? part.quantity : 1,
              },
        ),
      ),

    selectInventoryPart: (index: number, selectedIdStr: string, spareParts: SparePartOption[]) => {
      const found = spareParts.find((sp) => sp.id === Number(selectedIdStr));

      setRepairParts((current) =>
        current.map((part, partIndex) => {
          if (partIndex !== index) return part;

          if (!found) {
            return { ...createEmptyRepairPart(), quantity: part.quantity };
          }

          return {
            ...part,
            itemId: found.id,
            itemCategoryId: found.itemCategoryId,
            itemName: found.itemName,
            stock: found.stock,
            itemCode: found.itemCode,
            categoryName: found.categoryName,
          };
        }),
      );
    },

    updateField: <K extends keyof RepairPartFormItem>(
      index: number,
      field: K,
      value: RepairPartFormItem[K],
    ) =>
      setRepairParts((current) =>
        current.map((part, partIndex) => (partIndex === index ? { ...part, [field]: value } : part)),
      ),
  };

  const changeReplacementAvailability = (value: boolean | null) => {
    setReplacementAvailability(value);
    setReplacementAssetId('');
  };

  return {
    note,
    setNote,

    selectedHandlerId,
    setSelectedHandlerId,

    repairResult,
    setRepairResult,
    repairParts,
    repairPartsActions,

    partAvailability,
    setPartAvailability,

    orderSubject,
    setOrderSubject,
    orderDescription,
    setOrderDescription,
    orderItems,

    replacementAvailability,
    changeReplacementAvailability,
    replacementAssetId,
    setReplacementAssetId,
    replacementSubject,
    setReplacementSubject,
    replacementDescription,
    setReplacementDescription,
    replacementItems,
  };
}
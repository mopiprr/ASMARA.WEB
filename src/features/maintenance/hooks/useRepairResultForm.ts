import { useCallback, useState } from 'react';

import type { SparePartItem } from '../../inventory/types/inventory.types';
import type {
  RepairPartFormItem,
  RepairResult,
  SubmitRepairResultPayload,
} from '../types/maintenance.types';

const createEmptyRepairPart = (): RepairPartFormItem => ({
  isCustom: false,
  itemId: null,
  itemCategoryId: '',
  itemName: '',
  quantity: 1,
});

/**
 * Manages Handler repair-result selection and dynamic required-part rows.
 */
export function useRepairResultForm(spareParts: SparePartItem[]) {
  const [repairResult, setRepairResult] = useState<RepairResult | ''>('');
  const [repairParts, setRepairParts] = useState<RepairPartFormItem[]>([
    createEmptyRepairPart(),
  ]);

  const reset = useCallback(() => {
    setRepairResult('');
    setRepairParts([createEmptyRepairPart()]);
  }, []);

  const handleAddRepairPart = useCallback(() => {
    setRepairParts((current) => [...current, createEmptyRepairPart()]);
  }, []);

  const handleRemoveRepairPart = useCallback((index: number) => {
    setRepairParts((current) =>
      current.filter((_, partIndex) => partIndex !== index),
    );
  }, []);

  const handleToggleCustomPart = useCallback((index: number) => {
    setRepairParts((current) =>
      current.map((part, partIndex) => {
        if (partIndex !== index) return part;
        return {
          ...createEmptyRepairPart(),
          isCustom: !part.isCustom,
          quantity: part.quantity > 0 ? part.quantity : 1,
        };
      }),
    );
  }, []);

  const handleSelectInventoryPart = useCallback(
    (index: number, selectedIdStr: string) => {
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
    },
    [spareParts],
  );

  const handleUpdateRepairPartField = useCallback(
    <K extends keyof RepairPartFormItem>(
      index: number,
      field: K,
      value: RepairPartFormItem[K],
    ) => {
      setRepairParts((current) =>
        current.map((part, partIndex) =>
          partIndex === index ? { ...part, [field]: value } : part,
        ),
      );
    },
    [],
  );

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

  const buildPayload = (note: string): SubmitRepairResultPayload | null => {
    if (!repairResult || !canSubmitRepair) return null;

    if (repairResult === 3) {
      const payloadParts = validRepairParts.map((part) => ({
        itemId: part.isCustom ? null : part.itemId,
        itemCategoryId: Number(part.itemCategoryId),
        itemName: part.itemName.trim(),
        quantity: Number(part.quantity) || 1,
      }));

      return {
        result: repairResult,
        handlerNote: note.trim() || undefined,
        partRequirement: JSON.stringify(payloadParts),
        parts: payloadParts,
      };
    }

    return {
      result: repairResult,
      handlerNote: note.trim() || undefined,
      partRequirement: null,
      parts: [],
    };
  };

  return {
    repairResult,
    setRepairResult,
    repairParts,
    canSubmitRepair,
    handleAddRepairPart,
    handleRemoveRepairPart,
    handleToggleCustomPart,
    handleSelectInventoryPart,
    handleUpdateRepairPartField,
    buildPayload,
    reset,
  };
}

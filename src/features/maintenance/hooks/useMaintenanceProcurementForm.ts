import { useCallback, useMemo, useState } from 'react';

import type { CategoryItemsState } from '../../procurement/types/procurement.types';
import type { MaintenanceProcurementItemPayload } from '../types/maintenance.types';

interface UseMaintenanceProcurementFormOptions {
  inventoryItemsByCategory: CategoryItemsState;
  fetchInventoryItems: (categoryId: string) => Promise<void>;
  fixedQuantity?: number;
}

const createEmptyItem = (
  fixedQuantity?: number,
): MaintenanceProcurementItemPayload => ({
  itemCategoryId: 0,
  itemName: '',
  quantity: fixedQuantity ?? 1,
  price: 0,
  itemId: null,
});

/**
 * Reusable child-procurement form state shared by Order Spare Part and Asset Replacement flows.
 */
export function useMaintenanceProcurementForm({
  inventoryItemsByCategory,
  fetchInventoryItems,
  fixedQuantity,
}: UseMaintenanceProcurementFormOptions) {
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [items, setItems] = useState<MaintenanceProcurementItemPayload[]>([
    createEmptyItem(fixedQuantity),
  ]);
  const [manualItems, setManualItems] = useState<boolean[]>([false]);

  const reset = useCallback(() => {
    setSubject('');
    setDescription('');
    setItems([createEmptyItem(fixedQuantity)]);
    setManualItems([false]);
  }, [fixedQuantity]);

  const handleCategoryChange = useCallback(
    (index: number, categoryId: string) => {
      const parsedCategoryId = categoryId ? Number(categoryId) : 0;

      setItems((current) =>
        current.map((item, itemIndex) =>
          itemIndex === index
            ? {
                ...item,
                itemCategoryId: parsedCategoryId,
                itemId: null,
                itemName: '',
                ...(fixedQuantity !== undefined ? { quantity: fixedQuantity } : {}),
              }
            : item,
        ),
      );

      setManualItems((current) =>
        current.map((value, itemIndex) => (itemIndex === index ? false : value)),
      );

      if (categoryId) {
        void fetchInventoryItems(categoryId);
      }
    },
    [fetchInventoryItems, fixedQuantity],
  );

  const handleItemChange = useCallback(
    (index: number, itemId: string) => {
      const categoryId = String(items[index]?.itemCategoryId ?? '');
      const availableItems = inventoryItemsByCategory[categoryId] ?? [];
      const selectedItem = availableItems.find(
        (item) => String(item.id) === itemId,
      );

      setItems((current) =>
        current.map((item, itemIndex) =>
          itemIndex === index
            ? {
                ...item,
                itemId: selectedItem ? Number(selectedItem.id) : null,
                itemName: selectedItem?.itemName ?? '',
                ...(fixedQuantity !== undefined ? { quantity: fixedQuantity } : {}),
              }
            : item,
        ),
      );
    },
    [inventoryItemsByCategory, items, fixedQuantity],
  );

  const handleToggleManualItem = useCallback(
    (index: number) => {
      setManualItems((current) =>
        current.map((value, itemIndex) =>
          itemIndex === index ? !value : value,
        ),
      );

      setItems((current) =>
        current.map((item, itemIndex) =>
          itemIndex === index
            ? {
                ...item,
                itemId: null,
                itemName: '',
                ...(fixedQuantity !== undefined ? { quantity: fixedQuantity } : {}),
              }
            : item,
        ),
      );
    },
    [fixedQuantity],
  );

  const handleManualNameChange = useCallback(
    (index: number, itemName: string) => {
      setItems((current) =>
        current.map((item, itemIndex) =>
          itemIndex === index
            ? {
                ...item,
                itemName,
                itemId: null,
                ...(fixedQuantity !== undefined ? { quantity: fixedQuantity } : {}),
              }
            : item,
        ),
      );
    },
    [fixedQuantity],
  );

  const handleFieldChange = useCallback(
    (index: number, field: 'quantity' | 'price', value: number) => {
      setItems((current) =>
        current.map((item, itemIndex) =>
          itemIndex === index
            ? {
                ...item,
                [field]:
                  field === 'quantity' && fixedQuantity !== undefined
                    ? fixedQuantity
                    : value,
              }
            : item,
        ),
      );
    },
    [fixedQuantity],
  );

  const handleAddItem = useCallback(() => {
    setItems((current) => [...current, createEmptyItem(fixedQuantity)]);
    setManualItems((current) => [...current, false]);
  }, [fixedQuantity]);

  const handleRemoveItem = useCallback((index: number) => {
    setItems((current) =>
      current.filter((_, itemIndex) => itemIndex !== index),
    );
    setManualItems((current) =>
      current.filter((_, itemIndex) => itemIndex !== index),
    );
  }, []);

  const validItems = useMemo(
    () =>
      items.filter(
        (item) =>
          item.itemCategoryId > 0 &&
          item.itemName.trim() !== '' &&
          Number.isInteger(item.quantity) &&
          (fixedQuantity !== undefined
            ? item.quantity === fixedQuantity
            : item.quantity > 0) &&
          Number.isFinite(item.price) &&
          item.price >= 0,
      ),
    [items, fixedQuantity],
  );

  const totalPrice = useMemo(
    () =>
      validItems.reduce(
        (total, item) => total + item.quantity * item.price,
        0,
      ),
    [validItems],
  );

  const buildPayloadItems = useCallback(
    (): MaintenanceProcurementItemPayload[] =>
      validItems.map((item) => ({
        itemCategoryId: Number(item.itemCategoryId),
        itemName: item.itemName.trim(),
        quantity: fixedQuantity ?? Number(item.quantity),
        price: Number(item.price),
        itemId: item.itemId ? Number(item.itemId) : null,
      })),
    [validItems, fixedQuantity],
  );

  return {
    subject,
    setSubject,
    description,
    setDescription,
    items,
    manualItems,
    validItems,
    totalPrice,
    handleCategoryChange,
    handleItemChange,
    handleToggleManualItem,
    handleManualNameChange,
    handleFieldChange,
    handleAddItem,
    handleRemoveItem,
    buildPayloadItems,
    reset,
  };
}

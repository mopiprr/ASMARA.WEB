import { useCallback, useState } from 'react';

import { procurementApi } from '../services/procurementApi';

import type {
  CategoryOption,
  CategoryItemsState,
  LoadingState,
  ErrorState,
} from '../types/procurement.types';

export function useInventoryOptions() {
  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(false);
  const [categoryError, setCategoryError] = useState('');

  const [inventoryItemsByCategory, setInventoryItemsByCategory] =
    useState<CategoryItemsState>({});

  const [loadingItems, setLoadingItems] = useState<LoadingState>({});
  const [itemErrors, setItemErrors] = useState<ErrorState>({});

  // Fetch categories
  const loadCategories = useCallback(async () => {
    if (categories.length > 0 || isLoadingCategories) return;

    try {
      setIsLoadingCategories(true);
      setCategoryError('');

      setCategories(await procurementApi.getCategories());
    } catch (error) {
      console.error('Failed to fetch item categories:', error);
      setCategoryError('Failed to load item categories.');
    } finally {
      setIsLoadingCategories(false);
    }
  }, [categories.length, isLoadingCategories]);

  // Fetch inventory items by category
  const fetchInventoryItems = async (categoryId: string) => {
    if (!categoryId) return;

    if (
      Object.prototype.hasOwnProperty.call(
        inventoryItemsByCategory,
        categoryId
      )
    ) {
      return;
    }

    try {
      setLoadingItems((current) => ({
        ...current,
        [categoryId]: true,
      }));

      setItemErrors((current) => ({
        ...current,
        [categoryId]: '',
      }));

      const items = await procurementApi.getItemsByCategory(categoryId);

      setInventoryItemsByCategory((current) => ({
        ...current,
        [categoryId]: items,
      }));
    } catch (error) {
      console.error(
        `Failed to fetch inventory items for category ${categoryId}:`,
        error
      );

      setItemErrors((current) => ({
        ...current,
        [categoryId]: 'Failed to load inventory items.',
      }));
    } finally {
      setLoadingItems((current) => ({
        ...current,
        [categoryId]: false,
      }));
    }
  };

  return {
    categories,
    isLoadingCategories,
    categoryError,
    inventoryItemsByCategory,
    loadingItems,
    loadCategories,
    itemErrors,
    fetchInventoryItems,
  };
}
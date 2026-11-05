
import { useState, type FormEvent } from 'react';

import api from '../../../services/api';

import type {
  ProcurementItem,
  ProcurementPayload,
} from '../types/procurement.types';

import { createEmptyItem } from '../utils/procurement.utils';

interface UseProcurementFormOptions {
  parentTicketId: string | null;
  onSuccess: () => Promise<void> | void;
}

export function useProcurementForm({
  parentTicketId,
  onSuccess,
}: UseProcurementFormOptions) {
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');

  const [items, setItems] = useState<ProcurementItem[]>([
    createEmptyItem(),
  ]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [submitSuccess, setSubmitSuccess] = useState('');

  const resetForm = () => {
    setSubject('');
    setDescription('');
    setItems([createEmptyItem()]);
    setSubmitError('');
  };

  const updateItem = (
    index: number,
    field: keyof ProcurementItem,
    value: string | boolean
  ) => {
    setItems((currentItems) =>
      currentItems.map((item, itemIndex) =>
        itemIndex === index
          ? { ...item, [field]: value }
          : item
      )
    );
  };

  const handleCategoryChange = (
    index: number,
    categoryId: string
  ) => {
    setItems((currentItems) =>
      currentItems.map((item, itemIndex) =>
        itemIndex === index
          ? {
              ...item,
              categoryId,
              itemId: '',
              itemName: '',
              isManual: false,
            }
          : item
      )
    );
  };

  const handleItemChange = (
    index: number,
    itemId: string,
    itemName: string
  ) => {
    updateItem(index, 'itemId', itemId);
    updateItem(index, 'itemName', itemName);
  };

  const toggleManualItem = (index: number) => {
    setItems((currentItems) =>
      currentItems.map((item, itemIndex) =>
        itemIndex === index
          ? {
              ...item,
              isManual: !item.isManual,
              itemId: '',
              itemName: '',
            }
          : item
      )
    );
  };

  const addItem = () => {
    setItems((currentItems) => [
      ...currentItems,
      createEmptyItem(),
    ]);
  };

  const removeItem = (index: number) => {
    setItems((currentItems) =>
      currentItems.filter((_, itemIndex) => itemIndex !== index)
    );
  };

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>
  ): Promise<boolean> => {
    event.preventDefault();

    setSubmitError('');
    setSubmitSuccess('');

    if (!subject.trim()) {
      setSubmitError('Subject is required.');
      return false;
    }

    if (items.length === 0) {
      setSubmitError('Please add at least one item.');
      return false;
    }

    const hasInvalidItem = items.some((item) => {
      const quantity = Number(item.quantity);
      const price = Number(item.estimatedPrice || 0);

      return (
        !item.categoryId ||
        !item.itemName.trim() ||
        (!item.isManual && !item.itemId) ||
        !Number.isInteger(quantity) ||
        quantity <= 0 ||
        !Number.isFinite(price) ||
        price < 0
      );
    });

    if (hasInvalidItem) {
      setSubmitError(
        'Please complete all item details with valid quantity and price.'
      );
      return false;
    }

    const payload: ProcurementPayload = {
      subject: subject.trim(),
      description: description.trim(),
      parentTicketId,
      items: items.map((item) => ({
        itemCategoryId: Number(item.categoryId),
        itemName: item.itemName.trim(),
        quantity: Number(item.quantity),
        price: Number(item.estimatedPrice || 0),
        itemId: item.isManual ? null : Number(item.itemId),
      })),
    };

    try {
      setIsSubmitting(true);

      await api.post('/procurements', payload);

      setSubmitSuccess(
        'Procurement request has been submitted successfully.'
      );

      resetForm();

      await onSuccess();

      return true;
    } catch (error: unknown) {
      console.error('Failed to submit procurement:', error);

      const apiError = error as {
        response?: {
          data?: {
            message?: string;
            detail?: string;
            title?: string;
          };
        };
        message?: string;
      };

      setSubmitError(
        apiError.response?.data?.message ||
        apiError.response?.data?.detail ||
        apiError.response?.data?.title ||
        apiError.message ||
        'Failed to submit procurement request. Please try again.'
      );

      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    subject,
    setSubject,
    description,
    setDescription,
    items,
    isSubmitting,
    submitError,
    submitSuccess,
    setSubmitError,
    setSubmitSuccess,
    resetForm,
    updateItem,
    handleCategoryChange,
    handleItemChange,
    toggleManualItem,
    addItem,
    removeItem,
    handleSubmit,
  };
}

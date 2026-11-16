import { useState, type FormEvent } from 'react';

import { procurementApi } from '../services/procurementApi';

import type { ProcurementItem } from '../types/procurement.types';

import {
  createEmptyItem,
  getApiErrorMessage,
} from '../utils/procurement.utils';
import {
  buildProcurementPayload,
  hasIncompleteItems,
} from '../utils/procurementForm.utils';

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

    // Penjagaan: item kosong tidak dikirim (tombol juga sudah nonaktif).
    if (hasIncompleteItems(items)) return false;

    // Validasi detail dilakukan backend (FluentValidation); pesan error-nya ditampilkan apa adanya.
    const payload = buildProcurementPayload(
      subject,
      description,
      parentTicketId,
      items
    );

    try {
      setIsSubmitting(true);

      await procurementApi.create(payload);

      setSubmitSuccess(
        'Procurement request has been submitted successfully.'
      );

      resetForm();

      await onSuccess();

      return true;
    } catch (error: unknown) {
      console.error('Failed to submit procurement:', error);

      setSubmitError(
        getApiErrorMessage(
          error,
          'Failed to submit procurement request. Please try again.',
          ['message', 'detail', 'title']
        )
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
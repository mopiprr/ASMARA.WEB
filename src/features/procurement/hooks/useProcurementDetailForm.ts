import { useEffect, useState } from 'react';

import { createEmptyItem } from '../utils/procurement.utils';
import { toEditableItems } from '../utils/procurementDetail.utils';

import type {
  ProcurementItem,
  ProcurementTicket,
} from '../types/procurement.types';

// State input di modal detail: catatan aksi + form edit untuk resubmit.
// Item yang diedit memakai bentuk yang sama dengan form create (ProcurementItem).
export function useProcurementDetailForm(ticket: ProcurementTicket | null) {
  const [note, setNote] = useState('');

  const [isEditing, setIsEditing] = useState(false);
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [editableItems, setEditableItems] = useState<ProcurementItem[]>([]);

  // Isi ulang setiap kali tiket yang dibuka berganti.
  useEffect(() => {
    if (!ticket) return;

    setSubject(ticket.subject);
    setDescription(ticket.description ?? '');
    setNote('');
    setIsEditing(false);
    setEditableItems(toEditableItems(ticket));
  }, [ticket]);

  const startEditing = () => {
    setIsEditing(true);
    setNote('');
  };

  // Batal edit -> kembalikan ke isi tiket.
  const cancelEditing = () => {
    if (!ticket) return;

    setIsEditing(false);
    setSubject(ticket.subject);
    setDescription(ticket.description ?? '');
    setEditableItems(toEditableItems(ticket));
    setNote('');
  };

  const updateItem = (
    index: number,
    field: keyof ProcurementItem,
    value: string
  ) => {
    setEditableItems((previous) =>
      previous.map((item, itemIndex) =>
        itemIndex === index ? { ...item, [field]: value } : item
      )
    );
  };

  // Sama seperti create: ganti kategori -> item dikosongkan, kembali ke mode inventory.
  const changeCategory = (index: number, categoryId: string) => {
    setEditableItems((previous) =>
      previous.map((item, itemIndex) =>
        itemIndex === index
          ? { ...item, categoryId, itemId: '', itemName: '', isManual: false }
          : item
      )
    );
  };

  const changeInventoryItem = (
    index: number,
    itemId: string,
    itemName: string
  ) => {
    setEditableItems((previous) =>
      previous.map((item, itemIndex) =>
        itemIndex === index ? { ...item, itemId, itemName } : item
      )
    );
  };

  const toggleManualItem = (index: number) => {
    setEditableItems((previous) =>
      previous.map((item, itemIndex) =>
        itemIndex === index
          ? { ...item, isManual: !item.isManual, itemId: '', itemName: '' }
          : item
      )
    );
  };

  const addItem = () => {
    setEditableItems((previous) => [...previous, createEmptyItem()]);
  };

  const removeItem = (index: number) => {
    setEditableItems((previous) =>
      previous.filter((_, itemIndex) => itemIndex !== index)
    );
  };

  return {
    note,
    setNote,
    isEditing,
    setIsEditing,
    subject,
    setSubject,
    description,
    setDescription,
    editableItems,
    startEditing,
    cancelEditing,
    updateItem,
    changeCategory,
    changeInventoryItem,
    toggleManualItem,
    addItem,
    removeItem,
  };
}
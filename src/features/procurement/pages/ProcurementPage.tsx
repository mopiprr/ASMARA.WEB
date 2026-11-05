
import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { AlertCircle } from 'lucide-react';

import ProcurementHeader from '../components/ProcurementHeader';
import ProcurementStatistics from '../components/ProcurementStatistics';
import ProcurementTable from '../components/ProcurementTable';
import ProcurementModal from '../components/ProcurementModal';

import { useProcurementTickets } from '../hooks/useProcurementTickets';
import { useProcurementForm } from '../hooks/useProcurementForm';
import { useInventoryOptions } from '../hooks/useInventoryOptions';

import type {
  ProcurementLocationState,
} from '../types/procurement.types';

// ==========================================
// COMPONENT
// ==========================================

function ProcurementPage() {
  const location = useLocation();

  const locationState =
    location.state as ProcurementLocationState | null;

  const parentTicketId =
    locationState?.parentTicketId ?? null;

  // ==========================================
  // PAGE STATE
  // ==========================================

  const [isModalOpen, setIsModalOpen] = useState(false);

  // ==========================================
  // PROCUREMENT TICKETS
  // ==========================================

  const {
    tickets,
    isLoadingTickets,
    ticketError,
    fetchTickets,
  } = useProcurementTickets();

  // ==========================================
  // INVENTORY OPTIONS
  // ==========================================

const {
  categories,
  categoryError,
  inventoryItemsByCategory,
  loadingItems,
  itemErrors,
  fetchInventoryItems,
} = useInventoryOptions();

  // ==========================================
  // PROCUREMENT FORM
  // ==========================================

  const form = useProcurementForm({
    parentTicketId,
    onSuccess: fetchTickets,
  });

  // ==========================================
  // MODAL HANDLERS
  // ==========================================

  const handleOpenModal = () => {
    form.resetForm();
    form.setSubmitError('');
    form.setSubmitSuccess('');

    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    if (form.isSubmitting) return;

    setIsModalOpen(false);

    form.resetForm();
    form.setSubmitError('');
    form.setSubmitSuccess('');
  };

  // ==========================================
  // ITEM HANDLERS
  // ==========================================

  const handleCategoryChange = (
    index: number,
    categoryId: string
  ) => {
    form.handleCategoryChange(index, categoryId);

    if (categoryId) {
      void fetchInventoryItems(categoryId);
    }
  };

  // ==========================================
  // SUBMIT HANDLER
  // ==========================================

  const handleSubmit = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    await form.handleSubmit(event);
  };

  // ==========================================
  // RENDER
  // ==========================================

  return (
    <div className="space-y-8">

      {/* PAGE HEADER */}
      <ProcurementHeader
        onNewRequest={handleOpenModal}
      />

      {/* INVENTORY CATEGORY ERROR */}
      {categoryError && (
        <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4">
          <AlertCircle
            size={20}
            className="mt-0.5 shrink-0 text-red-500"
          />

          <div>
            <p className="text-sm font-semibold text-red-700">
              Failed to load inventory categories
            </p>

            <p className="mt-1 text-xs text-red-600">
              {categoryError}
            </p>
          </div>
        </div>
      )}

      {/* STATISTICS */}
      <ProcurementStatistics
        tickets={tickets}
      />

      {/* PROCUREMENT TABLE */}
      <ProcurementTable
        tickets={tickets}
        isLoading={isLoadingTickets}
        error={ticketError}
        onRefresh={fetchTickets}
        onView={(ticket) => {
          console.log('Selected procurement ticket:', ticket);
        }}
      />

      {/* PROCUREMENT MODAL */}
      <ProcurementModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}

        parentTicketId={parentTicketId}

        subject={form.subject}
        description={form.description}
        items={form.items}

        categories={categories}
        categoryItems={inventoryItemsByCategory}
        isLoadingItems={loadingItems}
        itemErrors={itemErrors}

        isSubmitting={form.isSubmitting}
        submitError={form.submitError}
        submitSuccess={form.submitSuccess}

        onSubjectChange={form.setSubject}
        onDescriptionChange={form.setDescription}

        onCategoryChange={handleCategoryChange}
        onItemChange={form.handleItemChange}
        onToggleManualItem={form.toggleManualItem}
        onFieldChange={form.updateItem}

        onAddItem={form.addItem}
        onRemoveItem={form.removeItem}

        onSubmit={handleSubmit}
      />

    </div>
  );
}

export default ProcurementPage;

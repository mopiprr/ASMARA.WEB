import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import ProcurementHeader from '../components/ProcurementHeader';
import ProcurementDetailError from '../components/ProcurementDetailError';
import ProcurementStatistics from '../components/ProcurementStatistics';
import ProcurementTabs from '../components/ProcurementTabs';
import ProcurementTable from '../components/ProcurementTable';
import PendingProcurementTable from '../components/PendingProcurementTable';
import ProcurementModal from '../components/ProcurementModal';
import ProcurementDetailModal from '../components/ProcurementDetailModal';

import { useProcurementTickets } from '../hooks/useProcurementTickets';
import { usePendingProcurementTickets } from '../hooks/usePendingProcurementTickets';
import { useProcurementStatistics } from '../hooks/useProcurementStatistics';
import { useProcurementForm } from '../hooks/useProcurementForm';
import { useProcurementActions } from '../hooks/useProcurementActions';
import { useInventoryOptions } from '../hooks/useInventoryOptions';
import { useProcurementDetail } from '../hooks/useProcurementDetail';
import { useProcurementDeepLink } from '../hooks/useProcurementDeepLink';

import type {
  ProcurementLocationState,
  ProcurementTab,
  ResubmitProcurementPayload,
} from '../types/procurement.types';

function ProcurementPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const locationState =
    location.state as ProcurementLocationState | null;

  const parentTicketId = locationState?.parentTicketId ?? null;

  const [activeTab, setActiveTab] =
    useState<ProcurementTab>('requests');

  const [isModalOpen, setIsModalOpen] = useState(false);

  // ==========================================
  // DATA
  // ==========================================

  const myTickets = useProcurementTickets();
  const pending = usePendingProcurementTickets();
  const stats = useProcurementStatistics();

  const handleRefreshAll = async () => {
    await Promise.all([
      myTickets.fetchTickets(),
      pending.fetchPendingTickets(),
      stats.fetchStatistics(),
    ]);
  };

  // ==========================================
  // ACTIONS & DETAIL
  // ==========================================

  const {
    isProcessing,
    actionError,
    setActionError,
    executeAction,
    receiveGoods,
    resubmitProcurement,
  } = useProcurementActions({
    onSuccess: handleRefreshAll,
  });

  const detail = useProcurementDetail({
    fetchPendingTicketById: pending.fetchPendingTicketById,
    onBeforeOpen: () => setActionError(''),
  });

  // Buka tab / detail dari link Dashboard (?tab=...&ticketId=...).
  const { resetHandledTicket } = useProcurementDeepLink({
    setActiveTab,
    openTicketFromUrl: detail.openTicketFromUrl,
  });

  const selectedTicket = detail.selectedTicket;

  const handleCloseDetail = () => {
    if (isProcessing || detail.isLoadingDetail) return;

    detail.clearDetail();
    setActionError('');
    resetHandledTicket();

    // Bersihkan parameter dan arahkan ke /procurement dengan tab yang sedang aktif
    const tabQuery = activeTab === 'pending' ? '?tab=pending' : '';
    navigate(`/procurement${tabQuery}`, { replace: true });
  };

  const handleProcurementAction = async (
    action: 'approve' | 'revise' | 'reject',
    note: string
  ): Promise<boolean> => {
    if (!selectedTicket) return false;

    return executeAction(selectedTicket.id, action, note);
  };

  const handleReceiveGoods = async (
    note: string,
    proofFile: File
  ): Promise<boolean> => {
    if (!selectedTicket) return false;

    return receiveGoods(selectedTicket.id, note, proofFile);
  };

  const handleResubmit = async (
    payload: ResubmitProcurementPayload
  ): Promise<boolean> => {
    if (!selectedTicket) return false;

    return resubmitProcurement(selectedTicket.id, payload);
  };

  // ==========================================
  // CREATE MODAL
  // ==========================================

  const inventory = useInventoryOptions();

  const form = useProcurementForm({
    parentTicketId,

    onSuccess: async () => {
      await handleRefreshAll();
      setIsModalOpen(false);
    },
  });

  const handleOpenModal = () => {
    form.resetForm();
    form.setSubmitError('');
    form.setSubmitSuccess('');

    setIsModalOpen(true);

    void inventory.loadCategories();
  };

  const handleCloseModal = () => {
    if (form.isSubmitting) return;

    setIsModalOpen(false);

    form.resetForm();
    form.setSubmitError('');
    form.setSubmitSuccess('');
  };

  // Ganti kategori -> kosongkan item lalu muat item inventory kategori itu.
  const handleCategoryChange = (
    index: number,
    categoryId: string
  ) => {
    form.handleCategoryChange(index, categoryId);

    if (categoryId) {
      void inventory.fetchInventoryItems(categoryId);
    }
  };

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

      <ProcurementHeader onNewRequest={handleOpenModal} />

      <ProcurementDetailError message={detail.detailError} />

      <ProcurementStatistics
        statistics={stats.statistics}
        isLoading={stats.isLoading}
      />

      <div className="space-y-5">
        <ProcurementTabs
          activeTab={activeTab}
          onTabChange={setActiveTab}
          requestsCount={myTickets.totalCount}
          pendingCount={pending.totalCount}
        />

        {activeTab === 'requests' && (
          <ProcurementTable
            tickets={myTickets.tickets}
            isLoading={myTickets.isLoadingTickets}
            error={myTickets.ticketError}
            onRefresh={myTickets.fetchTickets}
            onView={detail.openTicket}
            sortBy={myTickets.sortBy}
            desc={myTickets.desc}
            onSort={myTickets.toggleSort}
            page={myTickets.page}
            totalPages={myTickets.totalPages}
            totalCount={myTickets.totalCount}
            onPageChange={myTickets.setPage}
          />
        )}

        {activeTab === 'pending' && (
          <PendingProcurementTable
            tickets={pending.tickets}
            isLoading={pending.isLoading}
            error={pending.error}

            search={pending.search}
            onSearchChange={pending.setSearch}

            page={pending.page}
            totalPages={pending.totalPages}
            totalCount={pending.totalCount}

            onPageChange={pending.goToPage}
            onRefresh={pending.fetchPendingTickets}
            onView={detail.openPendingTicket}

            sortBy={pending.sortBy}
            desc={pending.desc}
            onSort={pending.toggleSort}
            isLoadingDetail={detail.isLoadingDetail}
          />
        )}
      </div>

      <ProcurementModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        parentTicketId={parentTicketId}
        subject={form.subject}
        description={form.description}
        items={form.items}
        categories={inventory.categories}
        categoryItems={inventory.inventoryItemsByCategory}
        isLoadingItems={inventory.loadingItems}
        itemErrors={inventory.itemErrors}
        isSubmitting={form.isSubmitting}
        submitError={form.submitError || inventory.categoryError}
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

      <ProcurementDetailModal
        ticket={selectedTicket}
        isProcessing={isProcessing}
        actionError={actionError}
        onClose={handleCloseDetail}
        onAction={handleProcurementAction}
        onReceiveGoods={handleReceiveGoods}
        onResubmit={handleResubmit}
      />

    </div>
  );
}

export default ProcurementPage;
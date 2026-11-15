import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import MaintenanceHeader from '../components/MaintenanceHeader';
import MaintenanceDetailError from '../components/MaintenanceDetailError';
import MaintenanceStatistics from '../components/MaintenanceStatistics';
import MaintenanceTabs from '../components/MaintenanceTabs';
import MaintenanceTable from '../components/MaintenanceTable';
import PendingMaintenanceTable from '../components/PendingMaintenanceTable';
import MaintenanceCreateModal from '../components/create/MaintenanceCreateModal';
import MaintenanceDetailModal from '../components/detail/MaintenanceDetailModal';

import { useMaintenanceTickets } from '../hooks/useMaintenanceTickets';
import { usePendingMaintenanceTickets } from '../hooks/usePendingMaintenanceTickets';
import { useMaintenanceStatistics } from '../hooks/useMaintenanceStatistics';
import { useMaintenanceActions } from '../hooks/useMaintenanceActions';
import { useMaintenanceDetail } from '../hooks/useMaintenanceDetail';
import { useMaintenanceDeepLink } from '../hooks/useMaintenanceDeepLink';
import { useMaintenanceCreateForm } from '../hooks/useMaintenanceCreateForm';
import { useLazyOptions } from '../hooks/useLazyOptions';

import { maintenanceApi } from '../services/maintenanceApi';

import type { MaintenanceAssetOption, MaintenanceTab } from '../types/maintenance.types';

function MaintenanceDashboard() {
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<MaintenanceTab>('requests');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // ==========================================
  // DATA
  // ==========================================

  const myTickets = useMaintenanceTickets();
  const pending = usePendingMaintenanceTickets();
  const stats = useMaintenanceStatistics();

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

  const { isProcessing, actionError, setActionError, run } = useMaintenanceActions({
    onSuccess: handleRefreshAll,
  });

  const detail = useMaintenanceDetail({
    fetchPendingTicketById: pending.fetchPendingTicketById,
    onBeforeOpen: () => setActionError(''),
  });

  // Buka tab / detail dari link Dashboard (?tab=...&ticketId=...).
  const { resetHandledTicket } = useMaintenanceDeepLink({
    setActiveTab,
    openTicketFromUrl: detail.openTicketFromUrl,
  });

  const handleCloseDetail = () => {
    if (isProcessing || detail.isLoadingDetail) return;

    detail.clearDetail();
    setActionError('');
    resetHandledTicket();

    // Bersihkan parameter dan arahkan ke /maintenance dengan tab yang sedang aktif
    const tabQuery = activeTab === 'pending' ? '?tab=pending' : '';
    navigate(`/maintenance${tabQuery}`, { replace: true });
  };

  // ==========================================
  // CREATE MODAL
  // ==========================================

  const form = useMaintenanceCreateForm({
    onSuccess: async () => {
      await handleRefreshAll();
      setIsModalOpen(false);
    },
  });

  // Asset baru dimuat saat modal create dibuka.
  const assets = useLazyOptions<MaintenanceAssetOption>(
    maintenanceApi.getAssetsForMaintenance,
    isModalOpen,
    'Failed to load assets.',
  );

  const handleOpenModal = () => {
    form.resetForm();
    form.setSubmitError('');
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    if (form.isSubmitting) return;

    setIsModalOpen(false);
    form.resetForm();
    form.setSubmitError('');
  };

  // ==========================================
  // RENDER
  // ==========================================

  return (
    <div className="space-y-8">
      <MaintenanceHeader onNewRequest={handleOpenModal} />

      <MaintenanceDetailError message={detail.detailError} />

      <MaintenanceStatistics statistics={stats.statistics} isLoading={stats.isLoading} />

      <div className="space-y-5">
        <MaintenanceTabs
          activeTab={activeTab}
          onTabChange={setActiveTab}
          requestsCount={myTickets.totalCount}
          pendingCount={pending.totalCount}
        />

        {activeTab === 'requests' && (
          <MaintenanceTable
            tickets={myTickets.tickets}
            isLoading={myTickets.isLoading}
            error={myTickets.error}
            search={myTickets.search}
            onSearchChange={myTickets.setSearch}
            sortBy={myTickets.sortBy}
            desc={myTickets.desc}
            onSort={myTickets.toggleSort}
            page={myTickets.page}
            totalPages={myTickets.totalPages}
            totalCount={myTickets.totalCount}
            onPageChange={myTickets.goToPage}
            onRefresh={() => void myTickets.fetchTickets()}
            onView={(ticket) => void detail.openTicket(ticket)}
            isLoadingDetail={detail.isLoadingDetail}
          />
        )}

        {activeTab === 'pending' && (
          <PendingMaintenanceTable
            tickets={pending.tickets}
            isLoading={pending.isLoading}
            error={pending.error}
            search={pending.search}
            onSearchChange={pending.setSearch}
            sortBy={pending.sortBy}
            desc={pending.desc}
            onSort={pending.toggleSort}
            page={pending.page}
            totalPages={pending.totalPages}
            totalCount={pending.totalCount}
            onPageChange={pending.goToPage}
            onRefresh={() => void pending.fetchPendingTickets()}
            onView={(ticket) => void detail.openPendingTicket(ticket)}
            isLoadingDetail={detail.isLoadingDetail}
          />
        )}
      </div>

      <MaintenanceCreateModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        form={form}
        assets={assets.options}
        isLoadingAssets={assets.isLoading}
        assetError={assets.error}
        onReloadAssets={() => void assets.reload()}
      />

      <MaintenanceDetailModal
        ticket={detail.selectedTicket}
        isProcessing={isProcessing}
        actionError={actionError}
        onClose={handleCloseDetail}
        onRunAction={run}
      />
    </div>
  );
}

export default MaintenanceDashboard;
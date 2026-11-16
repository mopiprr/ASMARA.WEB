
import { useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

import {
  AlertCircle,
  ClipboardList,
  Clock,
  Plus,
} from 'lucide-react';

import { useToast } from '../../../components/common/ToastProvider';

import MaintenanceHeader from '../components/MaintenanceHeader';
import MaintenanceStatistics from '../components/MaintenanceStatistics';
import MaintenanceTable from '../components/MaintenanceTable';
import PendingMaintenanceTable from '../components/PendingMaintenanceTable';
import MaintenanceCreateModal from '../components/MaintenanceCreateModal';
import MaintenanceDetailModal from '../components/MaintenanceDetailModal';

import { useMaintenanceTickets } from '../hooks/useMaintenanceTickets';
import { usePendingMaintenanceTickets } from '../hooks/usePendingMaintenanceTickets';
import { useMaintenanceOptions } from '../hooks/useMaintenanceOptions';
import { useMaintenanceActions } from '../hooks/useMaintenanceActions';

import type {
  AssignMaintenanceHandlerPayload,
  CreateMaintenancePayload,
  MaintenanceNotePayload,
  MaintenancePartCheckPayload,
  MaintenanceReplacementPayload,
  MaintenanceTicket,
  MaintenanceTicketListItem,
  OrderMaintenancePartPayload,
  PendingMaintenanceTicket,
  SendMaintenanceReplacementPayload,
  SubmitRepairResultPayload,
} from '../types/maintenance.types';

type MaintenanceTab = 'requests' | 'pending';

function MaintenanceDashboard() {
  const navigate = useNavigate();
  const { showSuccess } = useToast();

  const [activeTab, setActiveTab] =
    useState<MaintenanceTab>('requests');

  const [selectedTicket, setSelectedTicket] =
    useState<MaintenanceTicket | null>(null);

  const [isPendingView, setIsPendingView] = useState(false);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);
  const [detailError, setDetailError] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [searchParams] = useSearchParams();
  const handledTicketIdRef = useRef<string | null>(null);

  // ==========================================
  // MY MAINTENANCE REQUESTS
  // ==========================================

  const {
    tickets,
    isLoading: isLoadingTickets,
    error: ticketError,
    search: requestSearch,
    setSearch: setRequestSearch,
    sortBy: requestSortBy,
    desc: requestDesc,
    toggleSort: toggleRequestSort,
    page: requestPage,
    totalCount: requestTotalCount,
    totalPages: requestTotalPages,
    fetchTickets,
    fetchTicketById,
    goToPage: goToRequestPage,
  } = useMaintenanceTickets();

  // ==========================================
  // PENDING MAINTENANCE TASKS
  // ==========================================

  const {
    tickets: pendingTickets,
    isLoading: isLoadingPending,
    error: pendingError,
    search: pendingSearch,
    setSearch: setPendingSearch,
    sortBy: pendingSortBy,
    desc: pendingDesc,
    toggleSort: togglePendingSort,
    page: pendingPage,
    totalCount: pendingTotalCount,
    totalPages: pendingTotalPages,
    fetchPendingTickets,
    fetchPendingTicketById,
    goToPage: goToPendingPage,
  } = usePendingMaintenanceTickets();

  // ==========================================
  // MAINTENANCE OPTIONS
  // ==========================================

  const {
    assets,
    handlers,
    isLoadingAssets,
    isLoadingHandlers,
    assetError,
    handlerError,
    fetchAssets,
    fetchHandlers,
  } = useMaintenanceOptions();

  // ==========================================
  // MAINTENANCE ACTIONS
  // ==========================================

  const {
    createMaintenance,
    approveMaintenance,
    rejectMaintenance,
    assignHandler,
    sendItem,
    receiveItem,
    closeMaintenance,
    submitRepairResult,
    checkPart,
    orderPart,
    sendPart,
    receivePart,
    disposeMaintenance,
    archiveMaintenance,
    processReplacement,
    sendReplacement,
    isProcessing,
    actionError,
    setActionError,
  } = useMaintenanceActions({
    onSuccess: async () => {
      await Promise.all([
        fetchTickets(),
        fetchPendingTickets(),
      ]);
    },
  });

  // ==========================================
  // CREATE MAINTENANCE
  // ==========================================

  const handleCreateMaintenance = async (
    payload: CreateMaintenancePayload,
  ) => {
    await createMaintenance(payload);
    showSuccess('Maintenance request submitted successfully.');
  };

  const handleOpenCreateModal = () => {
    setIsCreateModalOpen(true);
    void fetchAssets();
  };

  // ==========================================
  // LOAD MAINTENANCE DETAIL
  // ==========================================

  const loadMaintenanceDetail = async (
    ticketId: string,
    fetchDetail: (id: string) => Promise<MaintenanceTicket>,
  ) => {
    setIsLoadingDetail(true);
    setDetailError('');
    setSelectedTicket(null);
    setActionError('');

    try {
      const detail = await fetchDetail(ticketId);
      setSelectedTicket(detail);

      // Load handler options only when assignment is permitted.
      if (detail.canAssignHandler === true) {
        try {
          await fetchHandlers();
        } catch (handlerFetchError) {
          console.error(
            'FAILED TO FETCH MAINTENANCE HANDLERS:',
            handlerFetchError,
          );
        }
      }
    } catch (error: unknown) {
      console.error('Failed to load maintenance detail:', error);

      setDetailError(
        error instanceof Error
          ? error.message
          : 'Failed to load maintenance ticket details.',
      );
    } finally {
      setIsLoadingDetail(false);
    }
  };

  // URL Deep-linking from Dashboard
  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam === 'pending') {
      setActiveTab('pending');
    } else if (tabParam === 'requests') {
      setActiveTab('requests');
    }

    const ticketIdParam = searchParams.get('ticketId');
    if (ticketIdParam) {
      if (handledTicketIdRef.current === ticketIdParam) return;
      handledTicketIdRef.current = ticketIdParam;

      void (async () => {
        try {
          if (tabParam === 'pending') {
            try {
              setIsPendingView(true);
              await loadMaintenanceDetail(ticketIdParam, fetchPendingTicketById);
            } catch {
              setIsPendingView(false);
              await loadMaintenanceDetail(ticketIdParam, fetchTicketById);
            }
          } else {
            setIsPendingView(false);
            await loadMaintenanceDetail(ticketIdParam, fetchTicketById);
          }
        } catch (err) {
          console.error('Failed to open maintenance ticket from URL param:', err);
        }
      })();
    }
  }, [searchParams, fetchTicketById, fetchPendingTicketById]);

  // ==========================================
  // VIEW MY REQUEST DETAIL
  // ==========================================

  const handleViewTicket = async (
    ticket: MaintenanceTicketListItem,
  ) => {
    setIsPendingView(false);
    await loadMaintenanceDetail(ticket.id, fetchTicketById);
  };

  // ==========================================
  // VIEW PENDING DETAIL
  // ==========================================

  const handleViewPendingTicket = async (
    ticket: PendingMaintenanceTicket,
  ) => {
    setIsPendingView(true);
    await loadMaintenanceDetail(
      ticket.id,
      fetchPendingTicketById,
    );
  };

  // ==========================================
  // CLOSE DETAIL
  // ==========================================

  const handleCloseDetail = () => {
    if (isLoadingDetail || isProcessing) return;

    setSelectedTicket(null);
    setIsPendingView(false);
    setDetailError('');
    setActionError('');
    handledTicketIdRef.current = null;

    const tabQuery = activeTab === 'pending' ? '?tab=pending' : '';
    navigate(`/maintenance${tabQuery}`, { replace: true });
  };

  // ==========================================
  // COMMON ACTION HANDLER
  // ==========================================

  const handleAction = async (
    action: () => Promise<unknown>,
    errorMessage: string,
    successMessage: string,
  ) => {
    try {
      setDetailError('');
      setActionError('');

      await action();

      setSelectedTicket(null);
      setIsPendingView(false);
      handledTicketIdRef.current = null;
      const tabQuery = activeTab === 'pending' ? '?tab=pending' : '';
      navigate(`/maintenance${tabQuery}`, { replace: true });

      showSuccess(successMessage);
    } catch (error: unknown) {
      console.error(errorMessage, error);

      setDetailError(
        error instanceof Error
          ? error.message
          : errorMessage,
      );
    }
  };

  // ==========================================
  // APPROVE MAINTENANCE
  // ==========================================

  const handleApproveMaintenance = (
    payload: MaintenanceNotePayload,
  ) =>
    handleAction(
      () => approveMaintenance(selectedTicket!.id, payload),
      'Failed to approve maintenance ticket.',
      'Maintenance ticket approved.',
    );

  // ==========================================
  // REJECT MAINTENANCE
  // ==========================================

  const handleRejectMaintenance = (
    payload: MaintenanceNotePayload,
  ) =>
    handleAction(
      () => rejectMaintenance(selectedTicket!.id, payload),
      'Failed to reject maintenance ticket.',
      'Maintenance ticket rejected.',
    );

  // ==========================================
  // ASSIGN MAINTENANCE HANDLER
  // ==========================================

  const handleAssignHandler = (
    payload: AssignMaintenanceHandlerPayload,
  ) =>
    handleAction(
      () => assignHandler(selectedTicket!.id, payload),
      'Failed to assign maintenance handler.',
      'Maintenance handler assigned.',
    );

  // ==========================================
  // REQUESTER SEND ITEM
  // ==========================================

  const handleSendItem = (
    payload: MaintenanceNotePayload,
  ) =>
    handleAction(
      () => sendItem(selectedTicket!.id, payload),
      'Failed to send maintenance item.',
      'Item marked as sent.',
    );

  // ==========================================
  // REQUESTER RECEIVE ITEM
  // ==========================================

  const handleReceiveItem = (
    payload: MaintenanceNotePayload,
  ) =>
    handleAction(
      () => receiveItem(selectedTicket!.id, payload),
      'Failed to receive maintenance item.',
      'Item confirmed received.',
    );

  // ==========================================
  // REQUESTER CLOSE TICKET
  // ==========================================

  const handleCloseTicket = (
    payload: MaintenanceNotePayload,
  ) =>
    handleAction(
      () => closeMaintenance(selectedTicket!.id, payload),
      'Failed to close maintenance ticket.',
      'Maintenance ticket closed.',
    );

  // ==========================================
  // DIVISION MANAGER: ARCHIVE MAINTENANCE
  // ==========================================

  const handleArchiveMaintenance = (
    payload: MaintenanceNotePayload,
  ) =>
    handleAction(
      () => archiveMaintenance(selectedTicket!.id, payload),
      'Failed to archive maintenance asset.',
      'Asset disposition set to Archive.',
    );

  // ==========================================
  // DIVISION MANAGER: DISPOSE MAINTENANCE
  // ==========================================

  const handleDisposeMaintenance = (
    payload: MaintenanceNotePayload,
  ) =>
    handleAction(
      () => disposeMaintenance(selectedTicket!.id, payload),
      'Failed to dispose maintenance asset.',
      'Asset disposition set to Dispose.',
    );

  // ==========================================
  // HANDLER SUBMIT REPAIR RESULT
  // ==========================================

  const handleSubmitRepairResult = (
    payload: SubmitRepairResultPayload,
  ) =>
    handleAction(
      () => submitRepairResult(selectedTicket!.id, payload),
      'Failed to submit repair result.',
      'Repair result submitted.',
    );

  // ==========================================
  // INVENTORY CHECK PART
  // ==========================================

  const handleCheckPart = (
    payload: MaintenancePartCheckPayload,
  ) =>
    handleAction(
      () => checkPart(selectedTicket!.id, payload),
      'Failed to check spare part availability.',
      'Spare part check recorded.',
    );

  // ==========================================
  // INVENTORY ORDER PART
  // ==========================================

  const handleOrderPart = (
    payload: OrderMaintenancePartPayload,
  ) =>
    handleAction(
      () => orderPart(selectedTicket!.id, payload),
      'Failed to create spare part procurement request.',
      'Spare part procurement request created.',
    );

  // ==========================================
  // INVENTORY SEND PART
  // ==========================================

  const handleSendPart = (
    payload: MaintenanceNotePayload,
  ) =>
    handleAction(
      () => sendPart(selectedTicket!.id, payload),
      'Failed to send spare parts to maintenance handler.',
      'Spare parts marked as sent.',
    );

  // ==========================================
  // HANDLER RECEIVE PART
  // ==========================================

  const handleReceivePart = (
    payload: MaintenanceNotePayload,
  ) =>
    handleAction(
      () => receivePart(selectedTicket!.id, payload),
      'Failed to receive spare parts.',
      'Spare parts confirmed received.',
    );

  // ==========================================
  // INVENTORY: PROCESS REPLACEMENT
  // ==========================================

  const handleProcessReplacement = (
    payload: MaintenanceReplacementPayload,
  ) =>
    handleAction(
      () => processReplacement(selectedTicket!.id, payload),
      'Failed to process replacement availability.',
      'Replacement decision submitted.',
    );

  // ==========================================
  // INVENTORY: SEND REPLACEMENT
  // ==========================================

  const handleSendReplacement = (
    payload: SendMaintenanceReplacementPayload,
  ) =>
    handleAction(
      () => sendReplacement(selectedTicket!.id, payload),
      'Failed to send replacement asset.',
      'Replacement asset marked as sent.',
    );

  // ==========================================
  // RENDER
  // ==========================================

  return (
    <div className="space-y-8">
      {/* PAGE HEADER */}

      <div className="flex flex-wrap items-center justify-between gap-4">
        <MaintenanceHeader />

        <button
          type="button"
          onClick={handleOpenCreateModal}
          className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
        >
          <Plus size={18} />
          New Request
        </button>
      </div>

      {/* DETAIL ERROR */}

      {detailError && !selectedTicket && (
        <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4">
          <AlertCircle
            size={20}
            className="mt-0.5 shrink-0 text-red-500"
          />

          <div>
            <p className="text-sm font-semibold text-red-700">
              Failed to open maintenance ticket
            </p>

            <p className="mt-1 text-xs text-red-600">
              {detailError}
            </p>
          </div>
        </div>
      )}

      {/* STATISTICS */}

      <MaintenanceStatistics
        totalRequests={requestTotalCount}
        pendingTasks={pendingTotalCount}
        isLoading={isLoadingTickets || isLoadingPending}
      />

      {/* TABS */}

      <section className="space-y-5">
        <div className="flex flex-wrap items-center gap-2 border-b border-slate-200">
          {/* MY REQUESTS */}

          <button
            type="button"
            onClick={() => setActiveTab('requests')}
            className={`inline-flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-medium transition ${
              activeTab === 'requests'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <ClipboardList size={17} />

            My Requests

            <span
              className={`rounded-full px-2 py-0.5 text-xs ${
                activeTab === 'requests'
                  ? 'bg-blue-100 text-blue-700'
                  : 'bg-slate-100 text-slate-600'
              }`}
            >
              {requestTotalCount}
            </span>
          </button>

          {/* PENDING TASKS */}

          <button
            type="button"
            onClick={() => setActiveTab('pending')}
            className={`inline-flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-medium transition ${
              activeTab === 'pending'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Clock size={17} />

            Pending Tasks

            <span
              className={`rounded-full px-2 py-0.5 text-xs ${
                activeTab === 'pending'
                  ? 'bg-blue-100 text-blue-700'
                  : 'bg-slate-100 text-slate-600'
              }`}
            >
              {pendingTotalCount}
            </span>
          </button>
        </div>

        {/* MY REQUESTS */}

        {activeTab === 'requests' && (
          <MaintenanceTable
            tickets={tickets}
            isLoading={isLoadingTickets}
            error={ticketError}
            search={requestSearch}
            onSearchChange={setRequestSearch}
            sortBy={requestSortBy}
            desc={requestDesc}
            onSort={toggleRequestSort}
            page={requestPage}
            totalPages={requestTotalPages}
            totalCount={requestTotalCount}
            onPageChange={goToRequestPage}
            onRefresh={fetchTickets}
            onView={handleViewTicket}
            isLoadingDetail={isLoadingDetail}
          />
        )}

        {/* PENDING TASKS */}

        {activeTab === 'pending' && (
          <PendingMaintenanceTable
            tickets={pendingTickets}
            isLoading={isLoadingPending}
            error={pendingError}
            search={pendingSearch}
            onSearchChange={setPendingSearch}
            sortBy={pendingSortBy}
            desc={pendingDesc}
            onSort={togglePendingSort}
            page={pendingPage}
            totalPages={pendingTotalPages}
            totalCount={pendingTotalCount}
            onPageChange={goToPendingPage}
            onRefresh={fetchPendingTickets}
            onView={handleViewPendingTicket}
            isLoadingDetail={isLoadingDetail}
          />
        )}
      </section>

      {/* CREATE MAINTENANCE MODAL */}

      <MaintenanceCreateModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        assets={assets}
        isLoadingAssets={isLoadingAssets}
        assetError={assetError}
        onSubmit={handleCreateMaintenance}
        onRefreshAssets={fetchAssets}
      />

      {/* DETAIL MODAL */}

      <MaintenanceDetailModal
        ticket={selectedTicket}
        showHistory={!isPendingView}
        isLoading={isLoadingDetail}
        isProcessing={isProcessing}
        error={detailError}
        actionError={actionError}
        handlers={handlers}
        isLoadingHandlers={isLoadingHandlers}
        handlerError={handlerError}
        onClose={handleCloseDetail}
        onApprove={handleApproveMaintenance}
        onReject={handleRejectMaintenance}
        onAssignHandler={handleAssignHandler}
        onSendItem={handleSendItem}
        onReceiveItem={handleReceiveItem}
        onCloseTicket={handleCloseTicket}
        onArchive={handleArchiveMaintenance}
        onDispose={handleDisposeMaintenance}
        onSubmitRepairResult={handleSubmitRepairResult}
        onCheckPart={handleCheckPart}
        onOrderPart={handleOrderPart}
        onSendPart={handleSendPart}
        onReceivePart={handleReceivePart}
        onProcessReplacement={handleProcessReplacement}
        onSendReplacement={handleSendReplacement}
        onRefreshHandlers={fetchHandlers}
      />
    </div>
  );
}

export default MaintenanceDashboard;

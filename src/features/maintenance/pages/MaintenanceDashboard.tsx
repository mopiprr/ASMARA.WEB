
import { useState } from 'react';

import {
  AlertCircle,
  ClipboardList,
  Clock,
  Plus,
  X,
  CheckCircle,
  XCircle,
  LoaderCircle,
} from 'lucide-react';

import MaintenanceHeader from '../components/MaintenanceHeader';
import MaintenanceStatistics from '../components/MaintenanceStatistics';
import MaintenanceTable from '../components/MaintenanceTable';
import PendingMaintenanceTable from '../components/PendingMaintenanceTable';
import MaintenanceCreateModal from '../components/MaintenanceCreateModal';

import { useMaintenanceTickets } from '../hooks/useMaintenanceTickets';
import { usePendingMaintenanceTickets } from '../hooks/usePendingMaintenanceTickets';
import { useMaintenanceOptions } from '../hooks/useMaintenanceOptions';
import { useMaintenanceActions } from '../hooks/useMaintenanceActions';

import type {
  CreateMaintenancePayload,
  MaintenanceTicket,
  MaintenanceTicketListItem,
  PendingMaintenanceTicket,
} from '../types/maintenance.types';

type MaintenanceTab = 'requests' | 'pending';

function formatDate(value: string | null) {
  if (!value) return '-';

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return '-';

  return date.toLocaleString('id-ID', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
}

function MaintenanceDashboard() {
  const [activeTab, setActiveTab] =
    useState<MaintenanceTab>('requests');

  const [selectedTicket, setSelectedTicket] =
    useState<MaintenanceTicket | null>(null);

  const [isLoadingDetail, setIsLoadingDetail] =
    useState(false);

  const [detailError, setDetailError] = useState('');

  const [decisionNote, setDecisionNote] = useState('');

  const [isCreateModalOpen, setIsCreateModalOpen] =
    useState(false);

  // ==========================================
  // MY MAINTENANCE REQUESTS
  // ==========================================

  const {
    tickets,
    isLoading: isLoadingTickets,
    error: ticketError,

    search: requestSearch,
    setSearch: setRequestSearch,

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
    isLoadingAssets,
    assetError,
    fetchAssets,
  } = useMaintenanceOptions();

  // ==========================================
  // MAINTENANCE ACTIONS
  // ==========================================

  const {
    createMaintenance,
    approveMaintenance,
    rejectMaintenance,
    isProcessing,
    actionError,
    setActionError,
  } = useMaintenanceActions({
    onSuccess: async () => {
      await fetchTickets();
      await fetchPendingTickets();
      await fetchAssets();
    },
  });

  // ==========================================
  // CREATE MAINTENANCE
  // ==========================================

  const handleCreateMaintenance = async (
    payload: CreateMaintenancePayload,
  ) => {
    await createMaintenance(payload);
  };

  const handleOpenCreateModal = () => {
    setIsCreateModalOpen(true);
    void fetchAssets();
  };

  // ==========================================
  // VIEW MY REQUEST DETAIL
  // ==========================================

  const handleViewTicket = async (
    ticket: MaintenanceTicketListItem,
  ) => {
    try {
      setIsLoadingDetail(true);
      setDetailError('');
      setDecisionNote('');
      setSelectedTicket(null);
      setActionError('');

      const detail = await fetchTicketById(ticket.id);

      setSelectedTicket(detail);
    } catch (error: unknown) {
      console.error(
        'Failed to open maintenance ticket:',
        error,
      );

      setDetailError(
        error instanceof Error
          ? error.message
          : 'Failed to load maintenance detail.',
      );
    } finally {
      setIsLoadingDetail(false);
    }
  };

  // ==========================================
  // VIEW PENDING DETAIL
  // ==========================================

  const handleViewPendingTicket = async (
    ticket: PendingMaintenanceTicket,
  ) => {
    try {
      setIsLoadingDetail(true);
      setDetailError('');
      setDecisionNote('');
      setSelectedTicket(null);
      setActionError('');

      const detail = await fetchPendingTicketById(ticket.id);

      setSelectedTicket(detail);
    } catch (error: unknown) {
      console.error(
        'Failed to open pending maintenance ticket:',
        error,
      );

      setDetailError(
        error instanceof Error
          ? error.message
          : 'Failed to load pending maintenance detail.',
      );
    } finally {
      setIsLoadingDetail(false);
    }
  };

  // ==========================================
  // CLOSE DETAIL
  // ==========================================

  const handleCloseDetail = () => {
    if (isLoadingDetail || isProcessing) return;

    setSelectedTicket(null);
    setDetailError('');
    setDecisionNote('');
    setActionError('');
  };

  // ==========================================
  // APPROVE MAINTENANCE
  // ==========================================

  const handleApproveMaintenance = async () => {
    if (!selectedTicket) return;

    try {
      setDetailError('');
      setActionError('');

      await approveMaintenance(selectedTicket.id, {
        note: decisionNote.trim() || undefined,
      });

      setSelectedTicket(null);
      setDecisionNote('');
    } catch (error: unknown) {
      console.error(
        'Failed to approve maintenance ticket:',
        error,
      );

      setDetailError(
        error instanceof Error
          ? error.message
          : 'Failed to approve maintenance ticket.',
      );
    }
  };

  // ==========================================
  // REJECT MAINTENANCE
  // ==========================================

  const handleRejectMaintenance = async () => {
    if (!selectedTicket) return;

    if (!decisionNote.trim()) {
      setDetailError(
        'Please provide a reason for rejecting this maintenance request.',
      );
      return;
    }

    try {
      setDetailError('');
      setActionError('');

      await rejectMaintenance(selectedTicket.id, {
        note: decisionNote.trim(),
      });

      setSelectedTicket(null);
      setDecisionNote('');
    } catch (error: unknown) {
      console.error(
        'Failed to reject maintenance ticket:',
        error,
      );

      setDetailError(
        error instanceof Error
          ? error.message
          : 'Failed to reject maintenance ticket.',
      );
    }
  };

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
      {(selectedTicket || isLoadingDetail) && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/50 p-4">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-xl">
            {/* MODAL HEADER */}
            <div className="flex items-center justify-between border-b border-slate-100 p-5">
              <div>
                <h2 className="text-lg font-bold text-slate-800">
                  Maintenance Details
                </h2>

                <p className="mt-1 text-xs text-slate-500">
                  Ticket information
                </p>
              </div>

              <button
                type="button"
                onClick={handleCloseDetail}
                disabled={isLoadingDetail || isProcessing}
                className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 disabled:opacity-50"
                aria-label="Close detail"
              >
                <X size={20} />
              </button>
            </div>

            {/* LOADING */}
            {isLoadingDetail ? (
              <div className="p-12 text-center">
                <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />

                <p className="mt-3 text-sm text-slate-500">
                  Loading maintenance detail...
                </p>
              </div>
            ) : selectedTicket ? (
              <div className="space-y-6 p-6">
                {/* TICKET NUMBER */}
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                    Ticket Number
                  </p>

                  <p className="mt-1 font-semibold text-blue-600">
                    {selectedTicket.ticketNumber}
                  </p>
                </div>

                {/* BASIC INFORMATION */}
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                  <div>
                    <p className="text-xs text-slate-400">
                      Subject
                    </p>

                    <p className="mt-1 text-sm font-medium text-slate-800">
                      {selectedTicket.subject}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-slate-400">
                      Requester
                    </p>

                    <p className="mt-1 text-sm font-medium text-slate-800">
                      {selectedTicket.employeeName || '-'}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-slate-400">
                      Assigned Handler
                    </p>

                    <p className="mt-1 text-sm font-medium text-slate-800">
                      {selectedTicket.assignedTo || '-'}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-slate-400">
                      Created Date
                    </p>

                    <p className="mt-1 text-sm font-medium text-slate-800">
                      {formatDate(selectedTicket.createdAt)}
                    </p>
                  </div>
                </div>

                {/* CURRENT STEP */}
                <div>
                  <p className="text-xs text-slate-400">
                    Current Step
                  </p>

                  <p className="mt-1 text-sm font-semibold text-slate-800">
                    {selectedTicket.currentStep}
                  </p>
                </div>

                {/* DESCRIPTION */}
                <div>
                  <p className="text-xs text-slate-400">
                    Description
                  </p>

                  <p className="mt-1 whitespace-pre-wrap text-sm text-slate-700">
                    {selectedTicket.description || '-'}
                  </p>
                </div>

                {/* ASSET INFORMATION */}
                <div className="rounded-xl border border-slate-200 p-4">
                  <h3 className="text-sm font-semibold text-slate-800">
                    Asset Information
                  </h3>

                  {selectedTicket.maintenanceDetail ? (
                    <div className="mt-3 space-y-2 text-sm">
                      <p>
                        <span className="text-slate-400">
                          Asset Tag:{' '}
                        </span>

                        <span className="font-medium text-slate-700">
                          {selectedTicket.maintenanceDetail.assetTag || '-'}
                        </span>
                      </p>

                      <p>
                        <span className="text-slate-400">
                          Problem Description:{' '}
                        </span>

                        <span className="text-slate-700">
                          {selectedTicket.maintenanceDetail.description || '-'}
                        </span>
                      </p>

                      <p>
                        <span className="text-slate-400">
                          Handler Note:{' '}
                        </span>

                        <span className="text-slate-700">
                          {selectedTicket.maintenanceDetail.handlerNote || '-'}
                        </span>
                      </p>
                    </div>
                  ) : (
                    <p className="mt-3 text-sm text-slate-400">
                      No maintenance detail available.
                    </p>
                  )}
                </div>

                {/* WORKFLOW HISTORY */}
                <div>
                  <h3 className="text-sm font-semibold text-slate-800">
                    Workflow History
                  </h3>

                  <div className="mt-3 space-y-3">
                    {selectedTicket.history?.length ? (
                      selectedTicket.history.map((item, index) => (
                        <div
                          key={`${item.createdAt}-${index}`}
                          className="rounded-xl border border-slate-100 p-4"
                        >
                          <p className="text-sm font-semibold text-slate-800">
                            {item.actionLabel}
                          </p>

                          <p className="mt-1 text-xs text-slate-500">
                            {item.fromStep} → {item.toStep}
                          </p>

                          <p className="mt-2 text-xs text-slate-500">
                            {item.employeeName || 'System'} ·{' '}
                            {formatDate(item.createdAt)}
                          </p>

                          {item.note && (
                            <p className="mt-2 text-sm text-slate-600">
                              {item.note}
                            </p>
                          )}
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-slate-400">
                        No workflow history available.
                      </p>
                    )}
                  </div>
                </div>

                {/* ACTION ERROR */}
                {(detailError || actionError) && (
                  <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4">
                    <AlertCircle
                      size={18}
                      className="mt-0.5 shrink-0 text-red-500"
                    />

                    <p className="text-sm text-red-700">
                      {detailError || actionError}
                    </p>
                  </div>
                )}

                {/* APPROVAL / REJECTION */}
                {(selectedTicket.canApprove ||
                  selectedTicket.canReject) && (
                  <div className="space-y-4 border-t border-slate-100 pt-5">
                    <div>
                      <h3 className="text-sm font-semibold text-slate-800">
                        Maintenance Request Decision
                      </h3>

                      <p className="mt-1 text-xs text-slate-500">
                        Review this request and provide a note if necessary.
                      </p>
                    </div>

                    {/* DECISION NOTE */}
                    <div>
                      <label
                        htmlFor="decisionNote"
                        className="mb-2 block text-sm font-medium text-slate-700"
                      >
                        Decision Note
                        {selectedTicket.canReject && (
                          <span className="ml-1 text-red-500">*</span>
                        )}
                      </label>

                      <textarea
                        id="decisionNote"
                        value={decisionNote}
                        onChange={(event) => {
                          setDecisionNote(event.target.value);
                          setDetailError('');
                          setActionError('');
                        }}
                        rows={3}
                        placeholder="Write your note or reason for this decision..."
                        disabled={isProcessing}
                        className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-50"
                      />

                      {selectedTicket.canReject && (
                        <p className="mt-1 text-xs text-slate-400">
                          A rejection reason is required.
                        </p>
                      )}
                    </div>

                    {/* DECISION BUTTONS */}
                    <div className="flex flex-wrap justify-end gap-3">
                      <button
                        type="button"
                        onClick={handleCloseDetail}
                        disabled={isProcessing}
                        className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        Cancel
                      </button>

                      {selectedTicket.canReject && (
                        <button
                          type="button"
                          onClick={handleRejectMaintenance}
                          disabled={
                            isProcessing ||
                            !decisionNote.trim()
                          }
                          className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {isProcessing ? (
                            <LoaderCircle
                              size={17}
                              className="animate-spin"
                            />
                          ) : (
                            <XCircle size={17} />
                          )}

                          Reject
                        </button>
                      )}

                      {selectedTicket.canApprove && (
                        <button
                          type="button"
                          onClick={handleApproveMaintenance}
                          disabled={isProcessing}
                          className="inline-flex items-center gap-2 rounded-xl bg-green-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {isProcessing ? (
                            <LoaderCircle
                              size={17}
                              className="animate-spin"
                            />
                          ) : (
                            <CheckCircle size={17} />
                          )}

                          Approve
                        </button>
                      )}
                    </div>
                  </div>
                )}

                {/* CLOSE BUTTON FOR NON-APPROVERS */}
                {!selectedTicket.canApprove &&
                  !selectedTicket.canReject && (
                    <div className="flex justify-end border-t border-slate-100 pt-4">
                      <button
                        type="button"
                        onClick={handleCloseDetail}
                        className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
                      >
                        Close
                      </button>
                    </div>
                  )}
              </div>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
}

export default MaintenanceDashboard;

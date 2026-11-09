
import { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import {
  AlertCircle,
  ClipboardList,
  Clock,
} from 'lucide-react';

import api from '../../../services/api';

import ProcurementHeader from '../components/ProcurementHeader';
import ProcurementStatistics from '../components/ProcurementStatistics';
import ProcurementTable from '../components/ProcurementTable';
import PendingProcurementTable from '../components/PendingProcurementTable';
import ProcurementModal from '../components/ProcurementModal';
import ProcurementDetailModal from '../components/ProcurementDetailModal';

import { useProcurementTickets } from '../hooks/useProcurementTickets';
import { usePendingProcurementTickets } from '../hooks/usePendingProcurementTickets';
import { useProcurementForm } from '../hooks/useProcurementForm';
import { useProcurementActions } from '../hooks/useProcurementActions';
import { useInventoryOptions } from '../hooks/useInventoryOptions';

import type {
  ProcurementLocationState,
  ProcurementTicket,
  ProcurementTicketListItem,
  PendingProcurementTicket,
  ResubmitProcurementPayload,
} from '../types/procurement.types';

type ProcurementTab = 'requests' | 'pending';

function ProcurementPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const locationState =
    location.state as ProcurementLocationState | null;

  const parentTicketId = locationState?.parentTicketId ?? null;

  // ==========================================
  // PAGE STATE
  // ==========================================

  const [searchParams] = useSearchParams();
  const handledTicketIdRef = useRef<string | null>(null);

  const [activeTab, setActiveTab] =
    useState<ProcurementTab>('requests');

  const [isModalOpen, setIsModalOpen] = useState(false);

  const [selectedTicket, setSelectedTicket] =
    useState<ProcurementTicket | null>(null);

  const [isLoadingDetail, setIsLoadingDetail] = useState(false);

  const [pendingDetailError, setPendingDetailError] = useState('');

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
  // PENDING PROCUREMENT TICKETS
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
  } = usePendingProcurementTickets();

  // ==========================================
  // REFRESH BOTH TABLES
  // ==========================================

  const handleRefreshAll = async () => {
    await Promise.all([
      fetchTickets(),
      fetchPendingTickets(),
    ]);
  };

  // ==========================================
  // PROCUREMENT ACTIONS
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

    onSuccess: async () => {
      await handleRefreshAll();
      setIsModalOpen(false);
    },
  });

  // ==========================================
  // CREATE MODAL HANDLERS
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
  // MY REQUESTS DETAIL HANDLER
  // ==========================================

  const handleViewTicket = async (
    ticket: ProcurementTicketListItem
  ) => {
    try {
      setIsLoadingDetail(true);
      setPendingDetailError('');
      setActionError('');
      setSelectedTicket(null);

      // Ambil detail lengkap berdasarkan ID tiket.
      const response = await api.get<ProcurementTicket>(
        `/tickets/${ticket.id}`
      );

      setSelectedTicket(response.data);
    } catch (error: unknown) {
      console.error('Failed to open procurement ticket:', error);

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

      setPendingDetailError(
        apiError.response?.data?.detail ||
          apiError.response?.data?.message ||
          apiError.response?.data?.title ||
          apiError.message ||
          'Failed to load procurement ticket detail.'
      );
    } finally {
      setIsLoadingDetail(false);
    }
  };

  // ==========================================
  // PENDING DETAIL HANDLER
  // ==========================================

  const handleViewPendingTicket = async (
    ticket: PendingProcurementTicket
  ) => {
    try {
      setIsLoadingDetail(true);
      setPendingDetailError('');
      setActionError('');
      setSelectedTicket(null);

      const detail = await fetchPendingTicketById(ticket.id);

      setSelectedTicket(detail);
    } catch (error: unknown) {
      console.error('Failed to open pending ticket:', error);

      setPendingDetailError(
        error instanceof Error
          ? error.message
          : 'Failed to load procurement ticket detail.'
      );
    } finally {
      setIsLoadingDetail(false);
    }
  };

  // ==========================================
  // URL PARAMS DEEP LINKING (FROM DASHBOARD)
  // ==========================================

  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam === 'pending') {
      setActiveTab('pending');
    } else if (tabParam === 'requests' || tabParam === 'my_request') {
      setActiveTab('requests');
    }

    const ticketIdParam = searchParams.get('ticketId');
    if (ticketIdParam) {
      if (handledTicketIdRef.current === ticketIdParam) {
        return;
      }
      handledTicketIdRef.current = ticketIdParam;

      void (async () => {
        try {
          setIsLoadingDetail(true);
          setPendingDetailError('');

          if (tabParam === 'pending') {
            const detail = await fetchPendingTicketById(ticketIdParam);
            setSelectedTicket(detail);
          } else {
            const response = await api.get<ProcurementTicket>(
              `/tickets/${ticketIdParam}`
            );
            setSelectedTicket(response.data);
          }
        } catch (err: unknown) {
          console.error('Failed to open ticket from URL param:', err);
          const apiError = err as {
            response?: { data?: { message?: string; detail?: string } };
            message?: string;
          };
          setPendingDetailError(
            apiError.response?.data?.detail ||
              apiError.response?.data?.message ||
              apiError.message ||
              'Failed to load ticket detail from URL.'
          );
        } finally {
          setIsLoadingDetail(false);
        }
      })();
    } else {
      handledTicketIdRef.current = null;
    }
  }, [searchParams, fetchPendingTicketById]);

  // ==========================================
  // CLOSE DETAIL MODAL
  // ==========================================

  const handleCloseDetail = () => {
    if (isProcessing || isLoadingDetail) return;

    setSelectedTicket(null);
    setActionError('');
    setPendingDetailError('');
    handledTicketIdRef.current = null;

    // Bersihkan parameter dan arahkan ke /procurement dengan tab yang sedang aktif
    const tabQuery = activeTab === 'pending' ? '?tab=pending' : '';
    navigate(`/procurement${tabQuery}`, { replace: true });
  };

  // ==========================================
  // APPROVAL ACTION
  // ==========================================

  const handleProcurementAction = async (
    action: 'approve' | 'revise' | 'reject',
    note: string
  ): Promise<boolean> => {
    if (!selectedTicket) return false;

    return executeAction(
      selectedTicket.id,
      action,
      note
    );
  };

  // ==========================================
  // PURCHASING ACTION
  // ==========================================

  const handleReceiveGoods = async (
    note: string
  ): Promise<boolean> => {
    if (!selectedTicket) return false;

    return receiveGoods(
      selectedTicket.id,
      note
    );
  };

  // ==========================================
  // RESUBMIT PROCUREMENT
  // ==========================================

  const handleResubmit = async (
    payload: ResubmitProcurementPayload
  ): Promise<boolean> => {
    if (!selectedTicket) return false;

    return resubmitProcurement(
      selectedTicket.id,
      payload
    );
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

      {/* DETAIL ERROR */}
      {pendingDetailError && (
        <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4">
          <AlertCircle
            size={20}
            className="mt-0.5 shrink-0 text-red-500"
          />

          <div>
            <p className="text-sm font-semibold text-red-700">
              Failed to open procurement ticket
            </p>

            <p className="mt-1 text-xs text-red-600">
              {pendingDetailError}
            </p>
          </div>
        </div>
      )}

      {/* STATISTICS */}
      <ProcurementStatistics
        tickets={tickets}
      />

      {/* PROCUREMENT TABS */}
      <div className="space-y-5">

        {/* TAB NAVIGATION */}
        <div className="flex flex-wrap items-center gap-2 border-b border-gray-200">

          {/* MY REQUESTS TAB */}
          <button
            type="button"
            onClick={() => setActiveTab('requests')}
            className={`inline-flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-medium transition ${
              activeTab === 'requests'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-800'
            }`}
          >
            <ClipboardList size={17} />

            My Requests

            <span
              className={`rounded-full px-2 py-0.5 text-xs ${
                activeTab === 'requests'
                  ? 'bg-blue-100 text-blue-700'
                  : 'bg-gray-100 text-gray-600'
              }`}
            >
              {tickets.length}
            </span>
          </button>

          {/* PENDING APPROVAL TAB */}
          <button
            type="button"
            onClick={() => setActiveTab('pending')}
            className={`inline-flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-medium transition ${
              activeTab === 'pending'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-800'
            }`}
          >
            <Clock size={17} />

            Pending Approval

            <span
              className={`rounded-full px-2 py-0.5 text-xs ${
                activeTab === 'pending'
                  ? 'bg-blue-100 text-blue-700'
                  : 'bg-gray-100 text-gray-600'
              }`}
            >
              {pendingTotalCount}
            </span>
          </button>
        </div>

        {/* MY REQUESTS CONTENT */}
        {activeTab === 'requests' && (
          <ProcurementTable
            tickets={tickets}
            isLoading={isLoadingTickets}
            error={ticketError}
            onRefresh={fetchTickets}
            onView={handleViewTicket}
          />
        )}

        {/* PENDING APPROVAL CONTENT */}
        {activeTab === 'pending' && (
          <PendingProcurementTable
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
      </div>

      {/* CREATE PROCUREMENT MODAL */}
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

      {/* PROCUREMENT DETAIL MODAL */}
      <ProcurementDetailModal
        ticket={selectedTicket}
        isProcessing={isProcessing}
        actionError={actionError}

        canApprove={selectedTicket?.canApprove ?? false}
        canRevise={selectedTicket?.canRevise ?? false}
        canReject={selectedTicket?.canReject ?? false}
        canReceiveGoods={selectedTicket?.canReceiveGoods ?? false}
        canResubmit={selectedTicket?.canResubmit ?? false}

        onClose={handleCloseDetail}
        onAction={handleProcurementAction}
        onReceiveGoods={handleReceiveGoods}
        onResubmit={handleResubmit}
      />

    </div>
  );
}

export default ProcurementPage;

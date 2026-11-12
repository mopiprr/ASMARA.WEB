import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import DashboardHeader from '../components/DashboardHeader';
import DashboardFilterBar from '../components/DashboardFilterBar';
import TicketTypeDistributionChart from '../components/TicketTypeDistributionChart';
import TicketStatusDistributionChart from '../components/TicketStatusDistributionChart';
import TicketActivityTrendChart from '../components/TicketActivityTrendChart';
import DepartmentBudgetBarChart from '../components/DepartmentBudgetBarChart';
import MyActivityTable from '../components/MyActivityTable';
import AssetDistributionChart from '../components/AssetDistributionChart';

import { useTicketStatistics } from '../hooks/useTicketStatistics';
import { useTicketTypeDistribution } from '../hooks/useTicketTypeDistribution';
import { useTopTickets } from '../hooks/useTopTickets';

import { getSessionUser } from '../../../services/authSession';
import { getDashboardAccess } from '../utils/dashboard.utils';

import type { TopTicketItem } from '../types/dashboard.types';

function DashboardPage() {
  const navigate = useNavigate();

  // Nama & role diambil dari sesi login (tidak perlu panggil /profile/me lagi).
  const user = getSessionUser();
  const { isApprover, canViewAssets, canViewFinance, hasSubordinates } = getDashboardAccess();
  const [scope, setScope] = useState<'personal' | 'team'>('personal');

  // Statistik tiket + filter global (tab & tanggal)
  const {
    stats,
    ticketFilter,
    setTicketFilter,
    startDate,
    setStartDate,
    endDate,
    setEndDate,
    isLoading: isLoadingStats,
    error: statsError,
    refetch: refetchStats,
  } = useTicketStatistics();

  const typeDistribution = useTicketTypeDistribution(startDate, endDate);

  const topTickets = useTopTickets(scope === 'team');

  const activityTypeParam =
    ticketFilter === 'maintenance'
      ? '1'
      : ticketFilter === 'procurement'
      ? '2'
      : '';

  const handleRefresh = () => {
    void refetchStats();
    void typeDistribution.refetch();

    // My Activity, Trend & Asset chart mendengarkan event ini.
    window.dispatchEvent(new CustomEvent('refresh-dashboard-activity'));
  };

  const handleOpenTicket = (ticket: TopTicketItem) => {
    // Hanya arahkan ke tab 'pending' jika user adalah approver dan memang sedang melihat list pending approval.
    // Untuk pemohon biasa (atau tiket pribadi yang sedang menunggu approval orang lain), harus selalu ke tab 'requests'.
    const isPendingApprovalTask = isApprover && topTickets.activeCategory === 'pending';
    const tab = isPendingApprovalTask ? 'pending' : 'requests';
    const page = ticket.ticketType === 2 ? 'procurement' : 'maintenance';

    navigate(`/${page}?tab=${tab}&ticketId=${ticket.id}`);
  };

  return (
    <div className="space-y-8">
      {/* HEADER & FILTER */}
      <section className="space-y-4">
        <DashboardHeader fullName={user?.fullName ?? 'User'} />

        <DashboardFilterBar
          ticketFilter={ticketFilter}
          onTicketFilterChange={setTicketFilter}
          startDate={startDate}
          endDate={endDate}
          onStartDateChange={setStartDate}
          onEndDateChange={setEndDate}
          isRefreshing={isLoadingStats}
          onRefresh={handleRefresh}
          hasSubordinates={hasSubordinates}
          scope={scope}
          onScopeChange={setScope}
        />
      </section>

      {/* TICKET DISTRIBUTION & STATUS (2 DONUT CHARTS WITH INLINE ACCORDIONS) */}
      <section>
        {statsError && (
          <div className="mb-4 flex items-center justify-between rounded-xl bg-amber-50 p-3 text-xs text-amber-800">
            <span>{statsError}</span>
            <button
              type="button"
              onClick={() => void refetchStats()}
              className="font-semibold underline hover:text-amber-900"
            >
              Retry
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <TicketTypeDistributionChart
            procurementCount={typeDistribution.distribution.procurement}
            maintenanceCount={typeDistribution.distribution.maintenance}
            isLoading={typeDistribution.isLoading}
            activeKey={topTickets.activeCategory}
            onToggle={topTickets.toggleCategory}
            tickets={topTickets.tickets}
            isTicketsLoading={topTickets.isLoading}
            ticketsError={topTickets.error}
            onOpenTicket={handleOpenTicket}
          />

          <TicketStatusDistributionChart
            stats={stats}
            isApprover={isApprover}
            isLoading={isLoadingStats}
            activeKey={topTickets.activeCategory}
            onToggle={topTickets.toggleCategory}
            tickets={topTickets.tickets}
            isTicketsLoading={topTickets.isLoading}
            ticketsError={topTickets.error}
            onOpenTicket={handleOpenTicket}
          />
        </div>
      </section>

      {/* ACTIVITY TREND */}
      <TicketActivityTrendChart isApprover={isApprover} />

      {/* DEPARTMENT BUDGET ALLOCATION & EXPENDITURE (khusus role Finance) */}
      {canViewFinance && <DepartmentBudgetBarChart />}

      {/* MY ACTIVITY / MY RECENT REQUESTS */}
      <MyActivityTable
        type={activityTypeParam}
        fromDate={startDate}
        toDate={endDate}
        isApprover={isApprover}
      />

      {/* ASSET (khusus role Inventory) */}
      {canViewAssets && <AssetDistributionChart />}
    </div>
  );
}

export default DashboardPage;
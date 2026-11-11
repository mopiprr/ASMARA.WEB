import { useNavigate } from 'react-router-dom';
import { Ticket } from 'lucide-react';

import DashboardHeader from '../components/DashboardHeader';
import DashboardFilterBar from '../components/DashboardFilterBar';
import TicketStatisticsCards from '../components/TicketStatisticsCards';
import TopTicketsPanel from '../components/TopTicketsPanel';
import ResolutionPerformanceCard from '../components/ResolutionPerformanceCard';
import TicketTypeDistributionChart from '../components/TicketTypeDistributionChart';
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
  const { isApprover, canViewAssets, canViewFinance } = getDashboardAccess();

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

  const topTickets = useTopTickets();

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
    const tab = topTickets.activeCategory === 'pending' ? 'pending' : 'requests';
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
        />
      </section>

      {/* TICKET STATISTICS + TOP 5 */}
      <section>
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-800">
              Ticket Statistics
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Overview of your personal ticket requests
            </p>
          </div>

          <Ticket size={22} className="text-blue-600" />
        </div>

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

        <TicketStatisticsCards
          stats={stats}
          isApprover={isApprover}
          isLoading={isLoadingStats}
          activeCategory={topTickets.activeCategory}
          onToggle={topTickets.toggleCategory}
        />

        {topTickets.activeCategory && (
          <TopTicketsPanel
            category={topTickets.activeCategory}
            isApprover={isApprover}
            isLoading={topTickets.isLoading}
            error={topTickets.error}
            totalCount={topTickets.tickets.length}
            procurementTickets={topTickets.procurementTickets}
            maintenanceTickets={topTickets.maintenanceTickets}
            onClose={topTickets.close}
            onOpenTicket={handleOpenTicket}
          />
        )}
      </section>

      {/* DISTRIBUTION & RESOLUTION */}
      <section className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <TicketTypeDistributionChart
            procurementCount={typeDistribution.distribution.procurement}
            maintenanceCount={typeDistribution.distribution.maintenance}
            isLoading={typeDistribution.isLoading}
          />
        </div>

        <ResolutionPerformanceCard stats={stats} isApprover={isApprover} />
      </section>

      {/* ACTIVITY TREND */}
      <TicketActivityTrendChart isApprover={isApprover} />

      {/* DEPARTMENT BUDGET ALLOCATION & EXPENDITURE (khusus role Finance) */}
      {canViewFinance && <DepartmentBudgetBarChart />}

      {/* MY ACTIVITY */}
      <MyActivityTable
        type={activityTypeParam}
        fromDate={startDate}
        toDate={endDate}
      />

      {/* ASSET (khusus role Inventory) */}
      {canViewAssets && <AssetDistributionChart />}
    </div>
  );
}

export default DashboardPage;
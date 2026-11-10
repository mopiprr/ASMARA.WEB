import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Ticket,
  Clock,
  CheckCircle2,
  CalendarDays,
  AlertCircle,
  Activity,
  Package,
  RefreshCw,
  Filter,
  ChevronDown,
  ChevronUp,
  X,
  ArrowRight,
  RotateCcw,
  Wrench,
} from 'lucide-react';
import api from '../../../services/api';
import { useTicketStatistics } from '../hooks/useTicketStatistics';
import type { TicketStatisticsResponse } from '../types/dashboard.types';
import MyActivityTable from '../components/MyActivityTable';
import TicketTypeDistributionChart from '../components/TicketTypeDistributionChart';
import TicketActivityTrendChart from '../components/TicketActivityTrendChart';
import AssetDistributionChart from '../components/AssetDistributionChart';

interface UserProfile {
  employeeId: string;
  employeeNumber: string;
  fullName: string;
  email: string;
  department?: string;
  departmentName?: string;
  roles: string[];
}

type StatCategory = 'total' | 'pending' | 'in_progress' | 'completed';

interface TopTicketItem {
  id: string;
  ticketNumber: string;
  subject: string;
  ticketType: number; // 1 = Maintenance, 2 = Procurement
  ticketTypeName?: string;
  currentStep?: string;
  currentStepName?: string;
}

function DashboardPage() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchProfile() {
      try {
        setLoading(true);
        setError('');

        const response = await api.get<UserProfile>('/profile/me');
        setProfile(response.data);
      } catch (err: unknown) {
        console.error('Failed to load profile in dashboard:', err);
        setError(
          err instanceof Error
            ? err.message
            : 'Terjadi kesalahan saat mengambil profil pengguna.',
        );
      } finally {
        setLoading(false);
      }
    }

    void fetchProfile();
  }, []);

  // Evaluasi apakah user memiliki wewenang approval (Manager, Finance, Purchasing, Inventory, IT Support, dll)
  const userRoles = useMemo(() => profile?.roles ?? [], [profile?.roles]);
  const isApprover = useMemo(() => {
    return userRoles.some((r) => {
      const role = r.toUpperCase();
      return (
        role !== 'ROL-01' &&
        role !== 'EMPLOYEE' &&
        (role.startsWith('ROL-') ||
          role.includes('MANAGER') ||
          role.includes('FINANCE') ||
          role.includes('PURCHASING') ||
          role.includes('INVENTORY') ||
          role.includes('SUPPORT') ||
          role.includes('HANDLER'))
      );
    });
  }, [userRoles]);

  // Drawer / Accordion State Top 5 Tickets
  const [activeCategory, setActiveCategory] = useState<StatCategory | null>(null);
  const [topTickets, setTopTickets] = useState<TopTicketItem[]>([]);
  const [loadingTopTickets, setLoadingTopTickets] = useState(false);
  const [topTicketsError, setTopTicketsError] = useState('');

  // Fetch Top 5 Tickets
  const fetchTopTickets = useCallback(async (category: StatCategory) => {
    try {
      setLoadingTopTickets(true);
      setTopTicketsError('');

      let items: TopTicketItem[] = [];

      if (category === 'pending') {
        const res = await api.get('/tickets/pending', {
          params: { page: 1, pageSize: 5, desc: true },
        });
        const list = (res.data as { items?: any[] })?.items ?? [];
        items = list.map((t: any) => ({
          id: String(t.id),
          ticketNumber: String(t.ticketNumber),
          subject: String(t.subject),
          ticketType: Number(t.ticketType),
          ticketTypeName: t.ticketTypeName || (Number(t.ticketType) === 1 ? 'Maintenance' : 'Procurement'),
          currentStep: t.currentStep,
          currentStepName: t.currentStepName,
        }));
      } else if (category === 'total') {
        const res = await api.get('/tickets', {
          params: { page: 1, pageSize: 5, desc: true },
        });
        const list = (res.data as { items?: any[] })?.items ?? [];
        items = list.map((t: any) => ({
          id: String(t.id),
          ticketNumber: String(t.ticketNumber),
          subject: String(t.subject),
          ticketType: Number(t.ticketType),
          ticketTypeName: Number(t.ticketType) === 1 ? 'Maintenance' : 'Procurement',
          currentStep: t.currentStep,
          currentStepName: t.currentStepName,
        }));
      } else if (category === 'in_progress') {
        const res = await api.get('/tickets', {
          params: { isClosed: false, page: 1, pageSize: 5, desc: true },
        });
        const list = (res.data as { items?: any[] })?.items ?? [];
        items = list.map((t: any) => ({
          id: String(t.id),
          ticketNumber: String(t.ticketNumber),
          subject: String(t.subject),
          ticketType: Number(t.ticketType),
          ticketTypeName: Number(t.ticketType) === 1 ? 'Maintenance' : 'Procurement',
          currentStep: t.currentStep,
          currentStepName: t.currentStepName,
        }));
      } else if (category === 'completed') {
        const res = await api.get('/tickets/completed/my', {
          params: { page: 1, pageSize: 5, desc: true },
        });
        const list = (res.data as { items?: any[] })?.items ?? [];
        items = list.map((t: any) => ({
          id: String(t.id),
          ticketNumber: String(t.ticketNumber),
          subject: String(t.subject),
          ticketType: Number(t.ticketType),
          ticketTypeName: t.ticketTypeName || (Number(t.ticketType) === 1 ? 'Maintenance' : 'Procurement'),
          currentStep: t.currentStep,
          currentStepName: t.currentStepName,
        }));
      }

      setTopTickets(items);
    } catch (err: unknown) {
      console.error('Failed to load top tickets:', err);
      setTopTicketsError('Gagal memuat daftar tiket top 5.');
    } finally {
      setLoadingTopTickets(false);
    }
  }, []);

  const handleToggleCard = (catId: StatCategory) => {
    if (activeCategory === catId) {
      setActiveCategory(null);
      return;
    }
    setActiveCategory(catId);
    void fetchTopTickets(catId);
  };

  const handleNavigateToTicket = (ticket: TopTicketItem) => {
    const isProc = ticket.ticketType === 2;
    const isPending = activeCategory === 'pending';
    const tabParam = isPending ? 'pending' : 'requests';

    if (isProc) {
      navigate(`/procurement?tab=${tabParam}&ticketId=${ticket.id}`);
    } else {
      navigate(`/maintenance?tab=${tabParam}&ticketId=${ticket.id}`);
    }
  };

  const procurementList = useMemo(
    () => topTickets.filter((t) => t.ticketType === 2),
    [topTickets]
  );

  const maintenanceList = useMemo(
    () => topTickets.filter((t) => t.ticketType === 1),
    [topTickets]
  );

  // Ticket Statistics Hook
  const {
    stats: ticketStats,
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

  const [showDateFilter, setShowDateFilter] = useState(false);

  // Ticket Type Distribution (Procurement vs Maintenance)
  const [typeDistribution, setTypeDistribution] = useState({
    maintenance: 0,
    procurement: 0,
  });
  const [loadingTypeDist, setLoadingTypeDist] = useState(false);

  const fetchTypeDistribution = useCallback(async () => {
    try {
      setLoadingTypeDist(true);
      const paramsMaint: Record<string, string | number> = { type: 1 };
      const paramsProc: Record<string, string | number> = { type: 2 };

      if (startDate) {
        paramsMaint.startDate = startDate;
        paramsProc.startDate = startDate;
      }
      if (endDate) {
        paramsMaint.endDate = endDate;
        paramsProc.endDate = endDate;
      }

      const [resMaint, resProc] = await Promise.all([
        api.get<TicketStatisticsResponse>('/Dashboard/ticket-statistics', {
          params: paramsMaint,
        }),
        api.get<TicketStatisticsResponse>('/Dashboard/ticket-statistics', {
          params: paramsProc,
        }),
      ]);

      const rawMaint = resMaint.data as unknown as Record<string, number>;
      const rawProc = resProc.data as unknown as Record<string, number>;

      setTypeDistribution({
        maintenance: rawMaint.totalTickets ?? rawMaint.TotalTickets ?? 0,
        procurement: rawProc.totalTickets ?? rawProc.TotalTickets ?? 0,
      });
    } catch (err) {
      console.error('Failed to load ticket type distribution:', err);
    } finally {
      setLoadingTypeDist(false);
    }
  }, [startDate, endDate]);

  useEffect(() => {
    void fetchTypeDistribution();
  }, [fetchTypeDistribution]);

  const activityTypeParam =
    ticketFilter === 'maintenance'
      ? '1'
      : ticketFilter === 'procurement'
      ? '2'
      : '';

  // Ticket Statistics Cards
  const ticketStatistics = useMemo(() => {
    return [
      {
        id: 'total' as StatCategory,
        title: 'Total Tickets',
        value: ticketStats.totalTickets,
        description: 'All tickets submitted by you',
        icon: Ticket,
        style: 'bg-blue-100 text-blue-600',
      },
      {
        id: 'pending' as StatCategory,
        title: isApprover ? 'Pending Approval' : 'Need Revision',
        value: ticketStats.pendingTickets,
        description: isApprover
          ? 'Waiting for your approval'
          : 'Tickets returned for your revision',
        icon: isApprover ? Clock : RotateCcw,
        style: 'bg-amber-100 text-amber-600',
      },
      {
        id: 'in_progress' as StatCategory,
        title: 'In Progress',
        value: ticketStats.inProgressTickets,
        description: 'Tickets currently being processed',
        icon: Activity,
        style: 'bg-violet-100 text-violet-600',
      },
      {
        id: 'completed' as StatCategory,
        title: 'Completed',
        value: ticketStats.completedTickets,
        description: 'Resolved and completed tickets',
        icon: CheckCircle2,
        style: 'bg-emerald-100 text-emerald-600',
      },
    ];
  }, [ticketStats, isApprover]);

  const currentDate = new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  }).format(new Date());

  // Resolution & SLA Performance Metrics (Pilihan B)
  const totalTicketCount = ticketStats.totalTickets;
  const completedTicketCount = ticketStats.completedTickets;
  const inProgressTicketCount = ticketStats.inProgressTickets;
  const pendingTicketCount = ticketStats.pendingTickets;

  const resolutionRate =
    totalTicketCount > 0
      ? Math.round((completedTicketCount / totalTicketCount) * 100)
      : 0;

  const inProgressRate =
    totalTicketCount > 0
      ? Math.round((inProgressTicketCount / totalTicketCount) * 100)
      : 0;

  const pendingRate =
    totalTicketCount > 0
      ? Math.round((pendingTicketCount / totalTicketCount) * 100)
      : 0;

  const healthStatus = useMemo(() => {
    if (totalTicketCount === 0) {
      return {
        label: 'No Tickets',
        badge: 'bg-slate-100 text-slate-600 border-slate-200',
        description: 'No ticket volume recorded in this timeframe.',
      };
    }
    if (resolutionRate >= 70) {
      return {
        label: 'Optimal',
        badge: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        description: 'High completion efficiency across your scope.',
      };
    }
    if (resolutionRate >= 40) {
      return {
        label: 'On Track',
        badge: 'bg-blue-50 text-blue-700 border-blue-200',
        description: 'Steady progress; active tickets being handled.',
      };
    }
    return {
      label: 'Needs Attention',
      badge: 'bg-amber-50 text-amber-700 border-amber-200',
      description: 'Multiple active tickets are awaiting completion.',
    };
  }, [totalTicketCount, resolutionRate]);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-blue-100 border-t-blue-600" />
          <p className="mt-4 text-sm text-slate-500">
            Loading dashboard...
          </p>
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="max-w-md rounded-2xl border border-red-100 bg-white p-8 text-center shadow-sm">
          <AlertCircle className="mx-auto text-red-500" size={36} />

          <h2 className="mt-4 text-lg font-bold text-slate-800">
            Unable to Load Dashboard
          </h2>

          <p className="mt-2 text-sm text-slate-500">
            {error || 'Dashboard profile data is unavailable.'}
          </p>

          <button
            type="button"
            onClick={() => window.location.reload()}
            className="mt-6 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Page Heading & Global Dashboard Filter */}
      <section className="space-y-4">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <p className="text-sm font-medium text-blue-600">
              Overview
            </p>

            <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-800 sm:text-3xl">
              Ticket Dashboard
            </h1>

            <p className="mt-2 text-sm text-slate-500">
              Welcome back, {profile.fullName}! Here's your ticket activity overview.
            </p>
          </div>

          <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-600 shadow-sm">
            <CalendarDays size={17} className="text-slate-400" />
            {currentDate}
          </div>
        </div>

        {/* Global Dashboard Filter Bar: Underline Tabs (Left) & Controls (Right) */}
        <div className="flex flex-col gap-3 border-b border-slate-200 sm:flex-row sm:items-center sm:justify-between">
          {/* Underline Tabs */}
          <nav className="-mb-px flex items-center gap-6">
            <button
              type="button"
              onClick={() => setTicketFilter('all')}
              className={`relative pb-3 text-sm font-semibold transition-colors ${
                ticketFilter === 'all'
                  ? 'text-blue-600'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              All Tickets
              {ticketFilter === 'all' && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full bg-blue-600" />
              )}
            </button>

            <button
              type="button"
              onClick={() => setTicketFilter('maintenance')}
              className={`relative pb-3 text-sm font-semibold transition-colors ${
                ticketFilter === 'maintenance'
                  ? 'text-blue-600'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              Maintenance
              {ticketFilter === 'maintenance' && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full bg-blue-600" />
              )}
            </button>

            <button
              type="button"
              onClick={() => setTicketFilter('procurement')}
              className={`relative pb-3 text-sm font-semibold transition-colors ${
                ticketFilter === 'procurement'
                  ? 'text-blue-600'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              Procurement
              {ticketFilter === 'procurement' && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full bg-blue-600" />
              )}
            </button>
          </nav>

          {/* Right Controls: Date Filter & Refresh */}
          <div className="flex items-center gap-2 pb-2 sm:ml-auto">
            {/* Date filter button */}
            <button
              type="button"
              onClick={() => setShowDateFilter(!showDateFilter)}
              className={`flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-medium transition ${
                showDateFilter || startDate || endDate
                  ? 'border-blue-200 bg-blue-50 text-blue-600'
                  : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
              }`}
              title="Filter by date"
            >
              <Filter size={14} />
              <span>
                {startDate || endDate
                  ? `${startDate || '...'} s/d ${endDate || '...'}`
                  : 'Date Filter'}
              </span>
              {(startDate || endDate) && (
                <span className="h-1.5 w-1.5 rounded-full bg-blue-600" />
              )}
            </button>

            {(startDate || endDate) && (
              <button
                type="button"
                onClick={() => {
                  setStartDate('');
                  setEndDate('');
                }}
                className="rounded-lg px-2.5 py-1 text-xs font-medium text-red-500 transition hover:bg-red-50"
              >
                Clear
              </button>
            )}

            {/* Refresh button */}
            <button
              type="button"
              onClick={() => {
                void refetchStats();
                void fetchTypeDistribution();
                window.dispatchEvent(
                  new CustomEvent('refresh-dashboard-activity')
                );
              }}
              disabled={isLoadingStats}
              aria-label="Refresh dashboard data"
              className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
              title="Refresh all dashboard data"
            >
              <RefreshCw
                size={14}
                className={isLoadingStats ? 'animate-spin text-blue-600' : ''}
              />
              <span className="hidden sm:inline">Refresh</span>
            </button>
          </div>
        </div>

        {/* Collapsible Date Filter Inputs */}
        {showDateFilter && (
          <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm animate-in fade-in duration-150">
            <div className="flex items-center gap-2">
              <label htmlFor="startDate" className="text-xs font-medium text-slate-500">
                Start:
              </label>
              <input
                id="startDate"
                type="date"
                value={startDate}
                max={endDate || undefined}
                onChange={(e) => setStartDate(e.target.value)}
                className="rounded-lg border border-slate-200 px-2.5 py-1 text-xs text-slate-700 focus:border-blue-500 focus:outline-none"
              />
            </div>
            <div className="flex items-center gap-2">
              <label htmlFor="endDate" className="text-xs font-medium text-slate-500">
                End:
              </label>
              <input
                id="endDate"
                type="date"
                value={endDate}
                min={startDate || undefined}
                onChange={(e) => setEndDate(e.target.value)}
                className="rounded-lg border border-slate-200 px-2.5 py-1 text-xs text-slate-700 focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>
        )}
      </section>

      {/* Ticket Statistics */}
      <section>
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-800">
              Ticket Statistics
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Overview of tickets in your scope
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

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {ticketStatistics.map((item) => {
            const Icon = item.icon;
            const isSelected = activeCategory === item.id;

            return (
              <div
                key={item.id}
                onClick={() => handleToggleCard(item.id)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    handleToggleCard(item.id);
                  }
                }}
                className={`group cursor-pointer rounded-2xl border bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-md ${
                  isSelected
                    ? 'border-blue-500 ring-2 ring-blue-500/20 bg-blue-50/10'
                    : 'border-slate-200 hover:border-slate-300'
                } ${isLoadingStats ? 'opacity-70' : ''}`}
              >
                <div className="flex items-start justify-between">
                  <div
                    className={`flex h-12 w-12 items-center justify-center rounded-xl transition ${
                      isSelected ? 'scale-105' : ''
                    } ${item.style}`}
                  >
                    <Icon size={23} />
                  </div>

                  <div className="flex items-center gap-1">
                    {isSelected ? (
                      <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-100 text-blue-600">
                        <ChevronUp size={16} />
                      </span>
                    ) : (
                      <span className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 group-hover:bg-slate-100 group-hover:text-slate-600 transition">
                        <ChevronDown size={16} />
                      </span>
                    )}
                  </div>
                </div>

                <p className="mt-5 text-sm font-medium text-slate-500 group-hover:text-slate-700 transition">
                  {item.title}
                </p>

                <h3 className="mt-2 text-3xl font-bold text-slate-800">
                  {item.value.toLocaleString('en-US')}
                </h3>

                <div className="mt-2 flex items-center justify-between">
                  <p className="text-xs text-slate-400">
                    {item.description}
                  </p>
                  <span
                    className={`text-[11px] font-semibold transition ${
                      isSelected
                        ? 'text-blue-600'
                        : 'text-slate-400 group-hover:text-blue-600'
                    }`}
                  >
                    {isSelected ? 'Tutup ▲' : 'Top 5 ▼'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* TOP 5 ACCORDION DRAWER */}
        {activeCategory && (
          <div className="mt-5 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all animate-in fade-in slide-in-from-top-2 duration-200">
            {/* Drawer Header */}
            <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/80 px-6 py-4">
              <div className="flex items-center gap-3">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100 text-xs font-bold text-blue-700">
                  TOP 5
                </span>
                <div>
                  <h3 className="text-sm font-bold text-slate-800">
                    {activeCategory === 'pending'
                      ? isApprover
                        ? 'Top 5 Tiket — Menunggu Approval Anda'
                        : 'Top 5 Tiket — Perlu Revisi / Resubmit'
                      : activeCategory === 'in_progress'
                      ? 'Top 5 Tiket — Sedang Diproses (In Progress)'
                      : activeCategory === 'completed'
                      ? 'Top 5 Tiket — Telah Selesai (Completed)'
                      : 'Top 5 Tiket — Seluruh Tiket Diajukan'}
                  </h3>
                  <p className="text-xs text-slate-500">
                    Dikelompokkan berdasarkan tipe tiket. Klik Detail untuk membuka tiket di halaman terkait.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setActiveCategory(null)}
                aria-label="Tutup daftar tiket"
                className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-200 hover:text-slate-600"
              >
                <X size={18} />
              </button>
            </div>

            {/* Drawer Body */}
            <div className="p-6">
              {loadingTopTickets ? (
                <div className="flex items-center justify-center gap-2 py-8 text-sm text-slate-500">
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
                  Memuat daftar tiket top 5...
                </div>
              ) : topTicketsError ? (
                <div className="py-6 text-center text-sm text-red-500">
                  {topTicketsError}
                </div>
              ) : topTickets.length === 0 ? (
                <div className="py-8 text-center">
                  <Ticket size={32} className="mx-auto mb-2 text-slate-300" />
                  <p className="text-sm font-medium text-slate-600">
                    Tidak ada tiket pada kategori ini
                  </p>
                  <p className="mt-1 text-xs text-slate-400">
                    Saat ini belum ada tiket dalam antrean ini.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                  {/* Procurement Group */}
                  <div className="rounded-xl border border-slate-100 bg-slate-50/60 p-4">
                    <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                      <div className="flex items-center gap-2">
                        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700">
                          <Package size={15} />
                        </div>
                        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                          Procurement ({procurementList.length})
                        </h4>
                      </div>
                    </div>

                    <div className="mt-3 space-y-2.5">
                      {procurementList.length > 0 ? (
                        procurementList.map((ticket) => (
                          <div
                            key={ticket.id}
                            className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white p-3 shadow-xs transition hover:border-blue-300"
                          >
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2">
                                <span className="font-mono text-xs font-bold text-blue-600">
                                  {ticket.ticketNumber}
                                </span>
                                {ticket.currentStepName && (
                                  <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-600">
                                    {ticket.currentStepName}
                                  </span>
                                )}
                              </div>
                              <p
                                className="mt-1 truncate text-xs font-medium text-slate-700"
                                title={ticket.subject}
                              >
                                {ticket.subject}
                              </p>
                            </div>

                            <button
                              type="button"
                              onClick={() => handleNavigateToTicket(ticket)}
                              className="inline-flex shrink-0 items-center gap-1 rounded-lg bg-blue-50 px-2.5 py-1.5 text-xs font-semibold text-blue-600 transition hover:bg-blue-600 hover:text-white"
                            >
                              <span>Detail</span>
                              <ArrowRight size={13} />
                            </button>
                          </div>
                        ))
                      ) : (
                        <p className="py-4 text-center text-xs text-slate-400">
                          Tidak ada tiket procurement pada kategori ini.
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Maintenance Group */}
                  <div className="rounded-xl border border-slate-100 bg-slate-50/60 p-4">
                    <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                      <div className="flex items-center gap-2">
                        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-100 text-amber-700">
                          <Wrench size={15} />
                        </div>
                        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                          Maintenance ({maintenanceList.length})
                        </h4>
                      </div>
                    </div>

                    <div className="mt-3 space-y-2.5">
                      {maintenanceList.length > 0 ? (
                        maintenanceList.map((ticket) => (
                          <div
                            key={ticket.id}
                            className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white p-3 shadow-xs transition hover:border-amber-300"
                          >
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2">
                                <span className="font-mono text-xs font-bold text-amber-600">
                                  {ticket.ticketNumber}
                                </span>
                                {ticket.currentStepName && (
                                  <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-600">
                                    {ticket.currentStepName}
                                  </span>
                                )}
                              </div>
                              <p
                                className="mt-1 truncate text-xs font-medium text-slate-700"
                                title={ticket.subject}
                              >
                                {ticket.subject}
                              </p>
                            </div>

                            <button
                              type="button"
                              onClick={() => handleNavigateToTicket(ticket)}
                              className="inline-flex shrink-0 items-center gap-1 rounded-lg bg-amber-50 px-2.5 py-1.5 text-xs font-semibold text-amber-700 transition hover:bg-amber-600 hover:text-white"
                            >
                              <span>Detail</span>
                              <ArrowRight size={13} />
                            </button>
                          </div>
                        ))
                      ) : (
                        <p className="py-4 text-center text-xs text-slate-400">
                          Tidak ada tiket maintenance pada kategori ini.
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </section>

      {/* Workload by Ticket Type & Approval Summary */}
      <section className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <TicketTypeDistributionChart
            procurementCount={typeDistribution.procurement}
            maintenanceCount={typeDistribution.maintenance}
            isLoading={loadingTypeDist}
          />
        </div>

        {/* Resolution & SLA Performance (Pilihan B) */}
        <div className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div>
            {/* Card Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                  <CheckCircle2 size={22} />
                </div>

                <div>
                  <h2 className="font-bold text-slate-800">
                    Resolution Performance
                  </h2>

                  <p className="text-xs text-slate-500">
                    {isApprover
                      ? 'Team & subordinates workflow health'
                      : 'Your ticket resolution efficiency'}
                  </p>
                </div>
              </div>

              <span
                className={`rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${healthStatus.badge}`}
              >
                {healthStatus.label}
              </span>
            </div>

            {/* Circular Progress Ring & High-level Metric */}
            <div className="mt-5 flex items-center gap-5 rounded-2xl bg-gradient-to-br from-slate-50 to-slate-100/60 p-4 border border-slate-100">
              {/* Circular Gauge Ring */}
              <div className="relative flex h-20 w-20 shrink-0 items-center justify-center">
                <svg className="h-full w-full -rotate-90" viewBox="0 0 36 36">
                  {/* Background Track */}
                  <path
                    className="text-slate-200"
                    strokeWidth="3.5"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  {/* Progress Circle */}
                  <path
                    className="text-emerald-500 transition-all duration-700 ease-out"
                    strokeDasharray={`${resolutionRate}, 100`}
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                </svg>
                <div className="absolute flex flex-col items-center justify-center">
                  <span className="font-mono text-base font-bold text-slate-800">
                    {resolutionRate}%
                  </span>
                  <span className="text-[9px] font-semibold text-slate-400 uppercase">
                    Solved
                  </span>
                </div>
              </div>

              {/* Summary details */}
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Resolution Rate
                </p>
                <p className="mt-1 text-sm font-bold text-slate-800">
                  {completedTicketCount.toLocaleString('en-US')}{' '}
                  <span className="text-xs font-normal text-slate-500">
                    of {totalTicketCount.toLocaleString('en-US')} tickets completed
                  </span>
                </p>
                <p className="mt-1 text-xs text-slate-500 leading-snug">
                  {healthStatus.description}
                </p>
              </div>
            </div>

            {/* Detailed Progress Breakdown */}
            <div className="mt-5 space-y-3.5">
              {/* Completed Bar */}
              <div>
                <div className="flex items-center justify-between text-xs font-medium">
                  <span className="flex items-center gap-1.5 text-slate-700">
                    <span className="h-2 w-2 rounded-full bg-emerald-500" />
                    Completed
                  </span>
                  <span className="font-bold text-slate-800">
                    {completedTicketCount.toLocaleString('en-US')}{' '}
                    <span className="text-slate-400 font-normal">
                      ({resolutionRate}%)
                    </span>
                  </span>
                </div>
                <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-emerald-500 transition-all duration-500"
                    style={{ width: `${resolutionRate}%` }}
                  />
                </div>
              </div>

              {/* In Progress Bar */}
              <div>
                <div className="flex items-center justify-between text-xs font-medium">
                  <span className="flex items-center gap-1.5 text-slate-700">
                    <span className="h-2 w-2 rounded-full bg-violet-500" />
                    In Progress
                  </span>
                  <span className="font-bold text-slate-800">
                    {inProgressTicketCount.toLocaleString('en-US')}{' '}
                    <span className="text-slate-400 font-normal">
                      ({inProgressRate}%)
                    </span>
                  </span>
                </div>
                <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-violet-500 transition-all duration-500"
                    style={{ width: `${inProgressRate}%` }}
                  />
                </div>
              </div>

              {/* Pending Action Bar */}
              <div>
                <div className="flex items-center justify-between text-xs font-medium">
                  <span className="flex items-center gap-1.5 text-slate-700">
                    <span className="h-2 w-2 rounded-full bg-amber-500" />
                    {isApprover ? 'Pending Approval' : 'Need Revision'}
                  </span>
                  <span className="font-bold text-slate-800">
                    {pendingTicketCount.toLocaleString('en-US')}{' '}
                    <span className="text-slate-400 font-normal">
                      ({pendingRate}%)
                    </span>
                  </span>
                </div>
                <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-amber-500 transition-all duration-500"
                    style={{ width: `${pendingRate}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Scope Footer Notice */}
          <div className="mt-5 border-t border-slate-100 pt-3 text-[11px] text-slate-400">
            {isApprover ? (
              <span className="flex items-center gap-1.5">
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-blue-500" />
                Aggregated scope: You and all reporting subordinates
              </span>
            ) : (
              <span className="flex items-center gap-1.5">
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-slate-400" />
                Personal scope: Based on your submitted requests
              </span>
            )}
          </div>
        </div>
      </section>

      {/* Ticket Activity & Monthly Trend (Lazy Loaded) */}
      <TicketActivityTrendChart />

      {/* My Activity */}
      <MyActivityTable
        type={activityTypeParam}
        fromDate={startDate}
        toDate={endDate}
      />

      {/* Asset Distribution & Utilization Overview (Grafik 1) */}
      <AssetDistributionChart />
    </div>
  );
}

export default DashboardPage;

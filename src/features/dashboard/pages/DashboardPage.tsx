
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Ticket,
  Clock,
  CheckCircle2,
  CalendarDays,
  AlertCircle,
  UserRound,
  Building2,
  ShieldCheck,
  Activity,
  Hourglass,
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
import type { DashboardResponse } from '../types/dashboard.types';
import MyActivityTable from '../components/MyActivityTable';

const API_URL =
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:5243';

function getAccessToken() {
  return (
    localStorage.getItem('accessToken') ||
    sessionStorage.getItem('accessToken')
  );
}

// Role priority: semakin tinggi nilainya, semakin tinggi prioritasnya.
const rolePriority: Record<string, number> = {
  'ROL-03': 3,
  'ROL-02': 2,
  'ROL-01': 1,
};

// Mapping kode role ke nama role.
const roleNames: Record<string, string> = {
  'ROL-01': 'Employee',
  'ROL-02': 'Department Manager',
  'ROL-03': 'Division Manager',
  'ROL-04': 'Finance',
  'ROL-05': 'Purchasing',
  'ROL-06': 'Inventory',
  'ROL-07': 'Department IT Support',
  'ROL-08': 'Maintenance Handler',
};

// Mengambil role dengan prioritas tertinggi.
function getPrimaryRole(roles: string[]) {
  if (!roles || roles.length === 0) {
    return 'Employee';
  }

  const sortedRoles = [...roles].sort((a, b) => {
    const priorityA = rolePriority[a.toUpperCase()] ?? 0;
    const priorityB = rolePriority[b.toUpperCase()] ?? 0;

    return priorityB - priorityA;
  });

  const primaryRole = sortedRoles[0].toUpperCase();

  return roleNames[primaryRole] || sortedRoles[0];
}

// Menentukan warna badge berdasarkan status asset.
function getAssetStatusStyle(status: string) {
  switch (status.toLowerCase()) {
    case 'available':
      return 'bg-emerald-100 text-emerald-700';

    case 'in use':
      return 'bg-blue-100 text-blue-700';

    case 'under maintenance':
      return 'bg-amber-100 text-amber-700';

    case 'disposed':
      return 'bg-red-100 text-red-700';

    case 'archived':
      return 'bg-slate-200 text-slate-700';

    default:
      return 'bg-slate-100 text-slate-600';
  }
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
  const [dashboard, setDashboard] =
    useState<DashboardResponse | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const controller = new AbortController();

    async function fetchDashboard() {
      try {
        setLoading(true);
        setError('');

        const token = getAccessToken();

        if (!token) {
          throw new Error(
            'Session login tidak ditemukan. Silakan login kembali.',
          );
        }

        const response = await fetch(
          `${API_URL}/api/dashboard/summary`,
          {
            method: 'GET',
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
            signal: controller.signal,
          },
        );

        if (response.status === 401) {
          throw new Error(
            'Sesi login telah berakhir. Silakan login kembali.',
          );
        }

        if (!response.ok) {
          throw new Error(
            'Gagal mengambil data dashboard dari server.',
          );
        }

        const result: DashboardResponse = await response.json();

        setDashboard(result);
      } catch (err) {
        if (err instanceof Error && err.name === 'AbortError') {
          return;
        }

        setError(
          err instanceof Error
            ? err.message
            : 'Terjadi kesalahan saat mengambil data dashboard.',
        );
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    fetchDashboard();

    return () => controller.abort();
  }, []);

  // Evaluasi apakah user memiliki wewenang approval (Manager, Finance, Purchasing, Inventory, IT Support, dll)
  const userRoles = useMemo(() => dashboard?.profile?.roles ?? [], [dashboard?.profile?.roles]);
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

  const activityTypeParam =
    ticketFilter === 'maintenance'
      ? '1'
      : ticketFilter === 'procurement'
      ? '2'
      : '';

  // Ticket Statistics
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

  const totalTickets = ticketStats.totalTickets;
  const pendingPct =
    totalTickets > 0 ? Math.round((ticketStats.pendingTickets / totalTickets) * 100) : 0;
  const inProgressPct =
    totalTickets > 0 ? Math.round((ticketStats.inProgressTickets / totalTickets) * 100) : 0;
  const completedPct =
    totalTickets > 0 ? Math.round((ticketStats.completedTickets / totalTickets) * 100) : 0;

  const ticketStatus = [
    {
      label: 'Pending Action',
      value: ticketStats.pendingTickets,
      percentage: pendingPct,
      color: 'bg-amber-500',
      textColor: 'text-amber-600',
      icon: Clock,
    },
    {
      label: 'In Progress',
      value: ticketStats.inProgressTickets,
      percentage: inProgressPct,
      color: 'bg-violet-500',
      textColor: 'text-violet-600',
      icon: Activity,
    },
    {
      label: 'Completed',
      value: ticketStats.completedTickets,
      percentage: completedPct,
      color: 'bg-emerald-500',
      textColor: 'text-emerald-600',
      icon: CheckCircle2,
    },
  ];

  const currentDate = new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  }).format(new Date());

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

  if (error || !dashboard) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="max-w-md rounded-2xl border border-red-100 bg-white p-8 text-center shadow-sm">
          <AlertCircle className="mx-auto text-red-500" size={36} />

          <h2 className="mt-4 text-lg font-bold text-slate-800">
            Unable to Load Dashboard
          </h2>

          <p className="mt-2 text-sm text-slate-500">
            {error || 'Dashboard data is unavailable.'}
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
              Welcome back, {dashboard.profile.fullName}!
              Here's your ticket activity overview.
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

      {/* User Profile */}
      <section className="flex flex-col gap-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm lg:flex-row lg:items-center">

        {/* Employee Information */}
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-blue-100 text-blue-600">
          <UserRound size={28} />
        </div>

        <div className="min-w-0 flex-1">
          <h2 className="font-bold text-slate-800">
            {dashboard.profile.fullName}
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            {dashboard.profile.employeeNumber} · {dashboard.profile.email}
          </p>

          {/* User Roles */}
          <div className="mt-3 flex flex-wrap gap-2">
            {dashboard.profile.roles.map((role) => (
              <span
                key={role}
                className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700"
              >
                {role}
              </span>
            ))}
          </div>
        </div>

        {/* Department and Primary Role */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:w-[420px] lg:shrink-0">

          {/* Department */}
          <div className="rounded-xl bg-blue-50 px-4 py-3">
            <div className="flex items-center gap-2">
              <Building2 size={17} className="text-blue-600" />

              <p className="text-xs font-medium text-blue-600">
                Department
              </p>
            </div>

            <p className="mt-2 text-sm font-bold text-blue-800">
              {dashboard.profile.departmentName || 'Department not assigned'}
            </p>
          </div>

          {/* Primary Role */}
          <div className="rounded-xl bg-blue-50 px-4 py-3">
            <div className="flex items-center gap-2">
              <ShieldCheck size={17} className="text-blue-600" />

              <p className="text-xs font-medium text-blue-600">
                Primary Role
              </p>
            </div>

            <p className="mt-2 text-sm font-bold text-blue-800">
              {getPrimaryRole(dashboard.profile.roles)}
            </p>
          </div>

        </div>
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

      {/* Ticket Status Overview */}
      <section className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm xl:col-span-2">
          <h2 className="text-lg font-bold text-slate-800">
            Ticket Status Overview
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Distribution of tickets by current status
          </p>

          <div className="mt-8 flex flex-col items-center gap-8 sm:flex-row">
            <div
              className="relative flex h-48 w-48 shrink-0 items-center justify-center rounded-full transition-all duration-500"
              style={{
                background:
                  totalTickets > 0
                    ? `conic-gradient(#f59e0b 0% ${pendingPct}%, #8b5cf6 ${pendingPct}% ${pendingPct + inProgressPct}%, #10b981 ${pendingPct + inProgressPct}% 100%)`
                    : '#f1f5f9',
              }}
            >
              <div className="flex h-32 w-32 flex-col items-center justify-center rounded-full bg-white shadow-inner">
                <span className="text-3xl font-bold text-slate-800">
                  {totalTickets.toLocaleString('en-US')}
                </span>

                <span className="text-xs text-slate-400">
                  Total Tickets
                </span>
              </div>
            </div>

            <div className="w-full space-y-5">
              {ticketStatus.map((item) => {
                const Icon = item.icon;

                return (
                  <div key={item.label}>
                    <div className="mb-2 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Icon
                          size={16}
                          className={item.textColor}
                        />

                        <span className="text-sm text-slate-600">
                          {item.label}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-xs text-slate-400">
                          ({item.percentage}%)
                        </span>
                        <span className="text-sm font-semibold text-slate-800">
                          {item.value}
                        </span>
                      </div>
                    </div>

                    <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${item.color}`}
                        style={{ width: `${item.percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Approval Summary */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-100 text-amber-600">
              <Hourglass size={22} />
            </div>

            <div>
              <h2 className="font-bold text-slate-800">
                Action & Approval Summary
              </h2>

              <p className="text-xs text-slate-500">
                Ticket workflow progress
              </p>
            </div>
          </div>

          <div className="mt-7 rounded-xl bg-amber-50 p-5">
            <p className="text-sm font-medium text-amber-700">
              {isApprover ? 'Waiting for Your Approval' : 'Tickets Needing Revision'}
            </p>

            <p className="mt-2 text-3xl font-bold text-amber-800">
              {ticketStats.pendingTickets.toLocaleString('en-US')}
            </p>

            <p className="mt-2 text-xs leading-relaxed text-amber-700">
              {isApprover
                ? 'Tickets waiting for your review and approval will appear here.'
                : 'Tickets returned by manager that need your revision will appear here.'}
            </p>
          </div>

          <div className="mt-4 rounded-xl bg-emerald-50 p-5">
            <p className="text-sm font-medium text-emerald-700">
              Completed Tickets
            </p>

            <p className="mt-2 text-3xl font-bold text-emerald-800">
              {ticketStats.completedTickets.toLocaleString('en-US')}
            </p>

            <p className="mt-2 text-xs text-emerald-700">
              Tickets that have been resolved and closed.
            </p>
          </div>
        </div>
      </section>

      {/* My Activity */}
      <MyActivityTable
        type={activityTypeParam}
        fromDate={startDate}
        toDate={endDate}
      />

      {/* Assets Statistics */}
      <section>
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-800">
              Assets Statistics
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Overview of company assets
            </p>
          </div>

          <Package size={22} className="text-blue-600" />
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {[
            {
              title: 'Total Assets',
              value: dashboard.statistics.totalAssets,
              icon: Package,
              style: 'bg-blue-100 text-blue-600',
            },
            {
              title: 'Available Assets',
              value: dashboard.statistics.available,
              icon: CheckCircle2,
              style: 'bg-emerald-100 text-emerald-600',
            },
            {
              title: 'Assets In Use',
              value: dashboard.statistics.inUse,
              icon: UserRound,
              style: 'bg-violet-100 text-violet-600',
            },
            {
              title: 'Under Maintenance',
              value: dashboard.statistics.underMaintenance,
              icon: AlertCircle,
              style: 'bg-amber-100 text-amber-600',
            },
          ].map((item) => {
            const Icon = item.icon;

            return (
              <div
                key={item.title}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
              >
                <div
                  className={`flex h-12 w-12 items-center justify-center rounded-xl ${item.style}`}
                >
                  <Icon size={23} />
                </div>

                <p className="mt-5 text-sm font-medium text-slate-500">
                  {item.title}
                </p>

                <h3 className="mt-2 text-3xl font-bold text-slate-800">
                  {item.value.toLocaleString('en-US')}
                </h3>
              </div>
            );
          })}
        </div>
      </section>

      {/* Recent Assets */}
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-100 p-6">
          <div>
            <h2 className="text-lg font-bold text-slate-800">
              Recent Assets
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Latest registered company assets
            </p>
          </div>

          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
            <Package size={22} />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[650px] text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-400">
              <tr>
                <th className="px-6 py-4 font-semibold">
                  Asset Tag
                </th>

                <th className="px-6 py-4 font-semibold">
                  Asset Name
                </th>

                <th className="px-6 py-4 font-semibold">
                  Assigned To
                </th>

                <th className="px-6 py-4 font-semibold">
                  Status
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {dashboard.recentAssets?.length > 0 ? (
                dashboard.recentAssets.map((asset) => (
                  <tr
                    key={asset.id}
                    className="transition hover:bg-slate-50"
                  >
                    <td className="px-6 py-4 font-semibold text-blue-600">
                      {asset.assetTag}
                    </td>

                    <td className="px-6 py-4 font-medium text-slate-700">
                      {asset.itemName}
                    </td>

                    <td className="px-6 py-4 text-slate-500">
                      {asset.employeeName || 'Unassigned'}
                    </td>

                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex rounded-full px-3 py-1.5 text-xs font-semibold ${getAssetStatusStyle(asset.status)}`}
                      >
                        {asset.status}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={4}
                    className="px-6 py-12 text-center"
                  >
                    <Package
                      size={36}
                      className="mx-auto mb-3 text-slate-300"
                    />

                    <p className="font-semibold text-slate-600">
                      No assets available
                    </p>

                    <p className="mt-1 text-sm text-slate-400">
                      Registered assets will appear here.
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Recent Tickets */}
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-100 p-6">
          <div>
            <h2 className="text-lg font-bold text-slate-800">
              Recent Tickets
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Latest submitted tickets in the system
            </p>
          </div>

          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
            <Ticket size={22} />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[650px] text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-400">
              <tr>
                <th className="px-6 py-4 font-semibold">Ticket #</th>
                <th className="px-6 py-4 font-semibold">Subject</th>
                <th className="px-6 py-4 font-semibold">Type</th>
                <th className="px-6 py-4 font-semibold">Created At</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {dashboard.recentTickets?.length > 0 ? (
                dashboard.recentTickets.map((ticket) => (
                  <tr key={ticket.id} className="transition hover:bg-slate-50">
                    <td className="px-6 py-4 font-semibold text-blue-600 font-mono text-xs">
                      {ticket.ticketNumber}
                    </td>

                    <td className="px-6 py-4 font-medium text-slate-700">
                      {ticket.subject}
                    </td>

                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
                          ticket.ticketType?.toLowerCase().includes('procurement')
                            ? 'bg-purple-100 text-purple-700'
                            : 'bg-blue-100 text-blue-700'
                        }`}
                      >
                        {ticket.ticketType}
                      </span>
                    </td>

                    <td className="px-6 py-4 text-slate-500 text-xs">
                      {new Intl.DateTimeFormat('en-GB', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      }).format(new Date(ticket.createdAt))}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center">
                    <Ticket size={36} className="mx-auto mb-3 text-slate-300" />
                    <p className="font-semibold text-slate-600">
                      No recent tickets
                    </p>
                    <p className="mt-1 text-sm text-slate-400">
                      Tickets submitted will appear here.
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

    </div>
  );
}

export default DashboardPage;

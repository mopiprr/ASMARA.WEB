
import { useEffect, useMemo, useState } from 'react';
import {
  Ticket,
  Clock,
  CheckCircle2,
  CalendarDays,
  AlertCircle,
  UserRound,
  Building2,
  ShieldCheck,
  MoreHorizontal,
  Activity,
  Hourglass,
  Package,
  RefreshCw,
  Filter,
} from 'lucide-react';
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

function DashboardPage() {
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

  // Ticket Statistics
  const ticketStatistics = useMemo(() => {
    const filterLabel =
      ticketFilter === 'maintenance'
        ? 'Maintenance'
        : ticketFilter === 'procurement'
        ? 'Procurement'
        : 'All';

    return [
      {
        title: 'Total Tickets',
        value: ticketStats.totalTickets,
        description: `Total ${filterLabel.toLowerCase()} tickets in your scope`,
        icon: Ticket,
        style: 'bg-blue-100 text-blue-600',
      },
      {
        title: 'Pending Action',
        value: ticketStats.pendingTickets,
        description: 'Waiting for your action / approval',
        icon: Clock,
        style: 'bg-amber-100 text-amber-600',
      },
      {
        title: 'In Progress',
        value: ticketStats.inProgressTickets,
        description: 'Tickets currently being processed',
        icon: Activity,
        style: 'bg-violet-100 text-violet-600',
      },
      {
        title: 'Completed',
        value: ticketStats.completedTickets,
        description: 'Resolved and completed tickets',
        icon: CheckCircle2,
        style: 'bg-emerald-100 text-emerald-600',
      },
    ];
  }, [ticketStats, ticketFilter]);

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

      {/* Page Heading */}
      <section className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
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
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-800">
              Ticket Statistics
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Overview of tickets in your scope
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Type Filter Buttons */}
            <div className="flex items-center rounded-xl bg-slate-100 p-1">
              <button
                type="button"
                onClick={() => setTicketFilter('all')}
                className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                  ticketFilter === 'all'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                All
              </button>
              <button
                type="button"
                onClick={() => setTicketFilter('maintenance')}
                className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                  ticketFilter === 'maintenance'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Maintenance
              </button>
              <button
                type="button"
                onClick={() => setTicketFilter('procurement')}
                className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                  ticketFilter === 'procurement'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Procurement
              </button>
            </div>

            {/* Date filter toggle */}
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
              <span>Date Filter</span>
              {(startDate || endDate) && (
                <span className="h-1.5 w-1.5 rounded-full bg-blue-600" />
              )}
            </button>

            {/* Refetch button */}
            <button
              type="button"
              onClick={() => void refetchStats()}
              disabled={isLoadingStats}
              aria-label="Refresh ticket statistics"
              className="flex h-8 w-8 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
              title="Refresh statistics"
            >
              <RefreshCw
                size={14}
                className={isLoadingStats ? 'animate-spin text-blue-600' : ''}
              />
            </button>
          </div>
        </div>

        {/* Collapsible Date Filter Inputs */}
        {showDateFilter && (
          <div className="mb-4 flex flex-wrap items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-center gap-2">
              <label htmlFor="startDate" className="text-xs font-medium text-slate-500">
                Start:
              </label>
              <input
                id="startDate"
                type="date"
                value={startDate}
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
                onChange={(e) => setEndDate(e.target.value)}
                className="rounded-lg border border-slate-200 px-2.5 py-1 text-xs text-slate-700 focus:border-blue-500 focus:outline-none"
              />
            </div>
            {(startDate || endDate) && (
              <button
                type="button"
                onClick={() => {
                  setStartDate('');
                  setEndDate('');
                }}
                className="text-xs font-medium text-red-500 hover:text-red-700"
              >
                Clear Dates
              </button>
            )}
          </div>
        )}

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

            return (
              <div
                key={item.title}
                className={`rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md ${
                  isLoadingStats ? 'opacity-70' : ''
                }`}
              >
                <div className="flex items-start justify-between">
                  <div
                    className={`flex h-12 w-12 items-center justify-center rounded-xl ${item.style}`}
                  >
                    <Icon size={23} />
                  </div>

                  <MoreHorizontal
                    size={20}
                    className="text-slate-400"
                  />
                </div>

                <p className="mt-5 text-sm font-medium text-slate-500">
                  {item.title}
                </p>

                <h3 className="mt-2 text-3xl font-bold text-slate-800">
                  {item.value.toLocaleString('en-US')}
                </h3>

                <p className="mt-2 text-xs text-slate-400">
                  {item.description}
                </p>
              </div>
            );
          })}
        </div>
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
              Pending Action / Approval
            </p>

            <p className="mt-2 text-3xl font-bold text-amber-800">
              {ticketStats.pendingTickets.toLocaleString('en-US')}
            </p>

            <p className="mt-2 text-xs leading-relaxed text-amber-700">
              Tickets awaiting review, approval, or task action.
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
      <MyActivityTable />

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

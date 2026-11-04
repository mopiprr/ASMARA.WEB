
import { useEffect, useMemo, useState } from 'react';
import {
  Ticket,
  Clock,
  CheckCircle2,
  XCircle,
  CalendarDays,
  AlertCircle,
  UserRound,
  MoreHorizontal,
  Activity,
  Hourglass,
  CheckCheck,
  Package,
} from 'lucide-react';

interface DashboardResponse {
  profile: {
    employeeId: string;
    employeeNumber: string;
    fullName: string;
    email: string;
    roles: string[];
  };
  statistics: {
    totalAssets: number;
    available: number;
    inUse: number;
    underMaintenance: number;
    disposed: number;
    archived: number;
  };
  recentAssets: {
    id: number;
    assetTag: string;
    itemName: string;
    employeeName: string | null;
    status: string;
  }[];
  recentTickets: {
    id: string;
    ticketNumber: string;
    subject: string;
    ticketType: string;
    createdAt: string;
  }[];
}

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
  'ROL-03': 3, // Division Manager
  'ROL-02': 2, // Department Manager
  'ROL-01': 1, // Employee
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

  // Ticket Statistics
  // Nilai sementara sampai statistik ticket tersedia dari backend.
  const ticketStatistics = useMemo(() => {
    return [
      {
        title: 'Total Tickets',
        value: 0,
        description: 'All tickets submitted',
        icon: Ticket,
        style: 'bg-blue-100 text-blue-600',
      },
      {
        title: 'Pending Approval',
        value: 0,
        description: 'Waiting for manager approval',
        icon: Clock,
        style: 'bg-amber-100 text-amber-600',
      },
      {
        title: 'In Progress',
        value: 0,
        description: 'Tickets being handled',
        icon: Activity,
        style: 'bg-violet-100 text-violet-600',
      },
      {
        title: 'Completed',
        value: 0,
        description: 'Resolved and closed tickets',
        icon: CheckCircle2,
        style: 'bg-emerald-100 text-emerald-600',
      },
    ];
  }, []);

  const ticketStatus = [
    {
      label: 'Pending Approval',
      value: 0,
      color: 'bg-amber-500',
      textColor: 'text-amber-600',
      icon: Clock,
    },
    {
      label: 'Approved',
      value: 0,
      color: 'bg-blue-500',
      textColor: 'text-blue-600',
      icon: CheckCircle2,
    },
    {
      label: 'In Progress',
      value: 0,
      color: 'bg-violet-500',
      textColor: 'text-violet-600',
      icon: Activity,
    },
    {
      label: 'Resolved',
      value: 0,
      color: 'bg-emerald-500',
      textColor: 'text-emerald-600',
      icon: CheckCheck,
    },
    {
      label: 'Rejected',
      value: 0,
      color: 'bg-red-500',
      textColor: 'text-red-600',
      icon: XCircle,
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
      <section className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:flex-row sm:items-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-100 text-blue-600">
          <UserRound size={28} />
        </div>

        <div className="flex-1">
          <h2 className="font-bold text-slate-800">
            {dashboard.profile.fullName}
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            {dashboard.profile.employeeNumber} · {dashboard.profile.email}
          </p>

          <div className="mt-2 flex flex-wrap gap-2">
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

        <div className="rounded-xl bg-blue-50 px-4 py-3">
          <p className="text-xs font-medium text-blue-600">
            Your Role
          </p>
          <p className="mt-1 text-sm font-bold text-blue-800">
            {getPrimaryRole(dashboard.profile.roles)}
          </p>
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
              Overview of your submitted tickets
            </p>
          </div>

          <Ticket size={22} className="text-blue-600" />
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {ticketStatistics.map((item) => {
            const Icon = item.icon;

            return (
              <div
                key={item.title}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
              >
                <div className="flex items-start justify-between">
                  <div
                    className={`flex h-12 w-12 items-center justify-center rounded-xl ${item.style}`}
                  >
                    <Icon size={23} />
                  </div>

                  <MoreHorizontal size={20} className="text-slate-400" />
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
            <div className="relative flex h-48 w-48 shrink-0 items-center justify-center rounded-full bg-slate-100">
              <div className="flex h-32 w-32 flex-col items-center justify-center rounded-full bg-white">
                <span className="text-3xl font-bold text-slate-800">
                  0
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
                        <Icon size={16} className={item.textColor} />
                        <span className="text-sm text-slate-600">
                          {item.label}
                        </span>
                      </div>

                      <span className="text-sm font-semibold text-slate-800">
                        {item.value}
                      </span>
                    </div>

                    <div className="h-2 rounded-full bg-slate-100">
                      <div
                        className={`h-full w-0 rounded-full ${item.color}`}
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
                Approval Summary
              </h2>
              <p className="text-xs text-slate-500">
                Ticket approval status
              </p>
            </div>
          </div>

          <div className="mt-7 rounded-xl bg-amber-50 p-5">
            <p className="text-sm font-medium text-amber-700">
              Waiting for Approval
            </p>

            <p className="mt-2 text-3xl font-bold text-amber-800">
              0
            </p>

            <p className="mt-2 text-xs leading-relaxed text-amber-700">
              Tickets waiting for your manager's approval will appear here.
            </p>
          </div>

          <div className="mt-4 rounded-xl bg-emerald-50 p-5">
            <p className="text-sm font-medium text-emerald-700">
              Approved Tickets
            </p>

            <p className="mt-2 text-3xl font-bold text-emerald-800">
              0
            </p>

            <p className="mt-2 text-xs text-emerald-700">
              Tickets that have passed approval.
            </p>
          </div>
        </div>
      </section>

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
                  <td colSpan={4} className="px-6 py-12 text-center">
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

    </div>
  );
}

export default DashboardPage;

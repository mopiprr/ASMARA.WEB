
import { useEffect, useMemo, useState } from 'react';
import {
  Boxes,
  Wrench,
  Package,
  CheckCircle2,
  AlertCircle,
  CalendarDays,
  MoreHorizontal,
  ArrowUpRight,
  UserRound,
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
}

const API_URL =
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:5243';

const assetStatus = [
  {
    name: 'Available',
    key: 'available' as const,
    color: 'bg-blue-600',
    hex: '#2563eb',
  },
  {
    name: 'In Use',
    key: 'inUse' as const,
    color: 'bg-violet-500',
    hex: '#8b5cf6',
  },
  {
    name: 'Under Maintenance',
    key: 'underMaintenance' as const,
    color: 'bg-amber-500',
    hex: '#f59e0b',
  },
  {
    name: 'Disposed',
    key: 'disposed' as const,
    color: 'bg-red-500',
    hex: '#ef4444',
  },
  {
    name: 'Archived',
    key: 'archived' as const,
    color: 'bg-emerald-500',
    hex: '#10b981',
  },
];

function getAccessToken() {
  return (
    localStorage.getItem('accessToken') ||
    sessionStorage.getItem('accessToken')
  );
}

function DashboardPage() {
  const [dashboard, setDashboard] = useState<DashboardResponse | null>(null);
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
          throw new Error('Session login tidak ditemukan. Silakan login kembali.');
        }

        const response = await fetch(`${API_URL}/api/dashboard/summary`, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          signal: controller.signal,
        });

        if (response.status === 401) {
          throw new Error('Sesi login telah berakhir. Silakan login kembali.');
        }

        if (!response.ok) {
          throw new Error('Gagal mengambil data dashboard dari server.');
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

  const statistics = useMemo(() => {
    if (!dashboard) return [];

    return [
      {
        title: 'Total Assets',
        value: dashboard.statistics.totalAssets,
        description: 'Total registered assets',
        icon: Boxes,
        iconStyle: 'bg-blue-100 text-blue-600',
      },
      {
        title: 'Available Assets',
        value: dashboard.statistics.available,
        description: 'Ready to be assigned',
        icon: Package,
        iconStyle: 'bg-green-100 text-green-600',
      },
      {
        title: 'Assets In Use',
        value: dashboard.statistics.inUse,
        description: 'Currently assigned',
        icon: UserRound,
        iconStyle: 'bg-purple-100 text-purple-600',
      },
      {
        title: 'Under Maintenance',
        value: dashboard.statistics.underMaintenance,
        description: 'Currently being repaired',
        icon: Wrench,
        iconStyle: 'bg-orange-100 text-orange-600',
      },
    ];
  }, [dashboard]);

  const chartData = useMemo(() => {
    if (!dashboard) return [];

    const total = dashboard.statistics.totalAssets;

    return assetStatus.map((status) => {
      const count = dashboard.statistics[status.key];

      return {
        ...status,
        count,
        percent: total > 0 ? (count / total) * 100 : 0,
      };
    });
  }, [dashboard]);

  const chartGradient = useMemo(() => {
    if (!chartData.length) return 'conic-gradient(#e2e8f0 0% 100%)';

    let currentPercent = 0;

    const segments = chartData.map((item) => {
      const start = currentPercent;
      currentPercent += item.percent;

      return `${item.hex} ${start}% ${currentPercent}%`;
    });

    return `conic-gradient(${segments.join(', ')})`;
  }, [chartData]);

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
            Dashboard
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Welcome back, {dashboard.profile.fullName}! Here's your
            organization's asset overview.
          </p>
        </div>

        <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-600 shadow-sm">
          <CalendarDays size={17} className="text-slate-400" />
          {currentDate}
        </div>
      </section>

      {/* User Profile */}
      <section className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-100 text-blue-600">
            <UserRound size={28} />
          </div>

          <div>
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
        </div>
      </section>

      {/* Statistics */}
      <section className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {statistics.map((item) => {
          const Icon = item.icon;

          return (
            <div
              key={item.title}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
            >
              <div className="flex items-start justify-between">
                <div
                  className={`flex h-12 w-12 items-center justify-center rounded-xl ${item.iconStyle}`}
                >
                  <Icon size={23} />
                </div>

                <MoreHorizontal size={20} className="text-slate-400" />
              </div>

              <p className="mt-5 text-sm font-medium text-slate-500">
                {item.title}
              </p>

              <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-800">
                {item.value.toLocaleString('en-US')}
              </h2>

              <p className="mt-2 text-xs text-slate-400">
                {item.description}
              </p>
            </div>
          );
        })}
      </section>

      {/* Asset Overview */}
      <section className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm xl:col-span-2">
          <div>
            <h2 className="text-lg font-bold text-slate-800">
              Asset Overview
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Asset distribution by status
            </p>
          </div>

          <div className="mt-8 flex flex-col items-center gap-8 sm:flex-row">
            {/* Donut Chart */}
            <div
              className="relative flex h-48 w-48 shrink-0 items-center justify-center rounded-full"
              style={{ background: chartGradient }}
            >
              <div className="flex h-32 w-32 flex-col items-center justify-center rounded-full bg-white">
                <span className="text-3xl font-bold text-slate-800">
                  {dashboard.statistics.totalAssets.toLocaleString('en-US')}
                </span>

                <span className="text-xs text-slate-400">
                  Total Assets
                </span>
              </div>
            </div>

            {/* Chart Legend */}
            <div className="w-full space-y-5">
              {chartData.map((item) => (
                <div key={item.name}>
                  <div className="mb-2 flex items-center justify-between gap-3 text-sm">
                    <div className="flex items-center gap-2">
                      <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${item.color}`} />
                      <span className="text-slate-600">
                        {item.name}
                      </span>
                    </div>

                    <span className="font-semibold text-slate-800">
                      {item.count.toLocaleString('en-US')} (
                      {item.percent.toFixed(1)}%)
                    </span>
                  </div>

                  <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className={`h-full rounded-full ${item.color}`}
                      style={{ width: `${item.percent}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Asset Status Summary */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-bold text-slate-800">
            Asset Status
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Current asset condition
          </p>

          <div className="mt-7 space-y-6">
            {[
              {
                label: 'Available',
                value: dashboard.statistics.available,
                color: 'bg-blue-500',
              },
              {
                label: 'In Use',
                value: dashboard.statistics.inUse,
                color: 'bg-violet-500',
              },
              {
                label: 'Under Maintenance',
                value: dashboard.statistics.underMaintenance,
                color: 'bg-amber-500',
              },
              {
                label: 'Disposed',
                value: dashboard.statistics.disposed,
                color: 'bg-red-500',
              },
              {
                label: 'Archived',
                value: dashboard.statistics.archived,
                color: 'bg-emerald-500',
              },
            ].map((item) => {
              const percentage =
                dashboard.statistics.totalAssets > 0
                  ? (item.value / dashboard.statistics.totalAssets) * 100
                  : 0;

              return (
                <div key={item.label}>
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-sm text-slate-600">
                      {item.label}
                    </span>

                    <span className="text-sm font-bold text-slate-800">
                      {item.value}
                    </span>
                  </div>

                  <div className="h-2 rounded-full bg-slate-100">
                    <div
                      className={`h-full rounded-full ${item.color}`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-8 rounded-xl bg-blue-50 p-4">
            <p className="text-sm font-semibold text-blue-800">
              Asset Overview
            </p>

            <p className="mt-1 text-xs leading-relaxed text-blue-600">
              There are {dashboard.statistics.totalAssets} registered
              assets in the system.
            </p>
          </div>
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
              Latest registered assets
            </p>
          </div>

          <button
            type="button"
            className="text-sm font-semibold text-blue-600 hover:text-blue-700"
          >
            View All
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[650px] text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-400">
              <tr>
                <th className="px-6 py-4 font-semibold">Asset Tag</th>
                <th className="px-6 py-4 font-semibold">Asset Name</th>
                <th className="px-6 py-4 font-semibold">Assigned To</th>
                <th className="px-6 py-4 font-semibold">Status</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {dashboard.recentAssets.length > 0 ? (
                dashboard.recentAssets.map((asset) => {
                  const statusStyle: Record<string, string> = {
                    Available: 'bg-blue-100 text-blue-700',
                    'In Use': 'bg-green-100 text-green-700',
                    'Under Maintenance': 'bg-amber-100 text-amber-700',
                    Disposed: 'bg-red-100 text-red-700',
                    Archived: 'bg-slate-100 text-slate-700',
                  };

                  return (
                    <tr
                      key={asset.id}
                      className="transition hover:bg-slate-50"
                    >
                      <td className="px-6 py-4 font-semibold text-slate-800">
                        {asset.assetTag}
                      </td>

                      <td className="px-6 py-4 text-slate-600">
                        {asset.itemName}
                      </td>

                      <td className="px-6 py-4 text-slate-600">
                        {asset.employeeName || '-'}
                      </td>

                      <td className="px-6 py-4">
                        <span
                          className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
                            statusStyle[asset.status] ||
                            'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {asset.status}
                        </span>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td
                    colSpan={4}
                    className="px-6 py-10 text-center text-slate-400"
                  >
                    No assets found.
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

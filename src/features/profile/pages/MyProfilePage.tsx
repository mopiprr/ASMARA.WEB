import { useEffect, useState } from 'react';
import {
  User,
  Mail,
  Hash,
  Building2,
  CalendarDays,
  ShieldCheck,
  AtSign,
  CheckCircle2,
  XCircle,
  LoaderCircle,
  RefreshCw,
} from 'lucide-react';

interface MyProfile {
  employeeId: string;
  employeeNumber: string;
  fullName: string;
  email: string;
  department: string;
  manager: string | null;
  hireDate: string;
  userName: string;
  isActive: boolean;
  roles: string[];
}

const API_URL =
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:5243';

function getAccessToken() {
  return (
    localStorage.getItem('accessToken') ||
    sessionStorage.getItem('accessToken')
  );
}

function ProfileField({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string;
  icon: React.ElementType;
}) {
  return (
    <div className="flex items-start gap-4 rounded-xl border border-slate-100 bg-slate-50 p-4">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white text-blue-600 shadow-sm">
        <Icon size={19} />
      </div>

      <div className="min-w-0">
        <p className="text-xs font-medium text-slate-500">
          {label}
        </p>

        <p className="mt-1 break-words text-sm font-semibold text-slate-800">
          {value || '-'}
        </p>
      </div>
    </div>
  );
}

function MyProfilePage() {
  const [profile, setProfile] = useState<MyProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  async function loadProfile() {
    const token = getAccessToken();

    if (!token) {
      setError('Sesi login tidak ditemukan. Silakan login kembali.');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch(`${API_URL}/api/profile/me`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Sesi login telah berakhir. Silakan login kembali.');
        }

        throw new Error('Gagal mengambil informasi profil.');
      }

      const result: MyProfile = await response.json();
      setProfile(result);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Terjadi kesalahan saat mengambil data profil.'
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadProfile();
  }, []);

  const initials = profile?.fullName
    ? profile.fullName
        .trim()
        .split(/\s+/)
        .slice(0, 2)
        .map((name) => name.charAt(0).toUpperCase())
        .join('')
    : 'U';

  const formattedHireDate = profile?.hireDate
    ? new Date(profile.hireDate).toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    : '-';

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-slate-500">
          <LoaderCircle size={32} className="animate-spin text-blue-600" />
          <p className="text-sm">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
        <XCircle size={42} className="text-red-500" />

        <h2 className="mt-4 text-lg font-semibold text-slate-800">
          Unable to Load Profile
        </h2>

        <p className="mt-2 max-w-md text-sm text-slate-500">
          {error || 'Profile information is unavailable.'}
        </p>

        <button
          type="button"
          onClick={loadProfile}
          className="mt-5 flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700"
        >
          <RefreshCw size={16} />
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800">
          My Profile
        </h1>

        <p className="mt-1 text-sm text-slate-500">
          View your personal and account information.
        </p>
      </div>

      {/* Profile Overview */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="h-28 bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-500" />

        <div className="px-6 pb-6">
          <div className="-mt-12 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
              <div className="flex h-24 w-24 items-center justify-center rounded-2xl border-4 border-white bg-blue-100 text-2xl font-bold text-blue-700 shadow-sm">
                {initials}
              </div>

              <div className="pb-1">
                <h2 className="text-xl font-bold text-slate-800">
                  {profile.fullName}
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  {profile.employeeNumber}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 self-start rounded-full bg-green-50 px-3 py-1.5 text-xs font-semibold text-green-700 sm:self-auto">
              <CheckCircle2 size={15} />
              {profile.isActive ? 'Active Account' : 'Inactive Account'}
            </div>
          </div>

          {/* Roles */}
          <div className="mt-6 border-t border-slate-100 pt-5">
            <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
              Assigned Roles
            </p>

            <div className="flex flex-wrap gap-2">
              {profile.roles.map((role) => (
                <span
                  key={role}
                  className="rounded-lg bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700"
                >
                  {role}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Information Sections */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        {/* Employee Information */}
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <User size={20} />
            </div>

            <div>
              <h3 className="font-semibold text-slate-800">
                Employee Information
              </h3>

              <p className="text-xs text-slate-500">
                Your registered employee details
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <ProfileField
              label="Full Name"
              value={profile.fullName}
              icon={User}
            />

            <ProfileField
              label="Employee Number"
              value={profile.employeeNumber}
              icon={Hash}
            />

            <ProfileField
              label="Email Address"
              value={profile.email}
              icon={Mail}
            />

            <ProfileField
              label="Department"
              value={profile.department}
              icon={Building2}
            />

            <ProfileField
            label="Manager"
            value={profile.manager || '-'}
            icon={User}
            />

            <ProfileField
              label="Hire Date"
              value={formattedHireDate}
              icon={CalendarDays}
            />
          </div>
        </section>

        {/* Account Information */}
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
              <ShieldCheck size={20} />
            </div>

            <div>
              <h3 className="font-semibold text-slate-800">
                Account Information
              </h3>

              <p className="text-xs text-slate-500">
                Your ASMARA account details
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <ProfileField
              label="Username"
              value={profile.userName}
              icon={AtSign}
            />

            <div className="flex items-start gap-4 rounded-xl border border-slate-100 bg-slate-50 p-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white text-blue-600 shadow-sm">
                <ShieldCheck size={19} />
              </div>

              <div>
                <p className="text-xs font-medium text-slate-500">
                  Account Status
                </p>

                <div className="mt-1 flex items-center gap-2">
                  {profile.isActive ? (
                    <>
                      <CheckCircle2 size={16} className="text-green-600" />
                      <span className="text-sm font-semibold text-green-700">
                        Active
                      </span>
                    </>
                  ) : (
                    <>
                      <XCircle size={16} className="text-red-600" />
                      <span className="text-sm font-semibold text-red-700">
                        Inactive
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Read Only Notice */}
          <div className="mt-6 rounded-xl border border-blue-100 bg-blue-50 p-4">
            <p className="text-sm font-semibold text-blue-800">
              Profile Information
            </p>

            <p className="mt-1 text-xs leading-relaxed text-blue-700">
              Your employee and account information is managed by the
              administrator. Contact your administrator if any information
              needs to be updated.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}

export default MyProfilePage;

import { useEffect, useState } from 'react';
import {
  Bell,
  ChevronDown,
  ChevronRight,
  Home,
  Menu,
  User,
  LogOut,
  Settings,
  CalendarDays,
} from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { ConfirmDialog } from '../common/ConfirmDialog';
import { getAccessToken, logout } from '../../services/authSession';

type TopbarProps = {
  onOpenSidebar: () => void;
};

interface UserProfile {
  employeeId: string;
  employeeNumber: string;
  fullName: string;
  email: string;
  department?: string;
  departmentName?: string;
  manager?: string | null;
  hireDate?: string;
  userName?: string;
  isActive?: boolean;
  roles: string[];
}

const ROUTE_LABELS: Record<string, string> = {
  dashboard: 'Dashboard',
  procurement: 'Procurement',
  maintenance: 'Maintenance',
  inventory: 'Inventory',
  assets: 'Asset Management',
  finance: 'Finance',
  employees: 'Employees',
  settings: 'Settings',
  profile: 'My Profile',
  create: 'Tambah Baru',
  edit: 'Edit',
  detail: 'Detail',
};

function formatSegmentLabel(segment: string): string {
  if (ROUTE_LABELS[segment.toLowerCase()]) {
    return ROUTE_LABELS[segment.toLowerCase()];
  }
  // Jika segmen berupa ID panjang/UUID, persingkat jadi "Detail"
  if (segment.length > 16 || /^[0-9a-f-]{8,}$/i.test(segment)) {
    return 'Detail';
  }
  return segment
    .replace(/-/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function getUserSubtitle(profile: UserProfile | null): string {
  if (!profile) return 'User';

  const roles = profile.roles || [];
  const department = (profile.department || profile.departmentName || '').trim();

  // Check if user has manager role (ROL-02, ROL-03, or contains 'Manager')
  const isManager = roles.some((role) => {
    const r = role.toUpperCase();
    return r === 'ROL-02' || r === 'ROL-03' || r.includes('MANAGER');
  });

  if (isManager) {
    return department ? `Manager - ${department}` : 'Manager';
  }

  // Ordinary employee or non-manager: show department
  if (department) {
    return department;
  }

  return 'Employee';
}

function Topbar({ onOpenSidebar }: TopbarProps) {
  const [profileOpen, setProfileOpen] = useState(false);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [showSignOutConfirm, setShowSignOutConfirm] = useState(false);

  const navigate = useNavigate();
  const { pathname } = useLocation();

  // Bangun item breadcrumb dari URL aktif
  const pathSegments = pathname.split('/').filter(Boolean);
  const breadcrumbs = pathSegments.map((segment, index) => ({
    label: formatSegmentLabel(segment),
    path: '/' + pathSegments.slice(0, index + 1).join('/'),
    isLast: index === pathSegments.length - 1,
  }));

  // Format tanggal ringkas (contoh: Rabu, 18 Nov 2026)
  const formattedDate = new Intl.DateTimeFormat('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date());

  useEffect(() => {
    async function loadProfile() {
      const token = getAccessToken();

      if (!token) {
        setProfile(null);
        return;
      }

      try {
        const response = await api.get<UserProfile>('/profile/me');
        setProfile(response.data);
      } catch (error) {
        console.error('Failed to load user profile:', error);
      }
    }

    void loadProfile();

    // Refresh profile when authentication changes.
    window.addEventListener('auth-changed', loadProfile);

    return () => {
      window.removeEventListener('auth-changed', loadProfile);
    };
  }, []);

  const initials = profile?.fullName
    ? profile.fullName
        .trim()
        .split(/\s+/)
        .slice(0, 2)
        .map((name) => name.charAt(0).toUpperCase())
        .join('')
    : 'U';

  const displayName = profile?.fullName || 'Loading...';
  const displaySubtitle = getUserSubtitle(profile);

  async function handleSignOut() {
    setProfile(null);
    setProfileOpen(false);
    // Cabut refresh token di server, hapus cookie & sesi di browser.
    await logout();
    // Redirect to login.
    navigate('/', { replace: true });
  }

  return (
    <>
      <header className="sticky top-0 z-30 flex h-[76px] items-center justify-between border-b border-slate-200 bg-white px-4 shadow-[0_1px_2px_rgba(15,23,42,0.03)] sm:px-6 lg:px-8">
        {/* Left Section: Mobile Trigger & Breadcrumb Navigation */}
        <div className="flex min-w-0 items-center gap-3.5">
          <button
            type="button"
            onClick={onOpenSidebar}
            className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 transition-colors hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900 active:scale-95 lg:hidden"
            aria-label="Buka menu"
          >
            <Menu size={20} />
          </button>

          {/* Breadcrumb Trail */}
          <nav aria-label="Breadcrumb" className="flex min-w-0 items-center gap-1.5 text-sm">
            <Link
              to="/dashboard"
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
              title="Ke Dashboard"
            >
              <Home size={16} />
            </Link>

            {breadcrumbs.map((crumb) => (
              <div key={crumb.path} className="flex min-w-0 items-center gap-1.5">
                <ChevronRight size={14} className="shrink-0 text-slate-300" />
                {crumb.isLast ? (
                  <span className="truncate rounded-lg bg-slate-100/80 px-2.5 py-1 text-xs font-semibold text-slate-800 sm:text-sm">
                    {crumb.label}
                  </span>
                ) : (
                  <Link
                    to={crumb.path}
                    className="truncate rounded-lg px-2 py-1 text-xs font-medium text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-800 sm:text-sm"
                  >
                    {crumb.label}
                  </Link>
                )}
              </div>
            ))}
          </nav>
        </div>

        {/* Right Section: Date Badge, Notification & User Pill */}
        <div className="flex items-center gap-2.5 sm:gap-3.5">
          {/* Date Pill (Desktop) */}
          <div className="hidden items-center gap-2 rounded-xl border border-slate-200/80 bg-slate-50/80 px-3 py-2 text-xs font-medium text-slate-600 md:flex">
            <CalendarDays size={15} className="text-teal-600" />
            <span>{formattedDate}</span>
          </div>

          {/* Notification Button */}
          <button
            type="button"
            className="group relative inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 transition-colors duration-150 hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900 active:scale-95"
            aria-label="Notifikasi"
          >
            <Bell
              size={19}
              className="transition-transform duration-200 group-hover:rotate-6"
            />

            <span className="absolute right-2.5 top-2.5 flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-rose-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-rose-500 ring-2 ring-white" />
            </span>
          </button>

          <div className="hidden h-7 w-px bg-slate-200 sm:block" />

          {/* Profile Dropdown Trigger */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setProfileOpen((prev) => !prev)}
              aria-expanded={profileOpen}
              className={`group flex items-center gap-2.5 rounded-xl border py-1.5 pl-1.5 pr-2.5 transition-colors duration-150 ${
                profileOpen
                  ? 'border-sky-200 bg-sky-50'
                  : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
              }`}
            >
              {/* Avatar dengan gradasi selaras logo ASMARA & status aktif */}
              <div className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-blue-700 to-teal-600 text-xs font-bold tracking-wider text-white">
                {initials}
                <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-white bg-emerald-500" />
              </div>

              <div className="hidden max-w-48 text-left sm:block">
                <p className="truncate text-xs font-semibold leading-snug text-slate-800">
                  {displayName}
                </p>
                <p
                  className="truncate text-[11px] leading-tight text-slate-500"
                  title={displaySubtitle}
                >
                  {displaySubtitle}
                </p>
              </div>

              <ChevronDown
                size={15}
                className={`hidden text-slate-400 transition-transform duration-200 sm:block ${
                  profileOpen
                    ? 'rotate-180 text-slate-700'
                    : 'group-hover:text-slate-600'
                }`}
              />
            </button>

            {/* Profile Dropdown Menu */}
            {profileOpen && (
              <>
                <div
                  aria-hidden="true"
                  onClick={() => setProfileOpen(false)}
                  className="fixed inset-0 z-40"
                />

                <div className="absolute right-0 top-[54px] z-50 w-64 overflow-hidden rounded-2xl border border-slate-200 bg-white p-1.5 shadow-[0_14px_32px_-8px_rgba(15,23,42,0.16)] ring-1 ring-slate-950/5">
                  {/* User Info Header */}
                  <div className="mb-1 rounded-xl bg-slate-50 px-3.5 py-3">
                    <p className="truncate text-sm font-semibold text-slate-900">
                      {displayName}
                    </p>
                    <p className="mt-0.5 truncate text-xs text-slate-500">
                      {profile?.email || '-'}
                    </p>
                    <span className="mt-2 inline-flex items-center rounded-md border border-sky-200 bg-white px-2 py-0.5 text-[11px] font-semibold text-blue-700">
                      {displaySubtitle}
                    </span>
                  </div>

                  <div className="space-y-0.5">
                    <button
                      type="button"
                      onClick={() => {
                        setProfileOpen(false);
                        navigate('/profile');
                      }}
                      className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900"
                    >
                      <User size={16} className="text-slate-400" />
                      My Profile
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setProfileOpen(false);
                        navigate('/settings');
                      }}
                      className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900"
                    >
                      <Settings size={16} className="text-slate-400" />
                      Settings
                    </button>
                  </div>

                  <div className="my-1.5 border-t border-slate-100" />

                  <button
                    type="button"
                    onClick={() => {
                      setProfileOpen(false);
                      setShowSignOutConfirm(true);
                    }}
                    className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-medium text-rose-600 transition-colors hover:bg-rose-50"
                  >
                    <LogOut size={16} />
                    Sign Out
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </header>

      {/* SIGN OUT CONFIRMATION DIALOG */}
      <ConfirmDialog
        isOpen={showSignOutConfirm}
        title="Sign Out"
        message="Are you sure you want to sign out?"
        description="You will be logged out of your session and redirected to the login screen."
        type="danger"
        confirmText="Yes, Sign Out"
        cancelText="Cancel"
        onConfirm={handleSignOut}
        onCancel={() => setShowSignOutConfirm(false)}
      />
    </>
  );
}

export default Topbar;
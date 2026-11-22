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
import { createPortal } from 'react-dom';

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

// Batik Truntum Bintang 8 Sudut (Tile 38x38px = tepat 2 baris utuh di tinggi Topbar 76px)
const TRUNTUM_SYMMETRIC_PATTERN = `url("data:image/svg+xml,%3Csvg width='38' height='38' viewBox='0 0 38 38' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none'%3E%3C!-- Bingkai Belah Ketupat Penghubung --%3E%3Cpath d='M19 0L38 19L19 38L0 19Z' stroke='%230d9488' stroke-width='1.1' stroke-opacity='0.22'/%3E%3C!-- Kelopak Bintang Simetris di Tengah --%3E%3Cpath d='M19 5C21.5 11 21.5 15 19 19C16.5 15 16.5 11 19 5Z' fill='%231d4ed8' fill-opacity='0.14'/%3E%3Cpath d='M19 33C21.5 27 21.5 23 19 19C16.5 23 16.5 27 19 33Z' fill='%231d4ed8' fill-opacity='0.14'/%3E%3Cpath d='M5 19C11 16.5 15 16.5 19 19C15 21.5 11 21.5 5 19Z' fill='%230d9488' fill-opacity='0.16'/%3E%3Cpath d='M33 19C27 16.5 23 16.5 19 19C23 21.5 27 21.5 33 19Z' fill='%230d9488' fill-opacity='0.16'/%3E%3C!-- Kelopak Diagonal --%3E%3Cpath d='M9 9L19 19M29 9L19 19M9 29L19 19M29 29L19 19' stroke='%230284c7' stroke-width='1' stroke-opacity='0.2'/%3E%3C!-- Titik Pusat & Sudut --%3E%3Ccircle cx='19' cy='19' r='2.2' fill='%231d4ed8' fill-opacity='0.32'/%3E%3Ccircle cx='0' cy='0' r='2' fill='%230d9488' fill-opacity='0.28'/%3E%3Ccircle cx='38' cy='0' r='2' fill='%230d9488' fill-opacity='0.28'/%3E%3Ccircle cx='0' cy='38' r='2' fill='%230d9488' fill-opacity='0.28'/%3E%3Ccircle cx='38' cy='38' r='2' fill='%230d9488' fill-opacity='0.28'/%3E%3C/g%3E%3C/svg%3E")`;

function formatSegmentLabel(segment: string): string {
  if (ROUTE_LABELS[segment.toLowerCase()]) {
    return ROUTE_LABELS[segment.toLowerCase()];
  }
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

  const isManager = roles.some((role) => {
    const r = role.toUpperCase();
    return r === 'ROL-02' || r === 'ROL-03' || r.includes('MANAGER');
  });

  if (isManager) {
    return department ? `Manager - ${department}` : 'Manager';
  }

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

  const pathSegments = pathname.split('/').filter(Boolean);
  const breadcrumbs = pathSegments.map((segment, index) => ({
    label: formatSegmentLabel(segment),
    path: '/' + pathSegments.slice(0, index + 1).join('/'),
    isLast: index === pathSegments.length - 1,
  }));

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
    await logout();
    navigate('/', { replace: true });
  }

  return (
    <>
      <header className="sticky top-0 z-30 flex h-[76px] items-center justify-between border-b border-slate-200/90 bg-gradient-to-r from-blue-50/75 via-white/95 to-teal-50/75 px-4 shadow-[0_2px_12px_-3px_rgba(15,23,42,0.05)] backdrop-blur-md sm:px-6 lg:px-8">
        {/* Top Accent Strip */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r from-blue-700 via-sky-500 to-teal-500"
        />

        {/* Symmetric Batik Truntum Pattern Layer (Hanya di Topbar utama) */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 overflow-hidden"
        >
          <div
            className="h-full w-full"
            style={{
              backgroundImage: TRUNTUM_SYMMETRIC_PATTERN,
              backgroundSize: '38px 38px',
              backgroundPosition: 'center top',
            }}
          />
        </div>

        {/* Left Section: Mobile Trigger & Breadcrumb Navigation */}
        <div className="relative z-10 flex min-w-0 items-center gap-3.5">
          <button
            type="button"
            onClick={onOpenSidebar}
            className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white/95 text-slate-600 shadow-2xs transition-colors hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900 active:scale-95 lg:hidden"
            aria-label="Buka menu"
          >
            <Menu size={20} />
          </button>

          {/* Breadcrumb Trail */}
          <nav
            aria-label="Breadcrumb"
            className="flex min-w-0 items-center gap-1.5 text-sm"
          >
            <Link
              to="/dashboard"
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-slate-200/80 bg-white/95 text-slate-500 shadow-2xs transition-all hover:border-blue-200 hover:bg-white hover:text-blue-700"
              title="Ke Dashboard"
            >
              <Home size={16} />
            </Link>

            {breadcrumbs.map((crumb) => (
              <div key={crumb.path} className="flex min-w-0 items-center gap-1.5">
                <ChevronRight size={14} className="shrink-0 text-slate-400" />
                {crumb.isLast ? (
                  <span className="truncate rounded-lg border border-blue-200/80 bg-white/95 px-3 py-1 text-xs font-semibold text-slate-800 shadow-2xs sm:text-sm">
                    {crumb.label}
                  </span>
                ) : (
                  <Link
                    to={crumb.path}
                    className="truncate rounded-lg bg-white/85 px-2 py-1 text-xs font-medium text-slate-600 transition-colors hover:bg-white hover:text-slate-900 sm:text-sm"
                  >
                    {crumb.label}
                  </Link>
                )}
              </div>
            ))}
          </nav>
        </div>

        {/* Right Section: Date Badge, Notification & User Pill */}
        <div className="relative z-10 flex items-center gap-2.5 sm:gap-3.5">
          {/* Date Pill (Desktop) */}
          <div className="hidden items-center gap-2 rounded-xl border border-teal-200/80 bg-white/95 px-3.5 py-2 text-xs font-medium text-slate-700 shadow-2xs md:flex">
            <CalendarDays size={15} className="text-teal-600" />
            <span>{formattedDate}</span>
          </div>

          {/* Notification Button */}
          <button
            type="button"
            className="group relative inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white/95 text-slate-600 shadow-2xs transition-all duration-150 hover:border-blue-300 hover:bg-white hover:text-blue-700 active:scale-95"
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

          <div className="hidden h-7 w-px bg-slate-300/70 sm:block" />

          {/* Profile Dropdown Trigger */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setProfileOpen((prev) => !prev)}
              aria-expanded={profileOpen}
              className={`group flex items-center gap-2.5 rounded-xl border py-1.5 pl-1.5 pr-3 shadow-2xs transition-all duration-150 ${
                profileOpen
                  ? 'border-teal-300 bg-teal-50/90'
                  : 'border-slate-200 bg-white/95 hover:border-teal-300 hover:bg-white'
              }`}
            >
              <div className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-blue-700 to-teal-600 text-xs font-bold tracking-wider text-white shadow-xs">
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
                    ? 'rotate-180 text-teal-700'
                    : 'group-hover:text-slate-600'
                }`}
              />
            </button>

            {/* Profile Dropdown Menu (Bersih tanpa motif batik) */}
            {profileOpen && (
              <>
                <div
                  aria-hidden="true"
                  onClick={() => setProfileOpen(false)}
                  className="fixed inset-0 z-40"
                />

                <div className="absolute right-0 top-[54px] z-50 w-64 overflow-hidden rounded-2xl border border-slate-200 bg-white p-1.5 shadow-[0_14px_32px_-8px_rgba(15,23,42,0.16)] ring-1 ring-slate-950/5">
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
      
{/* SIGN OUT CONFIRMATION DIALOG */}
{createPortal(
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
  />,
  document.body
)}

    </>
  );
}

export default Topbar;
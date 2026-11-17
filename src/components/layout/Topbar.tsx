import { useEffect, useState } from 'react';
import {
  Bell,
  ChevronDown,
  Menu,
  User,
  LogOut,
  Settings,
} from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
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

const PAGE_TITLES: Record<string, { title: string; subtitle: string }> = {
  '/dashboard': {
    title: 'Dashboard',
    subtitle: 'Ringkasan operasional & pemantauan aset sarana',
  },
  '/procurement': {
    title: 'Procurement',
    subtitle: 'Pengajuan dan pelacakan pengadaan barang & jasa',
  },
  '/maintenance': {
    title: 'Maintenance',
    subtitle: 'Tiket pemeliharaan dan perbaikan sarana',
  },
  '/inventory': {
    title: 'Inventory',
    subtitle: 'Manajemen stok dan distribusi barang inventaris',
  },
  '/assets': {
    title: 'Asset Management',
    subtitle: 'Registri, siklus hidup, dan penempatan aset',
  },
  '/finance': {
    title: 'Finance',
    subtitle: 'Anggaran, realisasi biaya, dan laporan keuangan',
  },
  '/employees': {
    title: 'Employees',
    subtitle: 'Direktori karyawan dan pengaturan hak akses',
  },
  '/settings': {
    title: 'Settings',
    subtitle: 'Konfigurasi sistem dan preferensi aplikasi',
  },
  '/profile': {
    title: 'My Profile',
    subtitle: 'Informasi akun dan detail kepegawaian',
  },
};

function getPageMeta(pathname: string) {
  if (PAGE_TITLES[pathname]) {
    return PAGE_TITLES[pathname];
  }

  const matchedKey = Object.keys(PAGE_TITLES).find(
    (key) => key !== '/' && pathname.startsWith(`${key}/`)
  );

  return matchedKey
    ? PAGE_TITLES[matchedKey]
    : {
        title: 'ASMARA',
        subtitle: 'Asset Management Sarana',
      };
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
  const pageMeta = getPageMeta(pathname);

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
    <header className="sticky top-0 z-30 flex h-[76px] items-center justify-between border-b border-slate-200/80 bg-white/85 px-4 backdrop-blur-md transition-colors sm:px-6 lg:px-8">
      {/* Left Section: Mobile Trigger & Dynamic Page Context */}
      <div className="flex min-w-0 items-center gap-3.5">
        <button
          type="button"
          onClick={onOpenSidebar}
          className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200/80 bg-white text-slate-600 shadow-2xs transition-all hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900 active:scale-95 lg:hidden"
          aria-label="Buka menu"
        >
          <Menu size={20} />
        </button>

        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h1 className="truncate text-base font-bold tracking-tight text-slate-900 sm:text-lg">
              {pageMeta.title}
            </h1>
          </div>
          <p className="hidden truncate text-xs text-slate-500 sm:block">
            {pageMeta.subtitle}
          </p>
        </div>
      </div>

      {/* Right Section: Notification & User Pill */}
      <div className="flex items-center gap-2.5 sm:gap-3.5">
        {/* Notification Button */}
        <button
          type="button"
          className="group relative inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200/80 bg-white text-slate-500 shadow-2xs transition-all duration-150 hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900 active:scale-95"
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

        <div className="hidden h-7 w-px bg-slate-200/80 sm:block" />

        {/* Profile Dropdown Trigger */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setProfileOpen((prev) => !prev)}
            aria-expanded={profileOpen}
            className={`group flex items-center gap-2.5 rounded-xl border py-1.5 pl-1.5 pr-2.5 transition-all duration-150 ${
              profileOpen
                ? 'border-sky-200 bg-sky-50/50 shadow-xs'
                : 'border-slate-200/80 bg-white shadow-2xs hover:border-slate-300 hover:bg-slate-50/80'
            }`}
          >
            {/* Avatar dengan gradasi selaras logo ASMARA & status aktif */}
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
                profileOpen ? 'rotate-180 text-slate-700' : 'group-hover:text-slate-600'
              }`}
            />
          </button>

          {/* Profile Dropdown Menu */}
          {profileOpen && (
            <>
              <button
                type="button"
                aria-label="Tutup menu profil"
                onClick={() => setProfileOpen(false)}
                className="fixed inset-0 z-40 cursor-default"
              />

              <div className="absolute right-0 top-[54px] z-50 w-64 origin-top-right overflow-hidden rounded-2xl border border-slate-200/90 bg-white p-1.5 shadow-[0_14px_32px_-8px_rgba(15,23,42,0.14)] ring-1 ring-slate-950/5">
                {/* User Info Header */}
                <div className="mb-1 rounded-xl bg-gradient-to-r from-slate-50 to-sky-50/60 px-3.5 py-3">
                  <p className="truncate text-sm font-semibold text-slate-900">
                    {displayName}
                  </p>
                  <p className="mt-0.5 truncate text-xs text-slate-500">
                    {profile?.email || '-'}
                  </p>
                  <span className="mt-2 inline-flex items-center rounded-md border border-sky-200/80 bg-white px-2 py-0.5 text-[11px] font-semibold text-blue-700 shadow-2xs">
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
                    className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100/80 hover:text-slate-900"
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
                    className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100/80 hover:text-slate-900"
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
    </header>
  );
}

export default Topbar;
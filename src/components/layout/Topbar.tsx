
import { useEffect, useState } from 'react';
import {
  Bell,
  ChevronDown,
  Menu,
  Search,
  User,
  LogOut,
  Settings,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

type TopbarProps = {
  onOpenSidebar: () => void;
};

interface UserProfile {
  employeeId: string;
  employeeNumber: string;
  fullName: string;
  email: string;
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

function Topbar({ onOpenSidebar }: TopbarProps) {
  const [profileOpen, setProfileOpen] = useState(false);
  const [profile, setProfile] = useState<UserProfile | null>(null);

  const navigate = useNavigate();

  useEffect(() => {
    async function loadProfile() {
      const token = getAccessToken();

      if (!token) {
        setProfile(null);
        return;
      }

      try {
        const response = await fetch(`${API_URL}/api/dashboard/summary`, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          setProfile(null);
          return;
        }

        const result = await response.json();
        setProfile(result.profile);
      } catch (error) {
        console.error('Failed to load user profile:', error);
      }
    }

    loadProfile();

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
  const displayRole = profile?.roles?.join(' · ') || 'User';

  function handleSignOut() {
    // Remove authentication data.
    localStorage.removeItem('accessToken');
    localStorage.removeItem('user');

    sessionStorage.removeItem('accessToken');
    sessionStorage.removeItem('user');

    setProfile(null);
    setProfileOpen(false);

    // Notify other components.
    window.dispatchEvent(new Event('auth-changed'));

    // Redirect to login.
    navigate('/', { replace: true });
  }

  return (
    <header className="sticky top-0 z-30 flex h-20 items-center justify-between border-b border-slate-200 bg-white px-4 sm:px-6 lg:px-8">
      {/* Left Section */}
      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={onOpenSidebar}
          className="rounded-lg p-2 text-slate-600 transition hover:bg-slate-100 lg:hidden"
          aria-label="Buka menu"
        >
          <Menu size={22} />
        </button>

        <div className="hidden items-center gap-2 rounded-xl bg-slate-100 px-4 py-2.5 sm:flex">
          <Search size={18} className="text-slate-400" />

          <input
            type="text"
            placeholder="Search anything..."
            className="w-40 bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400 md:w-64"
          />

          <span className="hidden rounded-md border border-slate-200 bg-white px-2 py-1 text-[10px] text-slate-400 md:inline">
            Ctrl K
          </span>
        </div>
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-3 sm:gap-5">
        {/* Notification */}
        <button
          type="button"
          className="relative rounded-xl p-2.5 text-slate-500 transition hover:bg-slate-100 hover:text-slate-800"
          aria-label="Notifikasi"
        >
          <Bell size={21} />

          <span className="absolute right-2 top-2 h-2 w-2 rounded-full border-2 border-white bg-red-500" />
        </button>

        <div className="h-8 w-px bg-slate-200" />

        {/* Profile */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setProfileOpen((prev) => !prev)}
            className="flex items-center gap-3 rounded-xl p-1.5 transition hover:bg-slate-50"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-700">
              {initials}
            </div>

            <div className="hidden max-w-40 text-left sm:block">
              <p className="truncate text-sm font-semibold text-slate-800">
                {displayName}
              </p>

              <p className="truncate text-xs text-slate-500">
                {displayRole}
              </p>
            </div>

            <ChevronDown
              size={16}
              className={`hidden text-slate-400 transition sm:block ${
                profileOpen ? 'rotate-180' : ''
              }`}
            />
          </button>

          {/* Profile Dropdown */}
          {profileOpen && (
            <>
              <button
                type="button"
                aria-label="Tutup menu profil"
                onClick={() => setProfileOpen(false)}
                className="fixed inset-0 z-40 cursor-default"
              />

              <div className="absolute right-0 top-14 z-50 w-64 overflow-hidden rounded-xl border border-slate-200 bg-white py-2 shadow-xl">
                <div className="border-b border-slate-100 px-4 py-3">
                  <p className="truncate text-sm font-semibold text-slate-800">
                    {displayName}
                  </p>

                  <p className="mt-1 truncate text-xs text-slate-500">
                    {profile?.email || '-'}
                  </p>

                  <p className="mt-2 text-xs font-medium text-blue-600">
                    {displayRole}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setProfileOpen(false)}
                  className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-slate-600 transition hover:bg-slate-50"
                >
                  <User size={17} />
                  My Profile
                </button>

                <button
                  type="button"
                  onClick={() => setProfileOpen(false)}
                  className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-slate-600 transition hover:bg-slate-50"
                >
                  <Settings size={17} />
                  Settings
                </button>

                <div className="my-1 border-t border-slate-100" />

                <button
                  type="button"
                  onClick={handleSignOut}
                  className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-red-600 transition hover:bg-red-50"
                >
                  <LogOut size={17} />
                  Sign Out
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

export default Topbar;

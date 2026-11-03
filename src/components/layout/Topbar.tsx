import { useState } from 'react';
import {
  Bell,
  ChevronDown,
  Menu,
  Search,
  User,
  LogOut,
  Settings,
} from 'lucide-react';

type TopbarProps = {
  onOpenSidebar: () => void;
};

function Topbar({ onOpenSidebar }: TopbarProps) {
  const [profileOpen, setProfileOpen] = useState(false);

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
              B
            </div>

            <div className="hidden text-left sm:block">
              <p className="text-sm font-semibold text-slate-800">
                Bagas Ruliansyah
              </p>
              <p className="text-xs text-slate-500">
                Employee
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

              <div className="absolute right-0 top-14 z-50 w-52 overflow-hidden rounded-xl border border-slate-200 bg-white py-2 shadow-xl">
                <div className="border-b border-slate-100 px-4 py-3">
                  <p className="text-sm font-semibold text-slate-800">
                    Bagas
                  </p>
                  <p className="text-xs text-slate-500">
                    Employee
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
                  onClick={() => setProfileOpen(false)}
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
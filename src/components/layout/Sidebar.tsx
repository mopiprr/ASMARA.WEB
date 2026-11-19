import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  ClipboardList,
  Wrench,
  Package,
  Boxes,
  CircleDollarSign,
  Users,
  Settings,
  PanelLeftClose,
  PanelLeftOpen,
  X,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

import { hasAnyRole, isAdmin, ROLE_ADMIN } from '../../utils/auth';
import { ASSET_ACCESS_ROLES } from '../../features/assets/utils/asset.utils';
import { INVENTORY_ACCESS_ROLES } from '../../features/inventory/utils/inventory.utils';
import { FINANCE_ACCESS_ROLES } from '../../features/finance/utils/finance.utils';

type SidebarProps = {
  collapsed: boolean;
  onToggle: () => void;
  mobileOpen: boolean;
  onCloseMobile: () => void;
};

type NavItem = {
  label: string;
  path: string;
  icon: LucideIcon;
  // Kosong = semua user boleh lihat. Diisi = hanya role tersebut.
  roles?: string[];
  adminVisible?: boolean;
};

const navigation: NavItem[] = [
  {
    label: 'Dashboard',
    path: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    label: 'Procurement',
    path: '/procurement',
    icon: ClipboardList,
  },
  {
    label: 'Maintenance',
    path: '/maintenance',
    icon: Wrench,
  },
  {
    label: 'Inventory',
    path: '/inventory',
    icon: Package,
    roles: INVENTORY_ACCESS_ROLES,
  },
  {
    label: 'Asset Management',
    path: '/assets',
    icon: Boxes,
    roles: ASSET_ACCESS_ROLES,
  },
];

const management: NavItem[] = [
  {
    label: 'Finance',
    path: '/finance',
    icon: CircleDollarSign,
    roles: FINANCE_ACCESS_ROLES,
  },
  {
    label: 'Employees',
    path: '/employees',
    icon: Users,
    roles: [ROLE_ADMIN],
    adminVisible: true,
  },
  {
    label: 'Settings',
    path: '/settings',
    icon: Settings,
    adminVisible: true,
  },
];

function canSee(item: NavItem) {
  if (isAdmin()) return item.adminVisible === true;

  return !item.roles || hasAnyRole(item.roles);
}

function Sidebar({
  collapsed,
  onToggle,
  mobileOpen,
  onCloseMobile,
}: SidebarProps) {
  // Dipanggil supaya menu dihitung ulang setiap pindah halaman (mis. setelah login ulang).
  useLocation();

  // Hanya menu yang boleh diakses role user ini.
  const visibleNavigation = navigation.filter(canSee);
  const visibleManagement = management.filter(canSee);

  const renderLinks = (items: NavItem[]) =>
    items.map(({ label, path, icon: Icon }) => (
      <NavLink
        key={path}
        to={path}
        end={path === '/dashboard'}
        onClick={onCloseMobile}
        aria-label={collapsed ? label : undefined}
        className={({ isActive }) =>
          `group relative flex items-center rounded-xl py-2.5 text-sm font-medium transition-all duration-200 ${
            collapsed ? 'justify-center px-0' : 'gap-3 px-3.5'
          } ${
            isActive
              ? 'bg-gradient-to-r from-sky-50 to-teal-50/70 font-semibold text-slate-900 shadow-[0_2px_8px_-2px_rgba(14,116,144,0.12)] ring-1 ring-inset ring-sky-200/80'
              : 'text-slate-600 hover:bg-slate-100/80 hover:text-slate-900 active:scale-[0.99]'
          }`
        }
      >
        {({ isActive }) => (
          <>
            {/* Garis indikator aktif di sisi kiri */}
            <span
              className={`absolute left-0 top-1/2 w-[3px] -translate-y-1/2 rounded-r-full transition-all duration-200 ${
                isActive
                  ? 'h-5 bg-gradient-to-b from-blue-600 to-emerald-500 opacity-100'
                  : 'h-0 bg-slate-300 opacity-0 group-hover:h-3 group-hover:opacity-100'
              }`}
            />

            {/* Wadah ikon bersih */}
            <span
              className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg transition-colors duration-200 ${
                isActive
                  ? 'bg-white text-blue-700 shadow-xs ring-1 ring-slate-200/70'
                  : 'text-slate-400 group-hover:text-slate-700'
              }`}
            >
              <Icon size={17} strokeWidth={isActive ? 2.2 : 1.9} />
            </span>

            {/* Label menu */}
            {!collapsed && <span className="truncate">{label}</span>}

            {/* Floating Tooltip saat mode collapsed */}
            {collapsed && (
              <span className="pointer-events-none fixed left-[88px] z-50 hidden -translate-x-1 rounded-lg border border-slate-200/90 bg-white px-3 py-1.5 text-xs font-medium whitespace-nowrap text-slate-800 opacity-0 shadow-[0_8px_20px_-4px_rgba(15,23,42,0.12)] transition-all duration-150 group-hover:translate-x-0 group-hover:opacity-100 lg:block">
                {label}
              </span>
            )}
          </>
        )}
      </NavLink>
    ));

  return (
    <>
      {/* Mobile Overlay */}
      {mobileOpen && (
        <div
          role="button"
          tabIndex={0}
          aria-label="Tutup menu"
          onClick={onCloseMobile}
          onKeyDown={(e) => e.key === 'Escape' && onCloseMobile()}
          className="fixed inset-0 z-30 bg-slate-900/30 backdrop-blur-xs transition-opacity lg:hidden"
        />
      )}

      {/* Sidebar Putih Bersih & Elegan (z-30 agar ikut buram saat dialog konfirmasi muncul) */}
      <aside
        className={`fixed inset-y-0 left-0 z-30 flex flex-col border-r border-slate-200/80 bg-white text-slate-800 shadow-[4px_0_24px_-12px_rgba(15,23,42,0.08)] transition-[width,transform] duration-300 ease-out lg:translate-x-0 ${
          collapsed ? 'w-[80px]' : 'w-[258px]'
        } ${mobileOpen ? 'z-40 translate-x-0' : '-translate-x-full'}`}
      >
        {/* Brand Header */}
        <div
          className={`relative flex shrink-0 flex-col items-center justify-center border-b border-slate-100 transition-all duration-300 ${
            collapsed ? 'min-h-[84px] px-2 py-3.5' : 'px-4 pt-4 pb-4'
          }`}
        >
          <div className="group/logo relative flex items-center justify-center">
            <img
              src="/images/1c215666-6304-4002-9783-57c9852cacd7_removalai_preview.png"
              alt="ASMARA Logo"
              className={`shrink-0 object-contain transition-transform duration-300 group-hover/logo:scale-105 ${
                collapsed ? 'h-12 w-12' : 'h-[176px] w-[176px]'
              }`}
            />
          </div>

          {!collapsed && (
            <div className="-mt-6 text-center">
              <p className="text-lg font-bold leading-tight tracking-wider text-slate-900">
                ASMARA
              </p>
              <p className="mt-0.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-teal-700">
                Asset Management Sarana
              </p>
            </div>
          )}

          {/* Tombol tutup khusus Mobile */}
          <button
            type="button"
            onClick={onCloseMobile}
            className="absolute right-3 top-3 rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 lg:hidden"
            aria-label="Tutup sidebar"
          >
            <X size={18} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="sidebar-scroll flex-1 space-y-6 overflow-y-auto px-3 py-6">
          {visibleNavigation.length > 0 && (
            <div>
              {!collapsed ? (
                <p className="mb-2.5 px-3.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                  Workspace
                </p>
              ) : (
                <div className="mx-auto mb-3 h-px w-6 bg-slate-200" />
              )}

              <div className="space-y-1">{renderLinks(visibleNavigation)}</div>
            </div>
          )}

          {visibleManagement.length > 0 && (
            <div>
              {!collapsed ? (
                <p className="mb-2.5 px-3.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                  Management
                </p>
              ) : (
                <div className="mx-auto mb-3 h-px w-6 bg-slate-200" />
              )}

              <div className="space-y-1">{renderLinks(visibleManagement)}</div>
            </div>
          )}
        </nav>

        {/* Sidebar Footer */}
        <div className="border-t border-slate-100 bg-slate-50/60 p-3">
          <button
            type="button"
            onClick={onToggle}
            aria-label={collapsed ? 'Perluas sidebar' : 'Perkecil sidebar'}
            className={`group hidden w-full items-center rounded-xl border border-slate-200/80 bg-white py-2 text-xs font-medium text-slate-600 shadow-2xs transition-all duration-150 hover:border-slate-300 hover:text-slate-900 active:scale-[0.99] lg:flex ${
              collapsed ? 'justify-center px-0' : 'justify-between px-3.5'
            }`}
          >
            {collapsed ? (
              <PanelLeftOpen
                size={17}
                className="transition-transform duration-200 group-hover:scale-110"
              />
            ) : (
              <>
                <span>Collapse sidebar</span>
                <PanelLeftClose
                  size={16}
                  className="text-slate-400 transition-transform duration-200 group-hover:-translate-x-0.5 group-hover:text-slate-700"
                />
              </>
            )}
          </button>

          {!collapsed && (
            <div className="mt-2.5 flex items-center justify-between px-2 text-[10px] text-slate-400">
              <span>ASMARA Web</span>
              <span className="rounded-md bg-slate-200/70 px-1.5 py-0.5 font-mono text-slate-600">
                v1.0
              </span>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}

export default Sidebar;
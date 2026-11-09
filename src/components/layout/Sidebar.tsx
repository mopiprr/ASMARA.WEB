import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  ClipboardList,
  Wrench,
  Package,
  Boxes,
  Users,
  Settings,
  ChevronLeft,
  ChevronRight,
  X,
} from 'lucide-react';

type SidebarProps = {
  collapsed: boolean;
  onToggle: () => void;
  mobileOpen: boolean;
  onCloseMobile: () => void;
};

const navigation = [
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
  },
  {
    label: 'Asset Management',
    path: '/assets',
    icon: Boxes,
  },
];

const management = [
  {
    label: 'Employees',
    path: '/employees',
    icon: Users,
  },
  {
    label: 'Settings',
    path: '/settings',
    icon: Settings,
  },
];

function Sidebar({
  collapsed,
  onToggle,
  mobileOpen,
  onCloseMobile,
}: SidebarProps) {
  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition-colors ${
      isActive
        ? 'bg-blue-600 text-white shadow-lg shadow-blue-950/20'
        : 'text-slate-400 hover:bg-slate-800 hover:text-white'
    }`;

  const renderLinks = (items: typeof navigation) =>
    items.map(({ label, path, icon: Icon }) => (
      <NavLink
        key={path}
        to={path}
        end={path === '/dashboard'}
        className={linkClass}
        onClick={onCloseMobile}
        title={collapsed ? label : undefined}
      >
        <Icon size={19} className="shrink-0" />

        {!collapsed && <span>{label}</span>}
      </NavLink>
    ));

  return (
    <>
      {/* Mobile Overlay */}
      {mobileOpen && (
        <button
          type="button"
          aria-label="Tutup menu"
          onClick={onCloseMobile}
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex flex-col border-r border-slate-800 bg-slate-950 text-white transition-all duration-300 lg:translate-x-0 ${
          collapsed ? 'w-[84px]' : 'w-[260px]'
        } ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Logo */}
        <div className="flex min-h-[155px] shrink-0 flex-col items-center justify-center gap-2 border-b border-slate-800 px-3 py-5">
        <img
            src="/images/asmara-logo.png"
            alt="ASMARA Logo"
            className={`shrink-0 object-contain ${
                collapsed ? 'h-12 w-12' : 'h-[120px] w-[120px]'
            }`}
        />

        {!collapsed && (
            <div className="text-center">
            <p className="text-xl font-bold tracking-wide">
                ASMARA
            </p>

            <p className="text-[11px] tracking-[0.2em] text-slate-300">
                ASSET MANAGEMENT
            </p>

            <p className="text-[11px] tracking-[0.2em] text-slate-300">
                SARANA
            </p>
            </div>
        )}

        <button
            type="button"
            onClick={onCloseMobile}
            className="absolute right-3 top-3 rounded-lg p-1 text-slate-400 hover:bg-slate-800 lg:hidden"
            aria-label="Tutup sidebar"
        >
            <X size={20} />
        </button>
        </div>

        {/* Navigation */}
        <nav className="sidebar-scroll flex-1 space-y-7 overflow-y-auto px-3 py-7">
          <div>
            {!collapsed && (
              <p className="mb-3 px-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                Workspace
              </p>
            )}

            <div className="space-y-1">
              {renderLinks(navigation)}
            </div>
          </div>

          <div>
            {!collapsed && (
              <p className="mb-3 px-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                Management
              </p>
            )}

            <div className="space-y-1">
              {renderLinks(management)}
            </div>
          </div>
        </nav>

        {/* Sidebar Footer */}
        <div className="border-t border-slate-800 p-3">
          <button
            type="button"
            onClick={onToggle}
            className="hidden w-full items-center justify-center gap-2 rounded-xl px-3 py-3 text-sm text-slate-400 transition hover:bg-slate-800 hover:text-white lg:flex"
          >
            {collapsed ? (
              <ChevronRight size={18} />
            ) : (
              <>
                <ChevronLeft size={18} />
                <span>Collapse sidebar</span>
              </>
            )}
          </button>

          {!collapsed && (
            <p className="px-3 pb-2 text-[10px] text-slate-600">
              ASMARA Web • v1.0
            </p>
          )}
        </div>
      </aside>
    </>
  );
}

export default Sidebar;
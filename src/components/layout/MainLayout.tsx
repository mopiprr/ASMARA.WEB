import { useState } from 'react';
import { Outlet } from 'react-router-dom';

import Sidebar from './Sidebar';
import Topbar from './Topbar';

// Motif Minimalis Plus (+) & Titik (•) Biru-Teal (Simpel, bersih, namun tetap terlihat jelas)
const MINIMAL_PLUS_DOT_PATTERN = `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none'%3E%3C!-- Tanda Plus (+) Halus di Pusat Tile --%3E%3Cpath d='M20 17V23M17 20H23' stroke='%230d9488' stroke-width='1.2' stroke-linecap='round' stroke-opacity='0.22'/%3E%3C!-- Titik Kecil di Sudut --%3E%3Ccircle cx='0' cy='0' r='1.2' fill='%231d4ed8' fill-opacity='0.22'/%3E%3Ccircle cx='40' cy='0' r='1.2' fill='%231d4ed8' fill-opacity='0.22'/%3E%3Ccircle cx='0' cy='40' r='1.2' fill='%231d4ed8' fill-opacity='0.22'/%3E%3Ccircle cx='40' cy='40' r='1.2' fill='%231d4ed8' fill-opacity='0.22'/%3E%3C/g%3E%3C/svg%3E")`;

function MainLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleToggleSidebar = () => {
    setCollapsed((prev) => !prev);
  };

  const handleOpenMobileSidebar = () => {
    setMobileOpen(true);
  };

  const handleCloseMobileSidebar = () => {
    setMobileOpen(false);
  };

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-[#f8fafc]">
      {/* BACKGROUND LAYER: Soft Brand Wash + Minimalist Plus & Dot Pattern */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-0 overflow-hidden"
      >
        {/* 1. Ambient Brand Gradient Wash */}
        <div
          className="absolute inset-x-0 top-0 h-[460px]"
          style={{
            background:
              'radial-gradient(ellipse 80% 60% at 55% -10%, rgba(29, 78, 216, 0.06), rgba(13, 148, 136, 0.05) 50%, transparent 100%)',
          }}
        />

        {/* 2. Pola Plus & Titik Minimalis */}
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: MINIMAL_PLUS_DOT_PATTERN,
            backgroundSize: '40px 40px',
            backgroundPosition: 'center top',
            maskImage:
              'linear-gradient(to bottom, black 0%, rgba(0,0,0,0.7) 65%, rgba(0,0,0,0.2) 100%)',
            WebkitMaskImage:
              'linear-gradient(to bottom, black 0%, rgba(0,0,0,0.7) 65%, rgba(0,0,0,0.2) 100%)',
          }}
        />
      </div>

      {/* Sidebar */}
      <Sidebar
        collapsed={collapsed}
        onToggle={handleToggleSidebar}
        mobileOpen={mobileOpen}
        onCloseMobile={handleCloseMobileSidebar}
      />

      {/* Main Content */}
      <div
        className={`relative z-10 min-h-screen transition-[margin] duration-300 ${
          collapsed ? 'lg:ml-[84px]' : 'lg:ml-[260px]'
        }`}
      >
        {/* Topbar dengan Subtle Gradient Divider */}
        <div className="relative">
          <Topbar onOpenSidebar={handleOpenMobileSidebar} />
          <div
            aria-hidden="true"
            className="h-[1px] w-full bg-gradient-to-r from-transparent via-blue-500/20 to-transparent"
          />
        </div>

        {/* Page Content */}
        <main className="min-h-[calc(100vh-80px)] p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default MainLayout;
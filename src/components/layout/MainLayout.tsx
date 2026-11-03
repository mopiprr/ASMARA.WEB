import { useState } from 'react';
import { Outlet } from 'react-router-dom';

import Sidebar from './Sidebar';
import Topbar from './Topbar';

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
    <div className="min-h-screen bg-slate-50">
      {/* Sidebar */}
      <Sidebar
        collapsed={collapsed}
        onToggle={handleToggleSidebar}
        mobileOpen={mobileOpen}
        onCloseMobile={handleCloseMobileSidebar}
      />

      {/* Main Content */}
      <div
        className={`min-h-screen transition-[margin] duration-300 ${
          collapsed ? 'lg:ml-[84px]' : 'lg:ml-[260px]'
        }`}
      >
        {/* Topbar */}
        <Topbar onOpenSidebar={handleOpenMobileSidebar} />

        {/* Page Content */}
        <main className="min-h-[calc(100vh-80px)] p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default MainLayout;
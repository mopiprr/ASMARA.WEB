import { Navigate, Outlet } from 'react-router-dom';

import { isAdmin } from '../../utils/auth';

// Penjaga halaman yang TIDAK boleh dibuka Admin (Dashboard, Procurement, Maintenance, dll.).
// Admin hanya mengelola Employee, jadi langsung diarahkan ke /employees.
function AdminRestrictedRoute() {
  if (isAdmin()) {
    return <Navigate to="/employees" replace />;
  }

  return <Outlet />;
}

export default AdminRestrictedRoute;
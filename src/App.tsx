import { Suspense, lazy } from 'react';
import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
} from 'react-router-dom';

import GuestRoute from './components/auth/GuestRoute';
import ProtectedRoute from './components/auth/ProtectedRoute';
import MainLayout from './components/layout/MainLayout';

const LoginPage = lazy(() => import('./features/auth/pages/LoginPage'));
const DashboardPage = lazy(() => import('./features/dashboard/pages/DashboardPage'));
const MyProfilePage = lazy(() => import('./features/profile/pages/MyProfilePage'));
const SettingsPage = lazy(() => import('./features/settings/pages/SettingsPage'));
const ProcurementPage = lazy(() => import('./features/procurement/pages/ProcurementPage'));
const AssetManagementPage = lazy(() => import('./features/assets/pages/AssetManagementPage'));
const FinancePage = lazy(() => import('./features/finance/pages/FinancePage'));
const MaintenanceDashboard = lazy(() => import('./features/maintenance/pages/MaintenanceDashboard'));
const InventoryPage = lazy(() => import('./features/inventory/pages/InventoryPage'));
const EmployeeManagementPage = lazy(() => import('./features/employees/pages/EmployeeManagementPage'));

function PageLoader() {
  return (
    <div className="flex min-h-[40vh] items-center justify-center p-8">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          {/* Login Page (kalau sudah login -> ke dashboard) */}
          <Route element={<GuestRoute />}>
            <Route path="/" element={<LoginPage />} />
          </Route>

          {/* Main Application (wajib login) */}
          <Route element={<ProtectedRoute />}>
            <Route element={<MainLayout />}>
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/profile" element={<MyProfilePage />} />
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="/procurement" element={<ProcurementPage />} />
              <Route path="/assets" element={<AssetManagementPage />} />
              <Route path="/finance" element={<FinancePage />} />
              <Route path="/maintenance" element={<MaintenanceDashboard />} />
              <Route path="/inventory" element={<InventoryPage />} />
              <Route path="/employees" element={<EmployeeManagementPage />} />
            </Route>
          </Route>

          {/* Redirect unknown routes */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

export default App;

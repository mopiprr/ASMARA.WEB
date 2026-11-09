import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
} from 'react-router-dom';

import LoginPage from './features/auth/pages/LoginPage';
import MainLayout from './components/layout/MainLayout';
import DashboardPage from './features/dashboard/pages/DashboardPage';
import MyProfilePage from './features/profile/pages/MyProfilePage';
import SettingsPage from './features/settings/pages/SettingsPage';
import ProcurementPage from './features/procurement/pages/ProcurementPage';
import AssetManagementPage from './features/assets/pages/AssetManagementPage';
import MaintenanceDashboard from './features/maintenance/pages/MaintenanceDashboard';
import InventoryPage from './features/inventory/pages/InventoryPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Login Page */}
        <Route path="/" element={<LoginPage />} />

        {/* Main Application */}
        <Route element={<MainLayout />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/profile" element={<MyProfilePage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/procurement" element={<ProcurementPage />} />
          <Route path="/assets" element={<AssetManagementPage />} />
          <Route path="/maintenance" element={<MaintenanceDashboard />} />
          <Route path="/inventory" element={<InventoryPage />} />
        </Route>

        {/* Redirect unknown routes */}
        <Route
          path="*"
          element={<Navigate to="/" replace />}
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

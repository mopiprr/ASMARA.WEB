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

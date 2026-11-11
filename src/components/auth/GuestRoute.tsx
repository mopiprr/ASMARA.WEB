import { useEffect, useState } from 'react';
import { Navigate, Outlet } from 'react-router-dom';

import AuthLoader from './AuthLoader';

import {
  canTryRefresh,
  hasSession,
  refreshSession,
} from '../../services/authSession';

type SessionStatus = 'checking' | 'authenticated' | 'guest';

// Penjaga halaman login: kalau sudah login, langsung ke dashboard.
// Termasuk saat browser dibuka lagi dan cookie Remember me masih berlaku.
function GuestRoute() {
  const [status, setStatus] = useState<SessionStatus>(() => {
    if (hasSession()) return 'authenticated';

    // Baru logout / sesi habis di tab ini -> langsung guest, tanpa panggil refresh.
    return canTryRefresh() ? 'checking' : 'guest';
  });

  useEffect(() => {
    if (status !== 'checking') return;

    let cancelled = false;

    void refreshSession().then((ok) => {
      if (!cancelled) {
        setStatus(ok ? 'authenticated' : 'guest');
      }
    });

    return () => {
      cancelled = true;
    };
  }, [status]);

  if (status === 'checking') {
    return <AuthLoader />;
  }

  if (status === 'authenticated') {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}

export default GuestRoute;
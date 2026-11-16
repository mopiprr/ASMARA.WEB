import { useEffect, useState } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';

import AuthLoader from './AuthLoader';

import {
  canTryRefresh,
  hasSession,
  refreshSession,
} from '../../services/authSession';

type SessionStatus = 'checking' | 'authenticated' | 'guest';

// Penjaga halaman yang wajib login.
// - Ada access token di tab ini -> lanjut.
// - Tidak ada -> coba refresh dari cookie (Remember me / tab baru).
// - Gagal -> lempar ke halaman login.
function ProtectedRoute() {
  const location = useLocation();

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

  // Logout / sesi dibersihkan -> kembali ke login.
  useEffect(() => {
    const handleAuthChanged = () => {
      if (!hasSession()) {
        setStatus('guest');
      }
    };

    window.addEventListener('auth-changed', handleAuthChanged);

    return () => window.removeEventListener('auth-changed', handleAuthChanged);
  }, []);

  if (status === 'checking') {
    return <AuthLoader />;
  }

  if (status === 'guest') {
    return <Navigate to="/" replace state={{ from: location }} />;
  }

  return <Outlet />;
}

export default ProtectedRoute;
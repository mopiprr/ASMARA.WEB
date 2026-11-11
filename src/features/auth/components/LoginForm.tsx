import { useState, type FormEvent } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import {
  Eye,
  EyeOff,
  LockKeyhole,
  UserRound,
} from 'lucide-react';

import { login } from '../../../services/authSession';

// Hanya terima path internal (cegah redirect ke situs lain).
function getSafeRedirect(path: string | null | undefined) {
  if (!path || !path.startsWith('/') || path.startsWith('//') || path === '/') {
    return '/dashboard';
  }

  return path;
}

function LoginForm() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  // Halaman asal: dari ProtectedRoute (state) atau dari interceptor (?from=).
  const fromState = (location.state as { from?: { pathname: string; search?: string } } | null)?.from;
  const redirectTo = getSafeRedirect(
    fromState
      ? fromState.pathname + (fromState.search ?? '')
      : searchParams.get('from')
  );

  const isSessionExpired = searchParams.get('expired') === '1';

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setErrorMessage('');
    setIsLoading(true);

    try {
      // Backend menyimpan refresh token di cookie:
      // Remember me -> cookie 60 menit, tidak -> hilang saat browser ditutup.
      await login(username.trim(), password, rememberMe);

      navigate(redirectTo, { replace: true });
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (!error.response) {
          setErrorMessage(
            'Tidak dapat terhubung ke server. Pastikan backend ASMARA sedang berjalan.'
          );
        } else {
          const data = error.response.data as
            | { detail?: string; title?: string; message?: string }
            | undefined;

          setErrorMessage(
            data?.detail ||
              data?.message ||
              data?.title ||
              'Username atau password tidak valid.'
          );
        }
      } else {
        setErrorMessage('Terjadi kesalahan saat login.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">

      {/* USERNAME */}
      <div>
        <label className="mb-2 block text-sm font-semibold text-gray-700">
          Username
        </label>

        <div className="relative">
          <UserRound className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />

          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Masukkan username"
            required
            autoComplete="username"
            className="w-full rounded-xl border border-gray-200 bg-gray-50 py-3.5 pl-12 pr-4 text-sm outline-none transition focus:border-blue-600 focus:bg-white focus:ring-2 focus:ring-blue-100"
          />
        </div>
      </div>

      {/* PASSWORD */}
      <div>
        <label className="mb-2 block text-sm font-semibold text-gray-700">
          Password
        </label>

        <div className="relative">
          <LockKeyhole className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />

          <input
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Masukkan password"
            required
            autoComplete="current-password"
            className="w-full rounded-xl border border-gray-200 bg-gray-50 py-3.5 pl-12 pr-12 text-sm outline-none transition focus:border-blue-600 focus:bg-white focus:ring-2 focus:ring-blue-100"
          />

          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 transition-colors hover:text-gray-600"
            aria-label={
              showPassword
                ? 'Sembunyikan password'
                : 'Tampilkan password'
            }
          >
            {showPassword ? (
              <EyeOff className="h-5 w-5" />
            ) : (
              <Eye className="h-5 w-5" />
            )}
          </button>
        </div>
      </div>

      {/* SESSION EXPIRED */}
      {isSessionExpired && !errorMessage && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
          Sesi Anda telah berakhir. Silakan login kembali.
        </div>
      )}

      {/* ERROR MESSAGE */}
      {errorMessage && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {errorMessage}
        </div>
      )}

      {/* REMEMBER ME */}
      <div className="flex items-center justify-between">
        <label className="flex cursor-pointer items-center gap-2 text-sm text-gray-600">
          <input
            type="checkbox"
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
            className="h-4 w-4 accent-blue-600"
          />
          Remember me
        </label>
      </div>

      {/* LOGIN BUTTON */}
      <button
        type="submit"
        disabled={isLoading}
        className="w-full rounded-xl bg-blue-700 py-3.5 font-semibold text-white shadow-lg shadow-blue-700/20 transition hover:bg-blue-800 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isLoading ? 'Signing in...' : 'Login'}
      </button>

    </form>
  );
}

export default LoginForm;

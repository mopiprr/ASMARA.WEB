import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type FormEvent,
} from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import {
  Check,
  Eye,
  EyeOff,
  LoaderCircle,
  LockKeyhole,
  ShieldCheck,
  UserRound,
} from 'lucide-react';

import { login } from '../../../services/authSession';
import { getHomePath } from '../../../utils/auth';

type LoginStep = 'credentials' | 'success';
type LoginStatus = 'idle' | 'verifying' | 'error';

type LoginFormProps = {
  onLoginSuccess?: (username: string) => void;
  onActiveStateChange?: (isActive: boolean) => void;
};

function getSafeRedirect(path: string | null | undefined) {
  if (!path || !path.startsWith('/') || path.startsWith('//') || path === '/') {
    return null;
  }

  return path;
}

const EASE = 'cubic-bezier(.22, 1, .36, 1)';

function LoginForm({ onLoginSuccess, onActiveStateChange }: LoginFormProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  const fromState = (
    location.state as { from?: { pathname: string; search?: string } } | null
  )?.from;
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

  const [step, setStep] = useState<LoginStep>('credentials');
  const [status, setStatus] = useState<LoginStatus>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [reduced, setReduced] = useState(false);

  const rootRef = useRef<HTMLDivElement | null>(null);
  const busy = status === 'verifying';
  const failed = status === 'error' || Boolean(errorMessage);

  // Beritahu LoginPage agar panel tetap terbuka saat ada input, loading, error, atau sukses
  const isFormActive = Boolean(
    username ||
      password ||
      errorMessage ||
      isSessionExpired ||
      busy ||
      step === 'success'
  );

  useEffect(() => {
    onActiveStateChange?.(isFormActive);
  }, [isFormActive, onActiveStateChange]);

  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setReduced(media.matches);
    update();
    media.addEventListener('change', update);
    return () => media.removeEventListener('change', update);
  }, []);

  // Animasi transisi ke layar sukses & stamp
  useLayoutEffect(() => {
    if (reduced || !rootRef.current) return;
    const animations: Animation[] = [];

    const body = rootRef.current.querySelector('[data-step-body]');
    if (body && step === 'success') {
      animations.push(
        body.animate(
          [
            { opacity: 0, transform: 'translateY(10px)' },
            { opacity: 1, transform: 'translateY(0)' },
          ],
          { duration: 320, easing: EASE }
        )
      );
    }

    const stamp = rootRef.current.querySelector('[data-success-stamp]');
    if (stamp && step === 'success') {
      animations.push(
        stamp.animate(
          [
            { opacity: 0, transform: 'scale(1.35) rotate(-16deg)' },
            { opacity: 1, transform: 'scale(0.94) rotate(3deg)', offset: 0.7 },
            { opacity: 1, transform: 'scale(1) rotate(0deg)' },
          ],
          { duration: 520, easing: EASE }
        )
      );
    }

    return () => animations.forEach((a) => a.cancel());
  }, [step, reduced]);

  // Animasi getar (shake) saat gagal login
  useLayoutEffect(() => {
    if (reduced || !failed || step !== 'credentials') return;
    const fields = rootRef.current?.querySelector('[data-form-fields]');
    const anim = fields?.animate(
      [
        { transform: 'translateX(0)' },
        { transform: 'translateX(-6px)' },
        { transform: 'translateX(6px)' },
        { transform: 'translateX(-4px)' },
        { transform: 'translateX(0)' },
      ],
      { duration: 420, easing: 'ease-in-out' }
    );
    return () => anim?.cancel();
  }, [failed, errorMessage, step, reduced]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (busy || step === 'success') return;

    setErrorMessage('');
    setStatus('verifying');

    try {
      const cleanUsername = username.trim();
      await login(cleanUsername, password, rememberMe);

      setStatus('idle');
      setStep('success');
      onLoginSuccess?.(cleanUsername);

      const targetPath = redirectTo ?? getHomePath();
      window.setTimeout(() => {
        navigate(targetPath, { replace: true });
      }, 1500);
    } catch (error) {
      setStatus('error');
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
    }
  };

  const currentStepIndex = step === 'success' ? 2 : busy ? 1 : 0;

  return (
    <div ref={rootRef} className="w-full">
      <style>{`
        @keyframes dashboard-progress {
          0% {
            width: 0%;
          }
          100% {
            width: 100%;
          }
        }
        .animate-dashboard-progress {
          animation: dashboard-progress 1.45s cubic-bezier(.22, 1, .36, 1) forwards;
        }
      `}</style>

      <div data-step-body key={step}>
        {step === 'credentials' ? (
          <form
            data-form-fields
            aria-busy={busy}
            onSubmit={handleSubmit}
            className="space-y-4"
          >
            {/* USERNAME */}
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-600">
                Username
              </label>
              <div className="relative">
                <UserRound className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => {
                    setUsername(e.target.value);
                    if (errorMessage) setErrorMessage('');
                    if (status === 'error') setStatus('idle');
                  }}
                  placeholder="input username"
                  required
                  disabled={busy}
                  autoComplete="username"
                  className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50/80 pl-10 pr-4 text-sm text-slate-800 outline-none transition focus:border-blue-600 focus:bg-white focus:ring-2 focus:ring-blue-100 disabled:opacity-60"
                />
              </div>
            </div>

            {/* PASSWORD */}
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-600">
                Password
              </label>
              <div className="relative">
                <LockKeyhole className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (errorMessage) setErrorMessage('');
                    if (status === 'error') setStatus('idle');
                  }}
                  placeholder="input password"
                  required
                  disabled={busy}
                  autoComplete="current-password"
                  className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50/80 pl-10 pr-11 text-sm text-slate-800 outline-none transition focus:border-blue-600 focus:bg-white focus:ring-2 focus:ring-blue-100 disabled:opacity-60"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={busy}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 transition-colors hover:text-slate-600"
                  aria-label={
                    showPassword ? 'Sembunyikan password' : 'Tampilkan password'
                  }
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            {/* SESSION EXPIRED */}
            {isSessionExpired && !errorMessage && (
              <div className="rounded-xl border border-amber-200 bg-amber-50 px-3.5 py-2 text-xs text-amber-700">
                Sesi Anda telah berakhir. Silakan login kembali.
              </div>
            )}

            {/* ERROR MESSAGE */}
            {errorMessage && (
              <div
                role="alert"
                className="rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-2 text-xs font-medium text-rose-600"
              >
                {errorMessage}
              </div>
            )}

            {/* REMEMBER ME */}
            <div className="flex items-center justify-between pt-0.5">
              <label className="flex cursor-pointer items-center gap-2 text-xs font-medium text-slate-600">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  disabled={busy}
                  className="h-4 w-4 rounded accent-blue-700"
                />
                Remember me
              </label>
            </div>

            {/* SUBMIT BUTTON DENGAN ANIMASI LOADING */}
            <button
              type="submit"
              disabled={busy}
              className="relative flex h-11 w-full items-center justify-center gap-2 overflow-hidden rounded-xl bg-gradient-to-r from-blue-700 to-teal-600 text-sm font-semibold text-white shadow-lg shadow-blue-700/20 transition-all hover:from-blue-800 hover:to-teal-700 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-85"
            >
              {busy ? (
                <>
                  <LoaderCircle
                    aria-hidden="true"
                    className="size-4 animate-spin"
                  />
                  <span>Memverifikasi kredensial...</span>
                </>
              ) : (
                <span>Login</span>
              )}
            </button>
          </form>
        ) : (
          /* SUCCESS & LOADING TRANSITION KE DASHBOARD */
          <div className="flex flex-col items-center justify-center py-4 text-center">
            <div
              data-success-stamp
              aria-hidden="true"
              className="mb-4 flex size-[72px] items-center justify-center rounded-full border border-teal-200 bg-gradient-to-br from-blue-600 to-teal-500 text-white shadow-lg shadow-teal-500/25 ring-8 ring-teal-500/10"
            >
              <Check className="size-9" strokeWidth={2.3} />
            </div>

            <h3 className="text-xl font-bold tracking-tight text-slate-900">
              You&apos;re in!
            </h3>
            <p className="mt-1 text-xs text-slate-500">
              Selamat datang kembali,{' '}
              <span className="font-semibold text-slate-800">{username}</span>
            </p>

            {/* Progress Bar Loading Masuk Dashboard */}
            <div className="mt-5 w-full max-w-[260px]">
              <div className="mb-2 flex items-center justify-center gap-1.5 text-[11px] font-medium text-slate-600">
                <LoaderCircle className="size-3.5 animate-spin text-blue-600" />
                <span>Menyiapkan ruang kerja Dashboard...</span>
              </div>

              <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
                <div className="animate-dashboard-progress h-full rounded-full bg-gradient-to-r from-blue-600 to-teal-500" />
              </div>
            </div>

            <span className="mt-4 inline-flex items-center gap-1.5 rounded-full border border-slate-200/80 bg-slate-50 px-3 py-1 text-[10px] font-medium text-slate-500">
              <ShieldCheck
                className="size-3.5 text-teal-600"
                aria-hidden="true"
              />
              Sesi terenkripsi aktif
            </span>
          </div>
        )}
      </div>

      {/* Stepper Progress Indicator */}
      <ol
        aria-label="Sign-in progress"
        className="mt-6 flex items-center justify-center gap-4 border-t border-slate-100 pt-4"
      >
        {(['Credentials', 'Verify', "You're in"] as const).map(
          (label, index) => {
            const active = currentStepIndex === index;
            const done = index < currentStepIndex;
            return (
              <li
                key={label}
                aria-current={active ? 'step' : undefined}
                className={`flex items-center gap-1.5 text-[11px] font-medium ${
                  active || done ? 'text-slate-800' : 'text-slate-400'
                }`}
              >
                <span
                  className={`flex size-4 items-center justify-center rounded-full text-[9px] font-semibold transition-colors ${
                    active
                      ? 'bg-teal-600 text-white'
                      : done
                        ? 'bg-blue-700 text-white'
                        : 'bg-slate-200 text-slate-500'
                  }`}
                >
                  {done ? (
                    <Check className="size-2.5" aria-hidden="true" />
                  ) : (
                    index + 1
                  )}
                </span>
                {label}
              </li>
            );
          }
        )}
      </ol>
    </div>
  );
}

export default LoginForm;
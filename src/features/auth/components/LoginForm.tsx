import { useEffect, useLayoutEffect, useRef, useState, type FormEvent } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import {
  Check,
  Eye,
  EyeOff,
  LoaderCircle,
  LockKeyhole,
  LogIn,
  ShieldCheck,
  UserRound,
} from 'lucide-react';

import { login } from '../../../services/authSession';
import { getHomePath } from '../../../utils/auth';

type LoginStep = 'credentials' | 'success';
type LoginStatus = 'idle' | 'verifying' | 'error';

type LoginFormProps = {
  onLoginSuccess?: (username: string) => void;
};

// Hanya terima path internal (cegah redirect ke situs lain).
function getSafeRedirect(path: string | null | undefined) {
  if (!path || !path.startsWith('/') || path.startsWith('//') || path === '/') {
    return null;
  }

  return path;
}

const EASE = 'cubic-bezier(.22, 1, .36, 1)';

function LoginForm({ onLoginSuccess }: LoginFormProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  // Halaman asal: dari ProtectedRoute (state) atau dari interceptor (?from=).
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

  // Tetap terbuka otomatis jika sedang diisi, loading, error, atau sukses
  const forceExpanded = Boolean(
    username ||
      password ||
      errorMessage ||
      isSessionExpired ||
      busy ||
      step === 'success'
  );

  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setReduced(media.matches);
    update();
    media.addEventListener('change', update);
    return () => media.removeEventListener('change', update);
  }, []);

  // Animasi perpindahan step & stamp sukses
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

  // Animasi getar (shake) saat login gagal
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
      }, 1350);
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
    <>
      <style>{`
        @keyframes spin-border-dual {
          0% {
            transform: translate(-50%, -50%) rotate(0deg);
          }
          100% {
            transform: translate(-50%, -50%) rotate(360deg);
          }
        }
        .animate-border-dual {
          animation: spin-border-dual 4.5s linear infinite;
        }
      `}</style>

      {/* Outer Wrapper dengan Efek Dual-Color Rotating Border */}
      <div
        ref={rootRef}
        className={`group/login relative mx-auto w-full overflow-hidden rounded-[28px] p-[2px] shadow-[0_18px_40px_-15px_rgba(15,23,42,0.14)] transition-all duration-500 ease-out ${
          forceExpanded
            ? 'max-w-[430px]'
            : 'max-w-[300px] hover:max-w-[430px] focus-within:max-w-[430px]'
        }`}
      >
        {/* Border Animasi 2 Warna */}
        <div
          aria-hidden="true"
          className="animate-border-dual pointer-events-none absolute left-1/2 top-1/2 h-[220%] w-[220%] opacity-85 transition-opacity duration-500 group-hover/login:opacity-100"
          style={{
            background:
              'conic-gradient(from 0deg, transparent 0deg, #1d4ed8 65deg, #0d9488 130deg, transparent 180deg, transparent 200deg, #0ea5e9 265deg, #10b981 330deg, transparent 360deg)',
          }}
        />

        {/* Inner Card */}
        <div className="relative overflow-hidden rounded-[26px] bg-white text-slate-900">
          {/* Top Bar Kartu */}
          <div className="flex items-center justify-between gap-3 border-b border-slate-100 px-6 py-3.5">
            <span className="flex min-w-0 items-center gap-2.5 text-sm font-semibold">
              <span
                aria-hidden="true"
                className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-blue-700 to-teal-600 text-white shadow-xs"
              >
                <LogIn className="size-3.5" />
              </span>
              <span className="truncate text-slate-800">ASMARA Access</span>
            </span>

            <span className="shrink-0 rounded-full border border-slate-200 bg-slate-50 px-2.5 py-0.5 text-[10px] font-medium text-slate-500">
              {step === 'success'
                ? 'Verified'
                : forceExpanded
                  ? 'SSO / Account'
                  : 'Hover to Sign In'}
            </span>
          </div>

          {/* Expanding Body */}
          <div
            className={`grid transition-[grid-template-rows,opacity] duration-500 ease-out ${
              forceExpanded
                ? 'grid-rows-[1fr] opacity-100'
                : 'grid-rows-[0fr] opacity-0 group-hover/login:grid-rows-[1fr] group-hover/login:opacity-100 group-focus-within/login:grid-rows-[1fr] group-focus-within/login:opacity-100'
            }`}
          >
            <div className="overflow-hidden">
              <div data-step-body key={step} className="px-6 py-5 sm:px-7">
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
                          placeholder="Masukkan username"
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
                          placeholder="Masukkan password"
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
                            showPassword
                              ? 'Sembunyikan password'
                              : 'Tampilkan password'
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

                    {/* SUBMIT BUTTON */}
                    <button
                      type="submit"
                      disabled={busy}
                      className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-700 to-teal-600 text-sm font-semibold text-white shadow-lg shadow-blue-700/20 transition-all hover:from-blue-800 hover:to-teal-700 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-75"
                    >
                      {busy ? (
                        <>
                          <LoaderCircle
                            aria-hidden="true"
                            className="size-4 animate-spin"
                          />
                          <span>Memverifikasi akun...</span>
                        </>
                      ) : (
                        <span>Login</span>
                      )}
                    </button>
                  </form>
                ) : (
                  /* SUCCESS STAMP VIEW (Seperti referensi) */
                  <div className="flex min-h-[250px] flex-col items-center justify-center py-4 text-center">
                    <div
                      data-success-stamp
                      aria-hidden="true"
                      className="mb-5 flex size-[74px] items-center justify-center rounded-full border border-teal-200 bg-gradient-to-br from-blue-600 to-teal-500 text-white shadow-lg shadow-teal-500/25 ring-8 ring-teal-500/10"
                    >
                      <Check className="size-9" strokeWidth={2.2} />
                    </div>

                    <h3 className="text-2xl font-bold tracking-tight text-slate-900">
                      You&apos;re in
                    </h3>
                    <p className="mt-1.5 text-xs text-slate-500">
                      Selamat datang kembali,{' '}
                      <span className="font-semibold text-slate-700">
                        {username}
                      </span>
                    </p>

                    <span className="mt-4 inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-[11px] font-medium text-slate-600">
                      <ShieldCheck
                        className="size-3.5 text-teal-600"
                        aria-hidden="true"
                      />
                      Mengalihkan ke Dashboard...
                    </span>
                  </div>
                )}
              </div>

              {/* Stepper Progress Footer (Seperti referensi) */}
              <ol
                aria-label="Sign-in progress"
                className="flex items-center justify-center gap-4 border-t border-slate-100 bg-slate-50/60 px-6 py-2.5"
              >
                {(['Credentials', 'Verify', "You're in"] as const).map(
                  (label, index) => {
                    const active = currentStepIndex === index;
                    const done = index < currentStepIndex;
                    return (
                      <li
                        key={label}
                        aria-current={active ? 'step' : undefined}
                        className={`flex items-center gap-1.5 text-[10px] font-medium ${
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
          </div>
        </div>
      </div>
    </>
  );
}

export default LoginForm;
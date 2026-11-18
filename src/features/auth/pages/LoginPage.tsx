import { useState } from 'react';
import LoginForm from '../components/LoginForm';

function LoginPage() {
  const [isFormActive, setIsFormActive] = useState(false);

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gray-950 p-4 md:p-8">
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
          animation: spin-border-dual 5s linear infinite;
        }
      `}</style>

      {/* BACKGROUND */}
      <div
        className="absolute inset-0 scale-105"
        style={{
          backgroundImage: "url('/images/asmara-background.png')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }}
      />

      {/* OVERLAY */}
      <div className="absolute inset-0 bg-black/45 backdrop-blur-[2px]" />

      {/* FULL LOGIN PANEL (Satu Kotak Penuh dengan Hover Expand & Animated Border) */}
      <div
        className={`group/card relative z-10 w-full overflow-hidden rounded-[34px] p-[2px] shadow-[0_24px_60px_rgba(0,0,0,0.45)] transition-all duration-500 ease-out ${
          isFormActive
            ? 'max-w-[520px]'
            : 'max-w-[440px] hover:max-w-[520px] focus-within:max-w-[520px]'
        }`}
      >
        {/* Dual-Color Rotating Border */}
        <div
          aria-hidden="true"
          className="animate-border-dual pointer-events-none absolute left-1/2 top-1/2 h-[220%] w-[220%] opacity-80 transition-opacity duration-500 group-hover/card:opacity-100"
          style={{
            background:
              'conic-gradient(from 0deg, transparent 0deg, #1d4ed8 65deg, #0d9488 130deg, transparent 180deg, transparent 200deg, #0ea5e9 265deg, #10b981 330deg, transparent 360deg)',
          }}
        />

        {/* Inner Glassmorphic Surface */}
        <section className="relative rounded-[32px] bg-white/95 p-8 backdrop-blur-2xl sm:p-10">
          {/* LOGO */}
          <div className="mb-5 flex justify-center">
            <img
              src="/images/asmara-logo.png"
              alt="ASMARA - Assets Manajemen Sarana"
              className="h-auto w-60 object-contain drop-shadow-sm transition-transform duration-500 group-hover/card:scale-[1.02]"
            />
          </div>

          {/* HEADING */}
          <div className="text-center">
            <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">
              Welcome Back!
            </h1>

            <p className="mt-2.5 text-sm leading-relaxed text-gray-600">
              Please sign in using your corporate account
              <br />
              to access the ASMARA system.
            </p>

            {/* Indikator Hover sebelum form terbuka */}
            <div
              className={`mt-4 flex justify-center transition-all duration-300 ${
                isFormActive
                  ? 'pointer-events-none h-0 overflow-hidden opacity-0'
                  : 'h-7 opacity-100 group-hover/card:pointer-events-none group-hover/card:h-0 group-hover/card:overflow-hidden group-hover/card:opacity-0 group-focus-within/card:pointer-events-none group-focus-within/card:h-0 group-focus-within/card:overflow-hidden group-focus-within/card:opacity-0'
              }`}
            >
              <span className="inline-flex items-center gap-2 rounded-full border border-blue-200/80 bg-blue-50/80 px-3.5 py-1 text-xs font-semibold text-blue-700">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-teal-500" />
                Hover panel to sign in
              </span>
            </div>
          </div>

          {/* EXPANDING FORM AREA */}
          <div
            className={`grid transition-[grid-template-rows,opacity,margin] duration-500 ease-out ${
              isFormActive
                ? 'mt-7 grid-rows-[1fr] opacity-100'
                : 'mt-0 grid-rows-[0fr] opacity-0 group-hover/card:mt-7 group-hover/card:grid-rows-[1fr] group-hover/card:opacity-100 group-focus-within/card:mt-7 group-focus-within/card:grid-rows-[1fr] group-focus-within/card:opacity-100'
            }`}
          >
            <div className="overflow-hidden">
              <LoginForm onActiveStateChange={setIsFormActive} />
            </div>
          </div>

          {/* FOOTER */}
          <div className="mt-7 border-t border-gray-100 pt-5 text-center">
            <p className="text-sm font-semibold text-gray-700">
              ASMARA - Assets Manajemen Sarana
            </p>

            <p className="mt-1.5 text-xs text-gray-400">
              © {new Date().getFullYear()} Mitra Integrasi Informatika
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}

export default LoginPage;
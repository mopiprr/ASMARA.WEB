import {
  createContext,
  useCallback,
  useContext,
  useState,
  type ReactNode,
} from 'react';
import { AlertCircle, CheckCircle2, Info, X } from 'lucide-react';

type ToastVariant = 'success' | 'error' | 'info';

interface ToastItem {
  id: number;
  variant: ToastVariant;
  message: string;
}

interface ToastContextValue {
  showSuccess: (message: string) => void;
  showError: (message: string) => void;
  showInfo: (message: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

const VARIANT_STYLES: Record<
  ToastVariant,
  { container: string; icon: typeof CheckCircle2; iconClass: string }
> = {
  success: {
    container: 'border-emerald-200 bg-white text-slate-800',
    icon: CheckCircle2,
    iconClass: 'text-emerald-600',
  },
  error: {
    container: 'border-rose-200 bg-white text-slate-800',
    icon: AlertCircle,
    iconClass: 'text-rose-600',
  },
  info: {
    container: 'border-blue-200 bg-white text-slate-800',
    icon: Info,
    iconClass: 'text-blue-600',
  },
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const dismiss = useCallback((id: number) => {
    setToasts((current) => current.filter((item) => item.id !== id));
  }, []);

  const pushToast = useCallback(
    (variant: ToastVariant, message: string) => {
      const id = Date.now() + Math.floor(Math.random() * 1000);
      setToasts((current) => [...current.slice(-3), { id, variant, message }]);

      window.setTimeout(() => {
        dismiss(id);
      }, 3800);
    },
    [dismiss],
  );

  const showSuccess = useCallback(
    (message: string) => pushToast('success', message),
    [pushToast],
  );
  const showError = useCallback(
    (message: string) => pushToast('error', message),
    [pushToast],
  );
  const showInfo = useCallback(
    (message: string) => pushToast('info', message),
    [pushToast],
  );

  return (
    <ToastContext.Provider value={{ showSuccess, showError, showInfo }}>
      {children}

      {toasts.length > 0 && (
        <div
          aria-live="polite"
          className="pointer-events-none fixed right-4 top-4 z-[80] flex w-full max-w-sm flex-col gap-2.5"
        >
          {toasts.map((toast) => {
            const style = VARIANT_STYLES[toast.variant];
            const Icon = style.icon;

            return (
              <div
                key={toast.id}
                role="status"
                className={`pointer-events-auto flex items-start gap-3 rounded-xl border p-3.5 shadow-lg animate-in fade-in slide-in-from-top-2 duration-150 ${style.container}`}
              >
                <Icon size={18} className={`mt-0.5 shrink-0 ${style.iconClass}`} />
                <p className="flex-1 text-xs font-medium leading-relaxed">
                  {toast.message}
                </p>
                <button
                  type="button"
                  onClick={() => dismiss(toast.id)}
                  aria-label="Dismiss notification"
                  className="rounded p-0.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
                >
                  <X size={14} />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);

  if (!ctx) {
    throw new Error('useToast must be used within a ToastProvider');
  }

  return ctx;
}

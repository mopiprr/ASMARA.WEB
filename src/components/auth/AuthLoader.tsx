import { LoaderCircle } from 'lucide-react';

// Layar loading saat sesi sedang dicek.
function AuthLoader() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50">
      <div className="flex items-center gap-3 text-sm text-slate-500">
        <LoaderCircle size={20} className="animate-spin text-blue-600" />
        Checking your session...
      </div>
    </div>
  );
}

export default AuthLoader;
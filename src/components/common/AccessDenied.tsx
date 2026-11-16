import { ShieldAlert } from 'lucide-react';

interface AccessDeniedProps {
  message?: string;
}

// Tampilan standar saat user tidak punya akses ke sebuah halaman.
function AccessDenied({
  message = 'You do not have permission to access this page.',
}: AccessDeniedProps) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-sm">
      <ShieldAlert size={44} className="mx-auto text-slate-300" />

      <h2 className="mt-4 text-lg font-bold text-slate-800">
        Access denied
      </h2>

      <p className="mt-1 text-sm text-slate-500">
        {message}
      </p>
    </div>
  );
}

export default AccessDenied;
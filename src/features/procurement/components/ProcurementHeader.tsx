
import { Plus } from 'lucide-react';

interface ProcurementHeaderProps {
  onNewRequest: () => void;
}

function ProcurementHeader({
  onNewRequest,
}: ProcurementHeaderProps) {
  return (
    <section className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
      <div>
        <p className="text-sm font-medium text-blue-600">
          Workspace
        </p>

        <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-800 sm:text-3xl">
          Procurement
        </h1>

        <p className="mt-2 text-sm text-slate-500">
          Manage and monitor procurement requests.
        </p>
      </div>

      <button
        type="button"
        onClick={onNewRequest}
        className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
      >
        <Plus size={18} />
        New Request
      </button>
    </section>
  );
}

export default ProcurementHeader;

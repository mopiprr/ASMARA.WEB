import { RefreshCw } from 'lucide-react';

import type { MaintenanceHandlerOption } from '../../../types/maintenance.types';

import { detailInputClass } from '../../../../../components/common/NoteField';

interface AssignHandlerSectionProps {
  handlers: MaintenanceHandlerOption[];
  isLoading: boolean;
  error: string;
  onReload: () => void;
  selectedHandlerId: string;
  onSelect: (value: string) => void;
  isProcessing: boolean;
}

// IT Support memilih handler.
function AssignHandlerSection({
  handlers,
  isLoading,
  error,
  onReload,
  selectedHandlerId,
  onSelect,
  isProcessing,
}: AssignHandlerSectionProps) {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <label htmlFor="maintenance-handler" className="text-sm font-medium text-slate-700">
          Maintenance Handler <span className="text-red-500">*</span>
        </label>

        <button
          type="button"
          onClick={onReload}
          disabled={isLoading || isProcessing}
          className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 transition hover:text-blue-700 disabled:opacity-50"
        >
          <RefreshCw size={12} className={isLoading ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      <select
        id="maintenance-handler"
        value={selectedHandlerId}
        onChange={(event) => onSelect(event.target.value)}
        disabled={isLoading || isProcessing || handlers.length === 0}
        className={`${detailInputClass} bg-white`}
      >
        <option value="">
          {isLoading
            ? 'Loading maintenance handlers...'
            : handlers.length === 0
              ? 'No handlers available'
              : 'Select a maintenance handler'}
        </option>

        {handlers.map((handler) => (
          <option key={handler.employeeId} value={handler.employeeId}>
            {handler.fullName} ({handler.employeeNumber})
          </option>
        ))}
      </select>

      {error && <p className="mt-2 whitespace-pre-line text-xs text-red-600">{error}</p>}
    </div>
  );
}

export default AssignHandlerSection;
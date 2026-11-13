import {
  LoaderCircle,
  UserRoundCog,
} from 'lucide-react';

import type { MaintenanceHandlerOption } from '../../../types/maintenance.types';

interface AssignMaintenanceHandlerProps {
  handlers: MaintenanceHandlerOption[];
  selectedHandlerId: string;
  setSelectedHandlerId: (value: string) => void;
  isLoadingHandlers: boolean;
  isProcessing: boolean;
  handlerError: string | null;
  onRefreshHandlers: () => void;
  onAssignHandler: () => void;
}

function AssignMaintenanceHandler({
  handlers,
  selectedHandlerId,
  setSelectedHandlerId,
  isLoadingHandlers,
  isProcessing,
  handlerError,
  onRefreshHandlers,
  onAssignHandler,
}: AssignMaintenanceHandlerProps) {
  return (
    <div className="space-y-3 rounded-xl border border-slate-200 p-4">
      <div className="flex items-center gap-2">
        <UserRoundCog size={18} className="text-blue-600" />
        <h4 className="text-sm font-semibold text-slate-800">
          Assign Maintenance Handler
        </h4>
      </div>

      <div>
        <div className="mb-2 flex items-center justify-between">
          <label
            htmlFor="maintenanceHandler"
            className="text-sm font-medium text-slate-700"
          >
            Select Handler
          </label>

          <button
            type="button"
            onClick={onRefreshHandlers}
            disabled={isLoadingHandlers || isProcessing}
            className="text-xs font-medium text-blue-600 hover:text-blue-700 disabled:opacity-50"
          >
            {isLoadingHandlers ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>

        <select
          id="maintenanceHandler"
          value={selectedHandlerId}
          onChange={(event) =>
            setSelectedHandlerId(event.target.value)
          }
          disabled={
            isLoadingHandlers ||
            isProcessing ||
            handlers.length === 0
          }
          className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none focus:border-blue-500 disabled:bg-slate-100"
        >
          <option value="">
            {isLoadingHandlers
              ? 'Loading maintenance handlers...'
              : handlers.length === 0
                ? 'No handlers available'
                : 'Select a maintenance handler'}
          </option>

          {handlers.map((handler) => (
            <option
              key={handler.employeeId}
              value={handler.employeeId}
            >
              {handler.fullName} ({handler.employeeNumber})
            </option>
          ))}
        </select>

        {handlerError && (
          <p className="mt-2 text-xs text-red-600">
            {handlerError}
          </p>
        )}
      </div>

      <button
        type="button"
        onClick={onAssignHandler}
        disabled={
          isProcessing ||
          isLoadingHandlers ||
          !selectedHandlerId
        }
        className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
      >
        {isProcessing ? (
          <LoaderCircle size={17} className="animate-spin" />
        ) : (
          <UserRoundCog size={17} />
        )}
        Assign Handler
      </button>
    </div>
  );
}

export default AssignMaintenanceHandler;
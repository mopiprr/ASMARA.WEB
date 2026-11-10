import { useEffect, useState } from 'react';

import {
  X,
  UserPlus,
  AlertCircle,
  LoaderCircle,
} from 'lucide-react';

import type { AssetListItem } from '../types/asset.types';

import type { useAssignAsset } from '../hooks/useAssignAsset';

import AssetHolder from './AssetHolder';
import AssetStatusBadge from './AssetStatusBadge';

// Nilai khusus di dropdown untuk "dipakai bersama".
const PUBLIC_OPTION = '__public__';

interface AssignAssetModalProps {
  asset: AssetListItem | null;
  onClose: () => void;
  assignment: ReturnType<typeof useAssignAsset>;
}

function AssignAssetModal({ asset, onClose, assignment }: AssignAssetModalProps) {
  const [employeeId, setEmployeeId] = useState('');

  const {
    employees,
    isLoadingEmployees,
    isSubmitting,
    error,
    clearError,
    assign,
  } = assignment;

  // Reset pilihan setiap kali asset yang dibuka berganti.
  useEffect(() => {
    setEmployeeId('');
    clearError();
  }, [asset?.id, clearError]);

  if (!asset) return null;

  // Pemegang saat ini tidak perlu muncul di pilihan.
  const options = employees.filter((employee) => employee.id !== asset.holderId);

  const isPublicSelected = employeeId === PUBLIC_OPTION;

  const handleSubmit = async () => {
    if (!employeeId || isSubmitting) return;

    const success = await assign(
      asset.id,
      isPublicSelected ? null : employeeId
    );

    if (success) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !isSubmitting) {
          onClose();
        }
      }}
    >
      <div className="flex w-full max-w-lg flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">

        {/* HEADER */}
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <UserPlus size={22} />
            </div>

            <div>
              <h2 className="text-lg font-bold text-slate-800">
                Assign Asset
              </h2>

              <p className="mt-1 text-xs text-slate-500">
                {asset.assetTag} · {asset.itemName}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 disabled:opacity-50"
          >
            <X size={20} />
          </button>
        </div>

        {/* BODY */}
        <div className="space-y-5 px-6 py-6">

          {/* ASSET SAAT INI */}
          <div className="grid grid-cols-2 gap-4 rounded-xl border border-slate-200 p-4">
            <div>
              <p className="text-xs text-slate-400">Current Holder</p>
              <div className="mt-1 text-sm">
                <AssetHolder asset={asset} />
              </div>
            </div>

            <div>
              <p className="text-xs text-slate-400">Status</p>
              <div className="mt-1">
                <AssetStatusBadge status={asset.status} />
              </div>
            </div>
          </div>

          {/* ERROR */}
          {error && (
            <div className="flex gap-3 rounded-xl border border-red-200 bg-red-50 p-3">
              <AlertCircle size={17} className="mt-0.5 shrink-0 text-red-500" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {/* PILIH EMPLOYEE */}
          <div>
            <label
              htmlFor="assign-employee"
              className="mb-1.5 block text-xs font-semibold text-slate-600"
            >
              Assign To
              <span className="ml-0.5 text-red-500">*</span>
            </label>

            <select
              id="assign-employee"
              value={employeeId}
              onChange={(event) => setEmployeeId(event.target.value)}
              disabled={isLoadingEmployees || isSubmitting}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:opacity-60"
            >
              <option value="">
                {isLoadingEmployees ? 'Loading employees...' : 'Select employee or Public'}
              </option>

              {/* Asset yang sudah Public tidak perlu pilihan ini lagi */}
              {!asset.isPublic && (
                <option value={PUBLIC_OPTION}>
                  Public — shared by everyone
                </option>
              )}

              {/* Daftar employee aktif */}
              {options.map((employee) => (
                <option key={employee.id} value={employee.id}>
                  {employee.fullName} ({employee.employeeNumber}) — {employee.departmentName}
                </option>
              ))}
            </select>

            <p className="mt-1.5 text-xs text-slate-400">
              {isPublicSelected
                ? 'The asset will become In Use without a holder, and anyone can use it or report it for maintenance.'
                : 'The asset status will become In Use and it will be held by the selected employee.'}
            </p>
          </div>
        </div>

        {/* FOOTER */}
        <div className="flex justify-end gap-3 border-t border-slate-100 px-6 py-5">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={() => void handleSubmit()}
            disabled={!employeeId || isSubmitting}
            className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSubmitting ? (
              <LoaderCircle size={16} className="animate-spin" />
            ) : (
              <UserPlus size={16} />
            )}
            {isSubmitting ? 'Assigning...' : 'Assign'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default AssignAssetModal;
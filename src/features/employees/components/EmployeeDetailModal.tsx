import type { ReactNode } from 'react';

import {
  X,
  UserRound,
  KeyRound,
  Boxes,
  AlertCircle,
  LoaderCircle,
} from 'lucide-react';

import { useEmployeeDetail } from '../hooks/useEmployeeDetail';

import { formatDate } from '../utils/employee.utils';

import EmployeeStatusBadge from './EmployeeStatusBadge';
import AssetStatusBadge from '../../assets/components/AssetStatusBadge';

interface EmployeeDetailModalProps {
  employeeId: string | null;
  onClose: () => void;
}

// Satu kotak info (label kecil + nilai).
function InfoField({
  label,
  value,
  className = '',
}: {
  label: string;
  value: ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <p className="text-xs text-slate-400">{label}</p>

      <div className="mt-1 text-sm font-semibold text-slate-800">
        {value || '-'}
      </div>
    </div>
  );
}

function EmployeeDetailModal({ employeeId, onClose }: EmployeeDetailModalProps) {
  const { employee, isLoading, error } = useEmployeeDetail(employeeId);

  if (!employeeId) return null;

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <div className="flex max-h-[92vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">

        {/* HEADER */}
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <UserRound size={22} />
            </div>

            <div>
              <h2 className="text-lg font-bold text-slate-800">
                {employee?.fullName ?? 'Employee Details'}
              </h2>

              <p className="mt-1 text-xs text-slate-500">
                {employee?.employeeNumber ?? 'Loading...'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
          >
            <X size={20} />
          </button>
        </div>

        {/* BODY */}
        <div className="min-h-0 flex-1 space-y-6 overflow-y-auto px-6 py-6">

          {/* LOADING */}
          {isLoading && (
            <div className="py-16 text-center">
              <LoaderCircle size={28} className="mx-auto animate-spin text-blue-500" />

              <p className="mt-3 text-sm text-slate-500">
                Loading employee details...
              </p>
            </div>
          )}

          {/* ERROR */}
          {!isLoading && error && (
            <div className="flex gap-3 rounded-xl border border-red-200 bg-red-50 p-4">
              <AlertCircle size={19} className="mt-0.5 shrink-0 text-red-500" />

              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {!isLoading && employee && (
            <>
              {/* PROFILE */}
              <section>
                <h3 className="mb-4 text-sm font-bold text-slate-800">
                  Employee Information
                </h3>

                <div className="grid grid-cols-1 gap-4 rounded-xl border border-slate-200 p-4 sm:grid-cols-2">
                  <InfoField label="Full Name" value={employee.fullName} />
                  <InfoField label="Email" value={employee.email} />
                  <InfoField label="Department" value={employee.departmentName} />
                  <InfoField label="Manager" value={employee.managerName} />
                  <InfoField label="Hire Date" value={formatDate(employee.hireDate)} />
                  <InfoField
                    label="Status"
                    value={<EmployeeStatusBadge status={employee.employeeStatus} />}
                  />
                  <InfoField label="Subordinates" value={`${employee.subordinateCount} active employee(s)`} />
                  {employee.terminatedAt && (
                    <InfoField label="Terminated At" value={formatDate(employee.terminatedAt)} />
                  )}
                </div>
              </section>

              {/* ACCOUNT */}
              <section>
                <div className="mb-4 flex items-center gap-2">
                  <KeyRound size={17} className="text-slate-500" />

                  <h3 className="text-sm font-bold text-slate-800">
                    Account
                  </h3>
                </div>

                {employee.account ? (
                  <div className="grid grid-cols-1 gap-4 rounded-xl border border-slate-200 p-4 sm:grid-cols-2">
                    <InfoField label="Username" value={employee.account.userName} />

                    <InfoField
                      label="Account Status"
                      value={
                        employee.account.isActive ? (
                          <span className="text-emerald-600">Active</span>
                        ) : (
                          <span className="text-red-600">Inactive</span>
                        )
                      }
                    />

                    <InfoField
                      label="Roles"
                      className="sm:col-span-2"
                      value={
                        <div className="flex flex-wrap gap-2">
                          {employee.account.roles.map((role) => (
                            <span
                              key={role.id}
                              className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700"
                            >
                              {role.roleName}
                            </span>
                          ))}
                        </div>
                      }
                    />
                  </div>
                ) : (
                  <div className="rounded-xl border border-dashed border-slate-200 p-6 text-center text-sm text-slate-400">
                    This employee has no account.
                  </div>
                )}
              </section>

              {/* ASSETS */}
              <section>
                <div className="mb-4 flex items-center gap-2">
                  <Boxes size={17} className="text-slate-500" />

                  <h3 className="text-sm font-bold text-slate-800">
                    Assets Held ({employee.assets.length})
                  </h3>
                </div>

                {employee.assets.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-slate-200 p-6 text-center text-sm text-slate-400">
                    No assets held.
                  </div>
                ) : (
                  <div className="overflow-hidden rounded-xl border border-slate-200">
                    <table className="w-full text-left text-sm">
                      <thead className="bg-slate-50 text-xs text-slate-500">
                        <tr>
                          <th className="px-4 py-3">Asset Tag</th>
                          <th className="px-4 py-3">Item</th>
                          <th className="px-4 py-3">Status</th>
                        </tr>
                      </thead>

                      <tbody className="divide-y divide-slate-100">
                        {employee.assets.map((asset) => (
                          <tr key={asset.id}>
                            <td className="px-4 py-3 font-semibold text-blue-600">
                              {asset.assetTag}
                            </td>

                            <td className="px-4 py-3 text-slate-700">
                              {asset.itemName}
                            </td>

                            <td className="px-4 py-3">
                              <AssetStatusBadge status={asset.status} />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </section>
            </>
          )}
        </div>

        {/* FOOTER */}
        <div className="flex justify-end border-t border-slate-100 bg-white px-6 py-5">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

export default EmployeeDetailModal;
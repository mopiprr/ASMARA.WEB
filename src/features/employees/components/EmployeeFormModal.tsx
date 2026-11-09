import type { FormEvent, ReactNode } from 'react';

import {
  X,
  UserPlus,
  AlertCircle,
  LoaderCircle,
} from 'lucide-react';

import type { useEmployeeForm } from '../hooks/useEmployeeForm';

import { ROLE_EMPLOYEE } from '../utils/employee.utils';

interface EmployeeFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  form: ReturnType<typeof useEmployeeForm>;
}

const inputClass =
  'w-full rounded-xl border bg-slate-50 px-3 py-2.5 text-sm text-slate-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:opacity-60';

// Label + input + pesan error.
function Field({
  label,
  required = false,
  error,
  children,
}: {
  label: string;
  required?: boolean;
  error?: string;
  children: ReactNode;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-semibold text-slate-600">
        {label}
        {required && <span className="ml-0.5 text-red-500">*</span>}
      </label>

      {children}

      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}

function EmployeeFormModal({ isOpen, onClose, form }: EmployeeFormModalProps) {
  if (!isOpen) return null;

  const {
    departments,
    managers,
    roles,
    isLoadingOptions,
    optionsError,
    isLoadingManagers,
    managersError,
    changeDepartment,
    values,
    errors,
    submitError,
    isSubmitting,
    setField,
    toggleRole,
    submit,
  } = form;

  const borderFor = (field: keyof typeof errors) =>
    errors[field] ? 'border-red-300' : 'border-slate-200';

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void submit();
  };

  const isDisabled = isSubmitting || isLoadingOptions;

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !isSubmitting) {
          onClose();
        }
      }}
    >
      <form
        onSubmit={handleSubmit}
        className="flex max-h-[92vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl"
      >
        {/* HEADER */}
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <UserPlus size={22} />
            </div>

            <div>
              <h2 className="text-lg font-bold text-slate-800">
                New Employee
              </h2>

              <p className="mt-1 text-xs text-slate-500">
                Create an employee together with the login account.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
          >
            <X size={20} />
          </button>
        </div>

        {/* BODY */}
        <div className="min-h-0 flex-1 space-y-6 overflow-y-auto px-6 py-6">

          {/* ERRORS */}
          {(optionsError || submitError) && (
            <div className="flex gap-3 rounded-xl border border-red-200 bg-red-50 p-4">
              <AlertCircle size={19} className="mt-0.5 shrink-0 text-red-500" />

              <p className="text-sm text-red-700">
                {optionsError || submitError}
              </p>
            </div>
          )}

          {isLoadingOptions && (
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <LoaderCircle size={16} className="animate-spin text-blue-500" />
              Loading departments, managers and roles...
            </div>
          )}

          {/* EMPLOYEE INFORMATION */}
          <section>
            <h3 className="mb-4 text-sm font-bold text-slate-800">
              Employee Information
            </h3>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="Employee Number" required error={errors.employeeNumber}>
                <input
                  type="text"
                  value={values.employeeNumber}
                  onChange={(event) => setField('employeeNumber', event.target.value)}
                  placeholder="e.g. EMP-053"
                  maxLength={20}
                  disabled={isDisabled}
                  className={`${inputClass} ${borderFor('employeeNumber')}`}
                />
              </Field>

              <Field label="Full Name" required error={errors.fullName}>
                <input
                  type="text"
                  value={values.fullName}
                  onChange={(event) => setField('fullName', event.target.value)}
                  maxLength={50}
                  disabled={isDisabled}
                  className={`${inputClass} ${borderFor('fullName')}`}
                />
              </Field>

              <Field label="Email" required error={errors.email}>
                <input
                  type="email"
                  value={values.email}
                  onChange={(event) => setField('email', event.target.value)}
                  placeholder="name@asmara.local"
                  maxLength={50}
                  disabled={isDisabled}
                  className={`${inputClass} ${borderFor('email')}`}
                />
              </Field>

              <Field label="Hire Date" required error={errors.hireDate}>
                <input
                  type="date"
                  value={values.hireDate}
                  onChange={(event) => setField('hireDate', event.target.value)}
                  disabled={isDisabled}
                  className={`${inputClass} ${borderFor('hireDate')}`}
                />
              </Field>

              <Field label="Department" required error={errors.departmentId}>
                <select
                  value={values.departmentId}
                  onChange={(event) => changeDepartment(event.target.value)}
                  disabled={isDisabled}
                  className={`${inputClass} ${borderFor('departmentId')}`}
                >
                  <option value="">Select department</option>
                  {departments.map((department) => (
                    <option key={department.id} value={department.id}>
                      {department.departmentName}
                    </option>
                  ))}
                </select>
              </Field>

              <Field label="Manager" error={errors.managerId || managersError}>
                <select
                  value={values.managerId}
                  onChange={(event) => setField('managerId', event.target.value)}
                  disabled={isDisabled || !values.departmentId || isLoadingManagers}
                  className={`${inputClass} ${borderFor('managerId')}`}
                >
                  <option value="">
                    {!values.departmentId
                      ? 'Select department first'
                      : isLoadingManagers
                        ? 'Loading managers...'
                        : 'No manager'}
                  </option>
                  {managers.map((manager) => (
                    <option key={manager.id} value={manager.id}>
                      {manager.fullName} ({manager.employeeNumber}) — {manager.departmentName}
                    </option>
                  ))}
                </select>
              </Field>
            </div>
          </section>

          {/* ACCOUNT */}
          <section>
            <h3 className="mb-4 text-sm font-bold text-slate-800">
              Login Account
            </h3>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="Username" required error={errors.userName}>
                <input
                  type="text"
                  value={values.userName}
                  onChange={(event) => setField('userName', event.target.value)}
                  placeholder="e.g. budi.hartono"
                  maxLength={50}
                  autoComplete="off"
                  disabled={isDisabled}
                  className={`${inputClass} ${borderFor('userName')}`}
                />
              </Field>

              <div className="hidden sm:block" />

              <Field label="Password" required error={errors.password}>
                <input
                  type="password"
                  value={values.password}
                  onChange={(event) => setField('password', event.target.value)}
                  placeholder="Min. 8 characters"
                  autoComplete="new-password"
                  disabled={isDisabled}
                  className={`${inputClass} ${borderFor('password')}`}
                />
              </Field>

              <Field label="Confirm Password" required error={errors.confirmPassword}>
                <input
                  type="password"
                  value={values.confirmPassword}
                  onChange={(event) => setField('confirmPassword', event.target.value)}
                  autoComplete="new-password"
                  disabled={isDisabled}
                  className={`${inputClass} ${borderFor('confirmPassword')}`}
                />
              </Field>
            </div>
          </section>

          {/* ROLES */}
          <section>
            <h3 className="text-sm font-bold text-slate-800">
              Roles
            </h3>

            <p className="mb-4 mt-1 text-xs text-slate-500">
              Employee role is always included.
            </p>

            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {roles.map((role) => {
                const isBaseRole = role.roleCode === ROLE_EMPLOYEE;
                const isChecked = isBaseRole || values.roleIds.includes(role.id);

                return (
                  <label
                    key={role.id}
                    className={`flex items-start gap-3 rounded-xl border px-4 py-3 transition ${
                      isChecked
                        ? 'border-blue-200 bg-blue-50/60'
                        : 'border-slate-200 hover:bg-slate-50'
                    } ${isBaseRole ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      disabled={isBaseRole || isDisabled}
                      onChange={() => toggleRole(role.id)}
                      className="mt-0.5 h-4 w-4 accent-blue-600"
                    />

                    <span>
                      <span className="block text-sm font-semibold text-slate-700">
                        {role.roleName}
                      </span>
                    </span>
                  </label>
                );
              })}
            </div>
          </section>
        </div>

        {/* FOOTER */}
        <div className="flex justify-end gap-3 border-t border-slate-100 bg-white px-6 py-5">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={isDisabled || Boolean(optionsError)}
            className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:opacity-50"
          >
            {isSubmitting && <LoaderCircle size={16} className="animate-spin" />}
            {isSubmitting ? 'Saving...' : 'Create Employee'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default EmployeeFormModal;
import { useCallback, useState } from 'react';

import api from '../../../services/api';

import type {
  CreateEmployeePayload,
  DepartmentOption,
  EmployeeDetail,
  EmployeeFormErrors,
  EmployeeFormValues,
  ManagerOption,
  RoleOption,
} from '../types/employee.types';

import { getApiErrorMessage } from '../utils/employee.utils';

const EMPTY_FORM: EmployeeFormValues = {
  employeeNumber: '',
  fullName: '',
  email: '',
  departmentId: '',
  managerId: '',
  hireDate: '',
  userName: '',
  password: '',
  confirmPassword: '',
  roleIds: [],
};

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const USERNAME_PATTERN = /^[a-zA-Z0-9._-]+$/;

// Validasi sederhana di frontend (backend tetap memvalidasi ulang).
function validate(values: EmployeeFormValues): EmployeeFormErrors {
  const errors: EmployeeFormErrors = {};

  if (!values.employeeNumber.trim()) errors.employeeNumber = 'Employee number is required.';
  if (!values.fullName.trim()) errors.fullName = 'Full name is required.';

  if (!values.email.trim()) errors.email = 'Email is required.';
  else if (!EMAIL_PATTERN.test(values.email.trim())) errors.email = 'Email format is invalid.';

  if (!values.departmentId) errors.departmentId = 'Department is required.';
  if (!values.hireDate) errors.hireDate = 'Hire date is required.';

  if (!values.userName.trim()) errors.userName = 'Username is required.';
  else if (!USERNAME_PATTERN.test(values.userName.trim()))
    errors.userName = 'Only letters, numbers, dot, underscore and dash.';

  if (values.password.length < 8) errors.password = 'Password must be at least 8 characters.';
  if (values.confirmPassword !== values.password) errors.confirmPassword = 'Passwords do not match.';

  return errors;
}

interface UseEmployeeFormOptions {
  onSuccess: (employee: EmployeeDetail) => void | Promise<void>;
}

export function useEmployeeForm({ onSuccess }: UseEmployeeFormOptions) {
  // ===== Dropdown options (diambil sekali saat form pertama dibuka) =====
  const [departments, setDepartments] = useState<DepartmentOption[]>([]);
  const [managers, setManagers] = useState<ManagerOption[]>([]);
  const [roles, setRoles] = useState<RoleOption[]>([]);
  const [isLoadingOptions, setIsLoadingOptions] = useState(false);
  const [optionsError, setOptionsError] = useState('');
  const [hasLoadedOptions, setHasLoadedOptions] = useState(false);

  // Manager diambil per department (setelah department dipilih).
  const [isLoadingManagers, setIsLoadingManagers] = useState(false);
  const [managersError, setManagersError] = useState('');

  // ===== Form state =====
  const [values, setValues] = useState<EmployeeFormValues>(EMPTY_FORM);
  const [errors, setErrors] = useState<EmployeeFormErrors>({});
  const [submitError, setSubmitError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadOptions = useCallback(async () => {
    if (hasLoadedOptions || isLoadingOptions) return;

    try {
      setIsLoadingOptions(true);
      setOptionsError('');

      // 2 request kecil jalan bersamaan.
      const [departmentResponse, roleResponse] = await Promise.all([
        api.get<DepartmentOption[]>('/departments'),
        api.get<RoleOption[]>('/roles'),
      ]);

      setDepartments(departmentResponse.data);
      setRoles(roleResponse.data);
      setHasLoadedOptions(true);
    } catch (err: unknown) {
      console.error('Failed to load employee form options:', err);
      setOptionsError(getApiErrorMessage(err, 'Failed to load form options.'));
    } finally {
      setIsLoadingOptions(false);
    }
  }, [hasLoadedOptions, isLoadingOptions]);

  const fetchManagers = async (departmentId: string) => {
    setManagers([]);
    setManagersError('');

    if (!departmentId) return;

    try {
      setIsLoadingManagers(true);

      const response = await api.get<ManagerOption[]>('/employees/managers', {
        params: { departmentId },
      });

      setManagers(response.data);
    } catch (err: unknown) {
      console.error('Failed to load managers:', err);
      setManagersError(getApiErrorMessage(err, 'Failed to load managers.'));
    } finally {
      setIsLoadingManagers(false);
    }
  };

  // Ganti department -> manager di-reset lalu daftar manager diambil ulang.
  const changeDepartment = (departmentId: string) => {
    setValues((current) => ({ ...current, departmentId, managerId: '' }));
    setErrors((current) => ({ ...current, departmentId: undefined, managerId: undefined }));

    void fetchManagers(departmentId);
  };

  const setField = <K extends keyof EmployeeFormValues>(
    field: K,
    value: EmployeeFormValues[K]
  ) => {
    setValues((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
  };

  const toggleRole = (roleId: number) => {
    setValues((current) => ({
      ...current,
      roleIds: current.roleIds.includes(roleId)
        ? current.roleIds.filter((id) => id !== roleId)
        : [...current.roleIds, roleId],
    }));
  };

  const resetForm = () => {
    setValues(EMPTY_FORM);
    setManagers([]);
    setManagersError('');
    setErrors({});
    setSubmitError('');
  };

  const submit = async () => {
    const validationErrors = validate(values);

    setErrors(validationErrors);
    setSubmitError('');

    if (Object.keys(validationErrors).length > 0) return;

    const payload: CreateEmployeePayload = {
      employeeNumber: values.employeeNumber.trim(),
      fullName: values.fullName.trim(),
      email: values.email.trim(),
      departmentId: values.departmentId,
      managerId: values.managerId || null,
      hireDate: values.hireDate,
      userName: values.userName.trim(),
      password: values.password,
      roleIds: values.roleIds,
    };

    try {
      setIsSubmitting(true);

      const response = await api.post<EmployeeDetail>('/employees', payload);

      resetForm();

      await onSuccess(response.data);
    } catch (err: unknown) {
      console.error('Failed to create employee:', err);

      // Error validasi backend: { errors: { EmployeeNumber: [...] } } -> tampil di field.
      const fieldErrors = (
        err as { response?: { data?: { errors?: Record<string, string[]> } } }
      ).response?.data?.errors;

      if (fieldErrors) {
        const mapped: EmployeeFormErrors = {};

        Object.entries(fieldErrors).forEach(([key, messages]) => {
          const field = (key.charAt(0).toLowerCase() + key.slice(1)) as keyof EmployeeFormValues;

          if (field in EMPTY_FORM) {
            mapped[field] = messages[0];
          }
        });

        setErrors(mapped);
      }

      setSubmitError(getApiErrorMessage(err, 'Failed to create employee.'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    departments,
    managers,
    roles,
    isLoadingOptions,
    optionsError,
    loadOptions,

    isLoadingManagers,
    managersError,
    changeDepartment,

    values,
    errors,
    submitError,
    isSubmitting,

    setField,
    toggleRole,
    resetForm,
    submit,
  };
}
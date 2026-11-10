import { useCallback, useState } from 'react';

import api from '../../../services/api';

import type { EmployeeOption } from '../types/asset.types';

import { getApiErrorMessage } from '../../employees/utils/employee.utils';

interface UseAssignAssetOptions {
  onSuccess: () => void | Promise<void>;
}

export function useAssignAsset({ onSuccess }: UseAssignAssetOptions) {
  const [employees, setEmployees] = useState<EmployeeOption[]>([]);
  const [isLoadingEmployees, setIsLoadingEmployees] = useState(false);
  const [hasLoadedEmployees, setHasLoadedEmployees] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Daftar employee aktif, diambil sekali saat modal pertama kali dibuka.
  const loadEmployees = useCallback(async () => {
    if (hasLoadedEmployees || isLoadingEmployees) return;

    try {
      setIsLoadingEmployees(true);
      setError('');

      const response = await api.get<EmployeeOption[]>('/employees/options');

      setEmployees(response.data);
      setHasLoadedEmployees(true);
    } catch (err: unknown) {
      console.error('Failed to load employees:', err);
      setError(getApiErrorMessage(err, 'Failed to load employees.'));
    } finally {
      setIsLoadingEmployees(false);
    }
  }, [hasLoadedEmployees, isLoadingEmployees]);

  const clearError = useCallback(() => setError(''), []);

  const assign = async (assetId: number, employeeId: string | null): Promise<boolean> => {
    try {
      setIsSubmitting(true);
      setError('');

      await api.post(`/assets/${assetId}/assign`, { employeeId });

      await onSuccess();

      return true;
    } catch (err: unknown) {
      console.error('Failed to assign asset:', err);
      setError(getApiErrorMessage(err, 'Failed to assign asset.'));

      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    employees,
    isLoadingEmployees,
    loadEmployees,

    isSubmitting,
    error,
    clearError,
    assign,
  };
}
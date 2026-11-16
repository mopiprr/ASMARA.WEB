import { useEffect, useState } from 'react';

import api from '../../../services/api';

import type { EmployeeDetail } from '../types/employee.types';

import { getApiErrorMessage } from '../utils/employee.utils';

export function useEmployeeDetail(employeeId: string | null) {
  const [employee, setEmployee] = useState<EmployeeDetail | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!employeeId) {
      setEmployee(null);
      setError('');
      return;
    }

    const controller = new AbortController();

    async function fetchEmployee() {
      try {
        setIsLoading(true);
        setError('');
        setEmployee(null);

        const response = await api.get<EmployeeDetail>(
          `/employees/${employeeId}`,
          { signal: controller.signal }
        );

        setEmployee(response.data);
      } catch (err: unknown) {
        if (controller.signal.aborted) return;

        console.error('Failed to fetch employee detail:', err);
        setError(getApiErrorMessage(err, 'Failed to load employee details.'));
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    }

    void fetchEmployee();

    return () => controller.abort();
  }, [employeeId]);

  return { employee, isLoading, error };
}
export const ROLE_EMPLOYEE = 'ROL-01';
export const ROLE_ADMIN = 'ROL-09';

export const EMPLOYEE_STATUSES: Record<number, { label: string; style: string }> = {
  1: { label: 'Active', style: 'bg-emerald-100 text-emerald-700' },
  2: { label: 'Terminated', style: 'bg-red-100 text-red-700' },
};

export function getEmployeeStatus(status: number) {
  return (
    EMPLOYEE_STATUSES[status] ?? {
      label: 'Unknown',
      style: 'bg-slate-100 text-slate-600',
    }
  );
}

export function formatDate(value: string | null) {
  if (!value) return '-';

  const date = new Date(value);
  const pad = (n: number) => n.toString().padStart(2, '0');

  return `${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${date.getFullYear()}`;
}

export function getApiErrorMessage(err: unknown, fallback: string) {
  const apiError = err as {
    response?: {
      data?: {
        detail?: string;
        message?: string;
        title?: string;
        errors?: Record<string, string[]>;
      };
    };
    message?: string;
  };

  const data = apiError.response?.data;
  const firstValidationError = data?.errors
    ? Object.values(data.errors)[0]?.[0]
    : undefined;

  return (
    firstValidationError ||
    data?.detail ||
    data?.message ||
    data?.title ||
    apiError.message ||
    fallback
  );
}
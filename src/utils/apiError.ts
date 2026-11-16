type ApiErrorField = 'detail' | 'message' | 'title';

interface ApiErrorData {
  detail?: string;
  message?: string;
  title?: string;
  traceId?: string;
  errors?: Record<string, string[] | string>;
}

interface ApiErrorLike {
  code?: string;
  message?: string;
  request?: unknown;
  response?: {
    status?: number;
    data?: ApiErrorData | string;
  };
}

const GENERIC_TITLES = [
  'One or more validation errors occurred.',
  'Application error',
  'An unexpected error occurred.',
];

const STATUS_MESSAGES: Record<number, string> = {
  400: 'Some of the data you entered is invalid. Please check the form and try again.',
  401: 'Your session has expired. Please log in again.',
  403: 'You do not have permission to perform this action on this ticket.',
  404: 'The ticket was not found or is no longer waiting for your action. Please refresh the list.',
  409: 'This ticket has just been updated by someone else. Please refresh and try again.',
  413: 'The uploaded file is too large. Maximum size is 5 MB.',
  422: 'This action is not allowed at the current step of the ticket. Please refresh and try again.',
};

function getFieldPrefix(field: string): string {
  const match = /items\[(\d+)\]/i.exec(field);

  return match ? `Item #${Number(match[1]) + 1}: ` : '';
}

function toReadableValidationMessage(field: string, message: string): string {
  if (field.startsWith('$') || message.includes('could not be converted')) {
    const name = field.split('.').pop()?.replace(/\[\d+\]/g, '') || 'a field';
    return `Invalid value for ${name}.`;
  }

  return message;
}

function getValidationMessages(errors: ApiErrorData['errors']): string {
  if (!errors) return '';

  const lines = Object.entries(errors).flatMap(([field, value]) =>
    (Array.isArray(value) ? value : [value]).map(
      (message) =>
        getFieldPrefix(field) + toReadableValidationMessage(field, message),
    ),
  );

  return [...new Set(lines)].join('\n');
}

export function isForbiddenError(err: unknown) {
  return (err as { response?: { status?: number } }).response?.status === 403;
}

export const getApiErrorMessage = (
  error: unknown,
  fallback: string,
  fields: ApiErrorField[] = ['detail', 'message', 'title'],
): string => {
  const apiError = error as ApiErrorLike;
  const response = apiError.response;

  if (!response) {
    if (apiError.request || apiError.code === 'ERR_NETWORK') {
      return 'Cannot connect to the server. Please check your connection and try again.';
    }

    return apiError.message || fallback;
  }

  const data =
    typeof response.data === 'object' && response.data !== null
      ? response.data
      : undefined;

  const validation = getValidationMessages(data?.errors);
  if (validation) return validation;

  const status = response.status ?? 0;

  if (status >= 500) {
    return `Server error. Please try again later or contact the administrator${
      data?.traceId ? ` (trace ID: ${data.traceId})` : ''
    }.`;
  }

  for (const field of fields) {
    const value = data?.[field];

    if (value && !GENERIC_TITLES.includes(value)) return value;
  }

  return STATUS_MESSAGES[status] ?? fallback;
};

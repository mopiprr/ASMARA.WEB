import type {
  ProcurementItem,
  ProcurementTicket,
} from '../types/procurement.types';

// ==========================================
// INITIAL FORM
// ==========================================

export const createEmptyItem = (): ProcurementItem => ({
  categoryId: '',
  itemId: '',
  itemName: '',
  quantity: '1',
  estimatedPrice: '',
  isManual: false,
});

// ==========================================
// FORMAT CURRENCY
// ==========================================

export const formatIDR = (value: string | number): string => {
  const number = Number(value);

  if (!Number.isFinite(number)) {
    return 'Rp0';
  }

  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(number);
};

// ==========================================
// FORMAT DATE
// ==========================================

export const formatDate = (value: string): string => {
  if (!value) {
    return '-';
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return '-';
  }

  return date.toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

// Format tanggal di tabel Pending Approval (contoh: 13 Nov 2026).
export const formatShortDateEn = (value: string): string =>
  new Date(value).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

// ==========================================
// STATUS LABEL
// ==========================================

export const getStatusLabel = (step: string): string => {
  if (!step) {
    return 'Created';
  }

  return step
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/_/g, ' ');
};

// ==========================================
// STATUS STYLE
// ==========================================

export const getStatusStyle = (step: string): string => {
  const status = step.toLowerCase();

  if (
    status.includes('completed') ||
    status.includes('approved')
  ) {
    return 'bg-green-50 text-green-700 border-green-200';
  }

  if (
    status.includes('reject') ||
    status.includes('cancel')
  ) {
    return 'bg-red-50 text-red-700 border-red-200';
  }

  if (
    status.includes('created') ||
    status.includes('review')
  ) {
    return 'bg-amber-50 text-amber-700 border-amber-200';
  }

  return 'bg-blue-50 text-blue-700 border-blue-200';
};

export const getStatusDot = (step: string): string => {
  const status = step.toLowerCase();

  if (status.includes('completed') || status.includes('approved')) {
    return 'bg-green-500';
  }

  if (status.includes('reject') || status.includes('cancel')) {
    return 'bg-red-500';
  }

  if (
    status.includes('created') ||
    status.includes('review') ||
    status.includes('need') ||
    status.includes('revision')
  ) {
    return 'bg-amber-500';
  }

  return 'bg-blue-500';
};

// ==========================================
// PROCUREMENT TOTAL
// ==========================================

export const getTicketTotal = (
  ticket: ProcurementTicket
): number => {
  return (ticket.procurementDetails ?? []).reduce(
    (total, item) =>
      total +
      Number(item.totalPrice ?? item.quantity * item.price),
    0
  );
};

// ==========================================
// PROCUREMENT STATUS
// ==========================================

export const isCompletedTicket = (
  ticket: ProcurementTicket
): boolean => {
  const step = ticket.currentStep.toLowerCase();

  return step.includes('completed');
};

export const isPendingTicket = (
  ticket: ProcurementTicket
): boolean => {
  const step = ticket.currentStep.toLowerCase();

  return (
    !step.includes('completed') &&
    !step.includes('rejected') &&
    !step.includes('cancelled')
  );
};

// ==========================================
// API ERROR MESSAGE
// ==========================================

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

// Judul bawaan backend yang tidak menjelaskan apa-apa ke user.
const GENERIC_TITLES = [
  'One or more validation errors occurred.',
  'Application error',
  'An unexpected error occurred.',
];

// Pesan per status HTTP jika backend tidak mengirim pesan yang jelas.
const STATUS_MESSAGES: Record<number, string> = {
  400: 'Some of the data you entered is invalid. Please check the form and try again.',
  401: 'Your session has expired. Please log in again.',
  403: 'You do not have permission to perform this action on this ticket.',
  404: 'The ticket was not found or is no longer waiting for your action. Please refresh the list.',
  409: 'This ticket has just been updated by someone else. Please refresh and try again.',
  413: 'The uploaded file is too large. Maximum size is 5 MB.',
  422: 'This action is not allowed at the current step of the ticket. Please refresh and try again.',
};

// "Items[1].Price" -> "Item #2: "
function getFieldPrefix(field: string): string {
  const match = /items\[(\d+)\]/i.exec(field);

  return match ? `Item #${Number(match[1]) + 1}: ` : '';
}

// Pesan teknis dari model binding .NET -> kalimat yang bisa dipahami user.
function toReadableValidationMessage(field: string, message: string): string {
  if (field.startsWith('$') || message.includes('could not be converted')) {
    const name = field.split('.').pop()?.replace(/\[\d+\]/g, '') || 'a field';
    return `Invalid value for ${name}.`;
  }

  return message;
}

// Gabungkan seluruh pesan validasi menjadi beberapa baris (tanpa duplikat).
function getValidationMessages(errors: ApiErrorData['errors']): string {
  if (!errors) return '';

  const lines = Object.entries(errors).flatMap(([field, value]) =>
    (Array.isArray(value) ? value : [value]).map(
      (message) => getFieldPrefix(field) + toReadableValidationMessage(field, message)
    )
  );

  return [...new Set(lines)].join('\n');
}

// Ambil pesan error yang jelas dari response API.
// Urutan: koneksi gagal -> pesan validasi per field (400) -> error server (500)
// -> detail/message/title dari backend -> pesan berdasarkan status HTTP -> fallback.
// Urutan field (detail/message/title) bisa diatur karena tiap pemanggil sebelumnya berbeda.
export const getApiErrorMessage = (
  error: unknown,
  fallback: string,
  fields: ApiErrorField[] = ['detail', 'message', 'title']
): string => {
  const apiError = error as ApiErrorLike;
  const response = apiError.response;

  // Tidak ada response sama sekali = server tidak bisa dihubungi.
  if (!response) {
    if (apiError.request || apiError.code === 'ERR_NETWORK') {
      return 'Cannot connect to the server. Please check your connection and try again.';
    }

    // Error biasa (mis. throw new Error('...') dari hook).
    return apiError.message || fallback;
  }

  const data = typeof response.data === 'object' && response.data !== null
    ? response.data
    : undefined;

  const validation = getValidationMessages(data?.errors);
  if (validation) return validation;

  const status = response.status ?? 0;

  // Error 500 dari backend tidak berisi pesan yang berguna untuk user.
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
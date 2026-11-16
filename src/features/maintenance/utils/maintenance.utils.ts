// Format tanggal & angka untuk modul Maintenance.
export { formatIDR, formatShortDateEn } from '../../../utils/formatters';
export { getApiErrorMessage } from '../../../utils/apiError';

export function formatDateTime(value: string | null) {
  if (!value) return '-';

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return '-';

  return date.toLocaleString('id-ID');
}

export const REPAIR_RESULT_LABELS: Record<number, string> = {
  1: 'Repaired',
  2: 'Unrepairable',
  3: 'Need Part',
};

// Step -> label yang mudah dibaca, mis. "INVENTORY_PART_CHECK" -> "Inventory Part Check".
export function formatStepLabel(step: string | null | undefined) {
  if (!step) return 'Created';

  return step
    .toLowerCase()
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}
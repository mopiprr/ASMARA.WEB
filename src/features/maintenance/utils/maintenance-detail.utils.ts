
export interface RequiredPart {
  itemName: string;
  note: string;
}

export function formatDate(value: string | null) {
  if (!value) return '-';

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return '-';

  return date.toLocaleString('id-ID', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
}

export function formatIDR(value: number) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(value);
}

export function parseRequiredParts(
  value?: string | null,
): RequiredPart[] {
  if (!value) return [];

  try {
    const parsed: unknown = JSON.parse(value);

    if (!Array.isArray(parsed)) return [];

    return parsed
      .filter(
        (part): part is Record<string, unknown> =>
          typeof part === 'object' &&
          part !== null &&
          typeof (part as Record<string, unknown>).itemName === 'string',
      )
      .map((part) => ({
        itemName: String(part.itemName),
        note: typeof part.note === 'string' ? part.note : '',
      }));
  } catch {
    return [];
  }
}

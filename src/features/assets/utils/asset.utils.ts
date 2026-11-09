// Label & warna badge per status asset (sesuai AssetStatusEnum di backend).
export const ASSET_STATUSES: Record<number, { label: string; style: string; dotStyle: string }> = {
  1: { label: 'Available', style: 'bg-emerald-50 text-emerald-700 border-emerald-200', dotStyle: 'bg-emerald-500' },
  2: { label: 'In Use', style: 'bg-blue-50 text-blue-700 border-blue-200', dotStyle: 'bg-blue-500' },
  3: { label: 'Under Maintenance', style: 'bg-amber-50 text-amber-700 border-amber-200', dotStyle: 'bg-amber-500' },
  4: { label: 'Disposed', style: 'bg-rose-50 text-rose-700 border-rose-200', dotStyle: 'bg-rose-500' },
  5: { label: 'Archived', style: 'bg-slate-100 text-slate-700 border-slate-200', dotStyle: 'bg-slate-500' },
};

export function getAssetStatus(status: number) {
  return (
    ASSET_STATUSES[status] ?? {
      label: 'Unknown',
      style: 'bg-slate-100 text-slate-600 border-slate-200',
      dotStyle: 'bg-slate-400',
    }
  );
}

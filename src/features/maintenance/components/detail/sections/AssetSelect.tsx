import type { ReplacementAssetOption } from '../../../types/maintenance.types';

import { detailInputClass } from '../../../../../components/common/NoteField';

interface AssetSelectProps {
  label: string;
  assets: ReplacementAssetOption[];
  isLoading: boolean;
  error: string;
  value: number | '';
  onChange: (value: number | '') => void;
  isProcessing: boolean;
}

// Pilih asset pengganti (Available di gudang, kategori sama dengan asset rusak).
function AssetSelect({ label, assets, isLoading, error, value, onChange, isProcessing }: AssetSelectProps) {
  return (
    <div>
      <label htmlFor="replacement-asset" className="mb-2 block text-sm font-medium text-slate-700">
        {label} <span className="text-red-500">*</span>
      </label>

      <select
        id="replacement-asset"
        value={value}
        onChange={(event) => onChange(event.target.value ? Number(event.target.value) : '')}
        disabled={isProcessing || isLoading || assets.length === 0}
        className={`${detailInputClass} bg-white`}
      >
        <option value="">
          {isLoading
            ? 'Loading available assets...'
            : assets.length === 0
              ? 'No available assets in Inventory'
              : 'Select an available asset'}
        </option>

        {assets.map((asset) => (
          <option key={asset.assetId} value={asset.assetId}>
            {asset.assetTag} - {asset.itemName} ({asset.categoryName})
          </option>
        ))}
      </select>

      {error && <p className="mt-2 whitespace-pre-line text-xs text-red-600">{error}</p>}
    </div>
  );
}

export default AssetSelect;
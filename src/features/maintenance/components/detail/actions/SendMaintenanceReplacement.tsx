
import { LoaderCircle, Send } from 'lucide-react';

interface ReplacementAssetOption {
  assetId: number;
  assetTag: string;
  itemName: string;
  categoryName: string;
}

interface SendMaintenanceReplacementProps {
  assets: ReplacementAssetOption[];
  selectedAssetId: number | '';
  isProcessing: boolean;
  onAssetChange: (value: number | '') => void;
  onSendReplacement: () => void;
}

export default function SendMaintenanceReplacement({
  assets,
  selectedAssetId,
  isProcessing,
  onAssetChange,
  onSendReplacement,
}: SendMaintenanceReplacementProps) {
  return (
    <div className="space-y-3 rounded-xl border border-green-200 bg-green-50/50 p-4">
      <div>
        <h4 className="text-sm font-semibold text-slate-800">
          Send Replacement Asset
        </h4>
        <p className="mt-1 text-xs text-slate-500">
          Select an available asset from Inventory to replace the requester's damaged asset.
        </p>
      </div>

      <div>
        <label
          htmlFor="sendReplacementAsset"
          className="mb-2 block text-sm font-medium text-slate-700"
        >
          Select Available Asset
        </label>

        <select
          id="sendReplacementAsset"
          value={selectedAssetId}
          onChange={(event) =>
            onAssetChange(
              event.target.value ? Number(event.target.value) : '',
            )
          }
          disabled={isProcessing || assets.length === 0}
          className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-green-500"
        >
          <option value="">
            {assets.length === 0
              ? 'No available assets in Inventory'
              : 'Select an available asset'}
          </option>

          {assets.map((asset) => (
            <option key={asset.assetId} value={asset.assetId}>
              {asset.assetTag} - {asset.itemName}
            </option>
          ))}
        </select>
      </div>

      <div className="flex justify-end">
        <button
          type="button"
          onClick={onSendReplacement}
          disabled={isProcessing || selectedAssetId === ''}
          className="inline-flex items-center gap-2 rounded-xl bg-green-600 px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
        >
          {isProcessing ? (
            <LoaderCircle size={17} className="animate-spin" />
          ) : (
            <Send size={17} />
          )}
          Send Replacement to Requester
        </button>
      </div>
    </div>
  );
}

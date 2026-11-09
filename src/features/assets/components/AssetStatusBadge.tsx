import { getAssetStatus } from '../utils/asset.utils';

interface AssetStatusBadgeProps {
  status: number;
}

function AssetStatusBadge({ status }: AssetStatusBadgeProps) {
  const { label, style } = getAssetStatus(status);

  return (
    <span className={`inline-flex rounded-full px-3 py-1.5 text-xs font-semibold ${style}`}>
      {label}
    </span>
  );
}

export default AssetStatusBadge;
import { getAssetStatus } from '../utils/asset.utils';

interface AssetStatusBadgeProps {
  status: number;
}

function AssetStatusBadge({ status }: AssetStatusBadgeProps) {
  const { label, style, dotStyle } = getAssetStatus(status);

  return (
    <span
      className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border px-2.5 py-0.5 text-xs font-semibold ${style}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${dotStyle}`} />
      {label}
    </span>
  );
}

export default AssetStatusBadge;

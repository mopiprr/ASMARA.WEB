import { Users } from 'lucide-react';
import type { AssetListItem } from '../types/asset.types';

interface AssetHolderProps {
  asset: AssetListItem;
}

// Pemegang asset: nama orang, "Public" kalau dipakai bersama, atau "-".
function AssetHolder({ asset }: AssetHolderProps) {
  if (asset.holderName) {
    return (
      <div>
        <p className="font-semibold text-slate-800 line-clamp-1">
          {asset.holderName}
        </p>

        {asset.holderDepartment && (
          <p className="mt-0.5 text-xs text-slate-400">
            {asset.holderDepartment}
          </p>
        )}
      </div>
    );
  }

  if (asset.isPublic) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-violet-200 bg-violet-50 px-2.5 py-0.5 text-xs font-semibold text-violet-700">
        <Users size={12} />
        Public
      </span>
    );
  }

  return <span className="text-slate-400 text-xs">-</span>;
}

export default AssetHolder;
